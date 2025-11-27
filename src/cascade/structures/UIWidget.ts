// src/cascade/structures/UIWidget.ts
// UIWidget wrapper class with hierarchical per-player UI tracking.

import { GameArray } from "../core/GameArray";
import { Color } from "../core/Color";
import { Vector } from "../core/Vector";
import { Player } from "./Player";
import { Preserve } from "../decorators";
import { registerEventHandler } from "../core/EventDispatcher";
import { WrapperRegistry } from "../core/WrapperRegistry";

// ============================================================================
// UI Hierarchy Management System - Multi-Scope Support
// ============================================================================

/**
 * UI scope types: Global (all), Team (team members), Player (individual).
 * @internal
 */
export enum UIScope {
    /** Global scope - visible to all players */
    GLOBAL = 0,
    /** Team scope - visible to team members only */
    TEAM = 1,
    /** Player scope - visible to specific players only */
    PLAYER = 2,
}

/**
 * Scope context describing which players/teams can see a widget.
 * Each level in the hierarchy can have a different scope from its parent.
 * @internal
 */
export type UIScopeContext =
    | { scope: UIScope.GLOBAL }
    | { scope: UIScope.TEAM; teamId: number }
    | { scope: UIScope.PLAYER; playerId: number };

/**
 * Type guard functions for UIScopeContext discriminated union
 * @internal
 */
function isPlayerScope(
    scope: UIScopeContext
): scope is { scope: UIScope.PLAYER; playerId: number } {
    return scope.scope === UIScope.PLAYER;
}

function isTeamScope(
    scope: UIScopeContext
): scope is { scope: UIScope.TEAM; teamId: number } {
    return scope.scope === UIScope.TEAM;
}

/**
 * Represents a node in the UI hierarchy tree.
 * @internal
 */
interface UIHierarchyNode {
    name: string;
    scopeContext: UIScopeContext;
    parentPath: string | null;
    widgetHandle: mod.UIWidget;
    children: Map<string, UIHierarchyNode>;
}

/**
 * Manages the UI hierarchy with support for Global, Team, and Player scopes.
 * Each widget can have a different scope than its parent.
 * Example path formats:
 *   ROOT/GlobalMenu (all global)
 *   ROOT/GlobalMenu/TEAM-1-Status (global parent, team child)
 *   ROOT/TEAM-1-TeamArea/PLAYER-5-Name (team parent, player child)
 * @internal
 */
@Preserve()
class UIHierarchyManager {
    private static readonly ROOT_NAME = "*ROOT*";

    // Single global hierarchy tree
    private rootNode: UIHierarchyNode;

    // Fast path lookups: path -> node
    private pathIndex = new Map<string, UIHierarchyNode>();

    // Fast handle lookups: handle -> path
    private handleIndex = new Map<mod.UIWidget, string>();

    // Scope-based lookups: scope descriptor -> Set<path>
    private scopeIndex = new Map<string, Set<string>>();

    constructor() {
        this.rootNode = {
            name: UIHierarchyManager.ROOT_NAME,
            scopeContext: { scope: UIScope.GLOBAL },
            parentPath: null,
            children: new Map(),
            widgetHandle: mod.GetUIRoot(),
        };
        this.pathIndex.set(UIHierarchyManager.ROOT_NAME, this.rootNode);
    }

    /**
     * Format a scope descriptor string for indexing.
     * e.g., "GLOBAL", "TEAM:1", "PLAYER:8"
     */
    private _formatScopeKey(scope: UIScopeContext): string {
        switch (scope.scope) {
            case UIScope.GLOBAL:
                return "GLOBAL";
            case UIScope.TEAM:
                return `TEAM:${scope.teamId}`;
            case UIScope.PLAYER:
                return `PLAYER:${scope.playerId}`;
        }
    }

    /**
     * Format the path segment for a widget name with scope.
     * e.g., "Button1" (global) or "[TEAM-1]Status" or "[PLAYER-5]Name"
     */
    private _formatPathSegment(name: string, scope: UIScopeContext): string {
        switch (scope.scope) {
            case UIScope.GLOBAL:
                return name;
            case UIScope.TEAM:
                return `[TEAM-${scope.teamId}]${name}`;
            case UIScope.PLAYER:
                return `[PLAYER-${scope.playerId}]${name}`;
        }
    }

    /**
     * Register a widget in the hierarchy.
     * @param widgetName Display name of the widget (e.g., "Button1", "Shop")
     * @param scope Scope context for this widget (GLOBAL, TEAM, or PLAYER)
     * @param parentPath Full hierarchical path of parent (null for root children)
     * @param widgetHandle The mod widget handle
     * @returns Full hierarchical path of the widget
     */
    public registerWidget(
        widgetName: string,
        scope: UIScopeContext,
        parentPath: string | null,
        widgetHandle: mod.UIWidget
    ): string {
        // Find parent node
        let parent: UIHierarchyNode;
        if (!parentPath || parentPath === UIHierarchyManager.ROOT_NAME) {
            parent = this.rootNode;
        } else {
            parent = this.pathIndex.get(parentPath) || this.rootNode;
        }

        // Build full path with scope indicator
        const pathSegment = this._formatPathSegment(widgetName, scope);
        const fullPath =
            parent === this.rootNode
                ? `${parent.name}/${pathSegment}`
                : `${parent.name}/${pathSegment}`;

        // Create node
        const node: UIHierarchyNode = {
            name: widgetName,
            scopeContext: scope,
            parentPath: parent.name,
            children: new Map(),
            widgetHandle,
        };

        // Add to parent's children (use full path as key for uniqueness)
        parent.children.set(fullPath, node);

        // Index in path map
        this.pathIndex.set(fullPath, node);

        // Index by handle
        this.handleIndex.set(widgetHandle, fullPath);

        // Index by scope for cleanup
        const scopeKey = this._formatScopeKey(scope);
        if (!this.scopeIndex.has(scopeKey)) {
            this.scopeIndex.set(scopeKey, new Set());
        }
        this.scopeIndex.get(scopeKey)?.add(fullPath);

        return fullPath;
    }

    /**
     * Get the full path of a widget by its handle.
     */
    public getPath(widgetHandle: mod.UIWidget): string | null {
        return this.handleIndex.get(widgetHandle) || null;
    }

    /**
     * Look up a widget node by its path.
     */
    public getNodeByPath(path: string): UIHierarchyNode | null {
        return this.pathIndex.get(path) || null;
    }

    /**
     * Get all children of a widget.
     */
    public getChildren(parentPath: string): UIHierarchyNode[] {
        const parent = this.pathIndex.get(parentPath);
        return parent ? Array.from(parent.children.values()) : [];
    }

    /**
     * Remove a widget from the hierarchy.
     */
    public unregisterWidget(widgetHandle: mod.UIWidget): void {
        const path = this.handleIndex.get(widgetHandle);
        if (!path) return;

        const node = this.pathIndex.get(path);
        if (node) {
            // Remove from parent
            if (node.parentPath) {
                const parent = this.pathIndex.get(node.parentPath);
                if (parent) {
                    // Find and remove from parent's children
                    parent.children.forEach((child, key) => {
                        if (child === node) {
                            parent.children.delete(key);
                        }
                    });
                }
            }

            // Remove from path index
            this.pathIndex.delete(path);

            // Remove from scope index
            const scopeKey = this._formatScopeKey(node.scopeContext);
            this.scopeIndex.get(scopeKey)?.delete(path);
        }

        // Remove from handle index
        this.handleIndex.delete(widgetHandle);
    }

    /**
     * Clean up all widgets for a specific player.
     * Removes all PLAYER-scoped widgets with the given player ID.
     */
    public cleanupPlayerUI(playerId: number): void {
        const scopeKey = `PLAYER:${playerId}`;
        const paths = Array.from(this.scopeIndex.get(scopeKey) || []);

        for (const path of paths) {
            const node = this.pathIndex.get(path);
            if (node?.widgetHandle) {
                this.unregisterWidget(node.widgetHandle);
            }
        }
    }

    /**
     * Purge ALL UI widgets associated with a player from any level of the hierarchy.
     * This removes:
     * - All PLAYER-scoped widgets for this player
     * - All widgets that are children of player-scoped widgets
     * - All global widgets where this player is a child participant
     * This is a comprehensive cleanup useful when a player completely leaves or resets their UI state.
     */
    public purgeAllPlayerUI(playerId: number): void {
        const toRemove: mod.UIWidget[] = [];

        // Collect all widgets that need to be removed
        this.handleIndex.forEach((path, handle) => {
            const node = this.pathIndex.get(path);
            if (!node) return;

            let shouldRemove = false;

            // Check if this is a PLAYER-scoped widget for this player
            if (
                isPlayerScope(node.scopeContext) &&
                node.scopeContext.playerId === playerId
            ) {
                shouldRemove = true;
            }

            // Check if this widget is a descendant of a player-scoped widget for this player
            if (!shouldRemove && node.parentPath) {
                let currentPath: string | null = node.parentPath;
                while (currentPath) {
                    const parent = this.pathIndex.get(currentPath);
                    if (!parent) break;

                    if (
                        isPlayerScope(parent.scopeContext) &&
                        parent.scopeContext.playerId === playerId
                    ) {
                        shouldRemove = true;
                        break;
                    }

                    currentPath = parent.parentPath;
                }
            }

            if (shouldRemove) {
                toRemove.push(handle);
            }
        });

        // Remove all collected widgets
        for (const handle of toRemove) {
            const path = this.handleIndex.get(handle);
            if (path) {
                const node = this.pathIndex.get(path);
                if (node?.widgetHandle) {
                    this.unregisterWidget(node.widgetHandle);
                }
            }
        }
    }

    /**
     * Clean up all widgets for a specific team.
     * Removes all TEAM-scoped widgets with the given team ID.
     */
    public cleanupTeamUI(teamId: number): void {
        const scopeKey = `TEAM:${teamId}`;
        const paths = Array.from(this.scopeIndex.get(scopeKey) || []);

        for (const path of paths) {
            const node = this.pathIndex.get(path);
            if (node?.widgetHandle) {
                this.unregisterWidget(node.widgetHandle);
            }
        }
    }

    /**
     * Get all widgets with a specific scope.
     */
    public getWidgetsByScope(scope: UIScopeContext): UIHierarchyNode[] {
        const scopeKey = this._formatScopeKey(scope);
        const paths = this.scopeIndex.get(scopeKey) || new Set();
        return Array.from(paths)
            .map((path) => this.pathIndex.get(path))
            .filter((node) => node !== undefined) as UIHierarchyNode[];
    }

    /**
     * Print the hierarchy tree for debugging.
     */
    public debugPrintHierarchy(): void {
        console.log("=== UI Hierarchy ===");
        this._debugPrintNode(this.rootNode, 0);
    }

    private _debugPrintNode(node: UIHierarchyNode, depth: number): void {
        const indent = "  ".repeat(depth);
        const scopeStr =
            node.scopeContext.scope === UIScope.GLOBAL
                ? "GLOBAL"
                : isTeamScope(node.scopeContext)
                ? `TEAM-${node.scopeContext.teamId}`
                : isPlayerScope(node.scopeContext)
                ? `PLAYER-${node.scopeContext.playerId}`
                : "UNKNOWN";
        console.log(`${indent}${node.name} (${scopeStr})`);
        for (const child of node.children.values()) {
            this._debugPrintNode(child, depth + 1);
        }
    }
}

// Global hierarchy manager instance
const hierarchyManager = new UIHierarchyManager();

// ============================================================================
// UI Widget Props Interfaces
// ============================================================================

/**
 * Vector shorthand type - can be Vector object, array [x, y, z], or GameArray containing numbers [x, y, z]
 */
export type VectorLike = Vector | [number, number, number] | GameArray<number>;

/**
 * Helper to convert VectorLike to Vector
 */
function toVector(v: VectorLike): Vector {
    if (Array.isArray(v)) {
        // Handle primitive array [x, y, z]
        return new Vector(v[0], v[1], v[2]);
    }
    if (v instanceof GameArray) {
        // Handle GameArray<number> - extract first 3 elements as x, y, z
        if (v.length() < 3) {
            return new Vector(0, 0, 0);
        }
        const x = v.at(0) ?? 0;
        const y = v.at(1) ?? 0;
        const z = v.at(2) ?? 0;
        return new Vector(x, y, z);
    }
    // Handle Vector object
    return v;
}

/**
 * Base props for all UI widgets.
 */
export interface UIWidgetBaseProps {
    /** The widget name. If not provided, a unique name is auto-generated. */
    name?: string;
    /** The widget position. Defaults to (0, 0, 0). Can be Vector or [x, y, z]. */
    position?: VectorLike;
    /** The widget size. Defaults to (100, 100, 0). Can be Vector or [x, y, z]. */
    size?: VectorLike;
    /** The widget anchor point. Defaults to UIAnchor.TopLeft. */
    anchor?: mod.UIAnchor;
    /** Whether the widget is visible. Defaults to true. */
    isVisible?: boolean;
    /** The widget depth. Defaults to UIDepth.Default. */
    depth?: mod.UIDepth;
    /** The background color with alpha. Defaults to black with 0 alpha. */
    backgroundColor?: Color;
    /** The background fill type. Defaults to UIBgFill.Solid. */
    bgFill?: mod.UIBgFill;
    /** The widget padding. Defaults to 0. */
    padding?: number;
}

/**
 * Props for creating a container widget.
 */
export interface UIContainerProps extends UIWidgetBaseProps {}

/**
 * Props for creating a text widget.
 */
export interface UITextProps extends UIWidgetBaseProps {
    /** The text message to display. Defaults to empty string. */
    message?: mod.Message | string;
    /** The text color with alpha. Defaults to white with full opacity. */
    textColor?: Color;
    /** The text size. Defaults to 1. */
    textSize?: number;
    /** The text anchor. Defaults to UIAnchor.TopLeft. */
    textAnchor?: mod.UIAnchor;
}

/**
 * Props for creating an image widget.
 */
export interface UIImageProps extends UIWidgetBaseProps {
    /** The image type. Required for image widgets. */
    imageType?: mod.UIImageType;
    /** The image color with alpha. Defaults to white with full opacity. */
    imageColor?: Color;
}

/**
 * Props for creating a weapon image widget.
 * Weapon images are specialized image widgets for displaying weapon icons.
 */
export interface UIWeaponImageProps extends UIWidgetBaseProps {
    /** The weapon type. Required for weapon image widgets. */
    weapon: mod.Weapons;
    /** The image color with alpha. Defaults to white with full opacity. */
    imageColor?: Color;
}

/**
 * Props for creating a button widget.
 */
export interface UIButtonProps extends UIWidgetBaseProps {
    /** Whether the button is enabled. Defaults to true. */
    isEnabled?: boolean;
    /** Base state color with alpha. Defaults to white with full opacity. */
    buttonColorBase?: Color;
    /** Hover state color with alpha. Defaults to 50% gray with full opacity. */
    buttonColorHover?: Color;
    /** Pressed state color with alpha. Defaults to 30% gray with full opacity. */
    buttonColorPressed?: Color;
    /** Focused state color with alpha. Defaults to white with full opacity. */
    buttonColorFocused?: Color;
    /** Disabled state color with alpha. Defaults to 80% gray with full opacity. */
    buttonColorDisabled?: Color;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_UI_WIDGET_PROPS: Required<UIWidgetBaseProps> = {
    name: "",
    position: new Vector(0, 0, 0),
    size: new Vector(100, 100, 0),
    anchor: mod.UIAnchor.TopLeft,
    isVisible: true,
    depth: mod.UIDepth.BelowGameUI,
    backgroundColor: new Color(0, 0, 0, 0),
    bgFill: mod.UIBgFill.Solid,
    padding: 0,
};

// Note: Message cannot be instantiated directly, so we use a helper function
function getDefaultMessage(): mod.Message | string {
    return "";
}

const DEFAULT_UI_TEXT_PROPS: Omit<Required<UITextProps>, "message"> & {
    message: mod.Message | string;
} = {
    ...DEFAULT_UI_WIDGET_PROPS,
    message: getDefaultMessage(),
    textColor: new Color(1, 1, 1, 1),
    textSize: 1,
    textAnchor: mod.UIAnchor.TopLeft,
};

const DEFAULT_UI_IMAGE_PROPS: Required<UIImageProps> = {
    ...DEFAULT_UI_WIDGET_PROPS,
    imageType: mod.UIImageType.None,
    imageColor: new Color(1, 1, 1, 1),
};

const DEFAULT_UI_WEAPON_IMAGE_PROPS: Omit<
    Required<UIWeaponImageProps>,
    "weapon"
> & { weapon: mod.Weapons } = {
    ...DEFAULT_UI_WIDGET_PROPS,
    weapon: mod.Weapons.AssaultRifle_AK4D,
    imageColor: new Color(1, 1, 1, 1),
};

const DEFAULT_UI_BUTTON_PROPS: Required<UIButtonProps> = {
    ...DEFAULT_UI_WIDGET_PROPS,
    isEnabled: true,
    buttonColorBase: new Color(1, 1, 1, 1),
    buttonColorHover: new Color(0.5, 0.5, 0.5, 1),
    buttonColorPressed: new Color(0.3, 0.3, 0.3, 1),
    buttonColorFocused: new Color(1, 1, 1, 1),
    buttonColorDisabled: new Color(0.8, 0.8, 0.8, 1),
};

const rootWidgetHandle = mod.GetUIRoot();
const rootWidgetName = "~~~~CASCADE-ROOT-WIDGET~~~~";
mod.SetUIWidgetName(rootWidgetHandle, rootWidgetName);

let widgetCount = 0;

// ============================================================================
// Helper Functions for Props Merging
// ============================================================================

function generateUniqueWidgetName(): string {
    return `CascadeWidget<${widgetCount++}>`;
}

function mergeProps<T extends UIWidgetBaseProps>(
    defaults: Required<T>,
    props?: Partial<T>
): Required<T> {
    return {
        ...defaults,
        ...props,
    } as Required<T>;
}

// Global map to store button event callbacks per widget
const buttonEventCallbacks = new Map<
    mod.UIWidget,
    Set<(button: UIButtonWidget, player: Player, event: ButtonEvent) => void>
>();

// Global wrapper registries for caching wrapper instances
const playerWrapperRegistry = new WrapperRegistry<mod.Player, Player>(
    (handle) => new Player(handle),
    (handle) => {
        try {
            return mod.GetObjId(handle).toString();
        } catch {
            return "";
        }
    },
    (handle) => {
        try {
            return mod.IsPlayerValid(handle);
        } catch {
            return false;
        }
    }
);

const uiButtonWrapperRegistry = new WrapperRegistry<
    mod.UIWidget,
    UIButtonWidget
>(
    (handle) => new UIButtonWidget(handle),
    (handle) => {
        try {
            // Use widget name as unique key since widgets are named
            return mod.GetUIWidgetName(handle);
        } catch {
            return "";
        }
    },
    (handle) => {
        try {
            // Check if widget handle is still valid by attempting to access it
            mod.GetUIWidgetName(handle);
            return true;
        } catch {
            return false;
        }
    }
);

// Handler for onPlayerUIButtonEvent dispatched through EventDispatcher
registerEventHandler("onPlayerUIButtonEvent", ((
    eventPlayer: mod.Player,
    eventUIWidget: mod.UIWidget,
    eventUIButtonEvent: mod.UIButtonEvent
) => {
    const callbacks = buttonEventCallbacks.get(eventUIWidget);
    if (callbacks && callbacks.size > 0) {
        // Convert mod.UIButtonEvent (0-4) to ButtonEvent (power of 2: 1, 2, 4, 8, 16)
        const buttonEvent = (2 ** eventUIButtonEvent) as ButtonEvent;
        const button = uiButtonWrapperRegistry.getOrCreate(eventUIWidget);
        const player = playerWrapperRegistry.getOrCreate(eventPlayer);

        // Call all registered callbacks for this button
        for (const callback of callbacks) {
            try {
                callback(button, player, buttonEvent);
            } catch (error) {
                console.error(`Error in button event callback: ${error}`);
            }
        }
    }
}) as (...args: unknown[]) => void);

// Handler for onPlayerLeaveGame to clean up stale wrapper instances
registerEventHandler("onPlayerLeaveGame", ((eventPlayer: mod.Player) => {
    const playerId = mod.GetObjId(eventPlayer as unknown as mod.Object);
    playerWrapperRegistry.remove(eventPlayer);
    hierarchyManager.purgeAllPlayerUI(playerId);
}) as (...args: unknown[]) => void);

/**
 * Base wrapper class for UIWidget objects, providing ergonomic access to common UI widget operations.
 * Base class for all Widgets, only directly used for the root widget.
 */
@Preserve()
export class UIWidget {
    public readonly handle: mod.UIWidget;
    private isRoot = false;

    /** The hierarchical path of this widget in the UI tree, e.g., ROOT/GlobalMenu/TEAM-1-Status */
    public hierarchyPath: string | null = null;

    /** The scope context of this widget (global, team, or player) */
    public scopeContext: UIScopeContext = { scope: UIScope.GLOBAL };

    /**
     * Constructs a UIWidget instance.
     * @param handle The handle of the UI widget.
     */
    public constructor(widget: mod.UIWidget) {
        this.handle = widget;
        this.isRoot = mod.GetUIWidgetName(this.handle) === rootWidgetName;
    }

    /**
     * Get the full hierarchical path of this widget.
     * Example: ROOT/GlobalMenu/TEAM-1-Status
     */
    public getPath(): string | null {
        if (!this.hierarchyPath) {
            this.hierarchyPath = hierarchyManager.getPath(this.handle);
        }
        return this.hierarchyPath;
    }

    /**
     * Gets the parent widget of this widget.
     */
    public get parent(): UIWidget | undefined {
        // The normal sdk function just returns a copy of the root sdk handle.
        // But this is tricky to deal with since there is no good way to compare handles currently.
        if (this.isRoot) {
            return undefined;
        }
        const parentHandle = mod.GetUIWidgetParent(this.handle);
        return parentHandle !== undefined
            ? new UIWidget(parentHandle)
            : undefined;
    }
}

/**
 * Base class for styleable UI widgets (containers, buttons, text, images).
 * This class is not meant to be directly instantiated externally.
 * Provides shared styling properties and operations for all styleable widget types.
 * @internal
 */
export abstract class UIStylableWidget extends UIWidget {
    /**
     * Deletes this UI widget and removes it from the hierarchy.
     */
    public delete(): void {
        hierarchyManager.unregisterWidget(this.handle);
        mod.DeleteUIWidget(this.handle);
    }

    // Position and Size Properties

    /**
     * Gets the position of this widget.
     */
    public get position(): Vector {
        return new Vector(mod.GetUIWidgetPosition(this.handle));
    }

    /**
     * Sets the position of this widget.
     */
    public set position(position: Vector) {
        mod.SetUIWidgetPosition(this.handle, position.getHandle());
    }

    /**
     * Gets the size of this widget.
     */
    public get size(): Vector {
        return new Vector(mod.GetUIWidgetSize(this.handle));
    }

    /**
     * Sets the size of this widget.
     */
    public set size(size: Vector) {
        mod.SetUIWidgetSize(this.handle, size.getHandle());
    }

    // Anchor and Visibility

    /**
     * Gets the anchor point of this widget.
     */
    public get anchor(): mod.UIAnchor {
        return mod.GetUIWidgetAnchor(this.handle);
    }

    /**
     * Sets the anchor point of this widget.
     */
    public set anchor(anchor: mod.UIAnchor) {
        mod.SetUIWidgetAnchor(this.handle, anchor);
    }

    /**
     * Gets the visibility of this widget.
     */
    public get isVisible(): boolean {
        return mod.GetUIWidgetVisible(this.handle);
    }

    /**
     * Sets the visibility of this widget.
     */
    public set isVisible(visible: boolean) {
        mod.SetUIWidgetVisible(this.handle, visible);
    }

    // Depth and Hierarchy
    /**
     * Gets the depth of this widget.
     */
    public get depth(): mod.UIDepth {
        return mod.GetUIWidgetDepth(this.handle);
    }

    /**
     * Sets the depth of this widget.
     */
    public set depth(depth: mod.UIDepth) {
        mod.SetUIWidgetDepth(this.handle, depth);
    }

    /**
     * Sets the parent widget of this widget.
     * Can be set to any UIWidget, including the root widget.
     */
    public set parent(parent: UIWidget) {
        mod.SetUIWidgetParent(this.handle, parent.handle);
    }

    // Background Styling

    /**
     * Gets the background color of this widget (includes alpha).
     */
    public get backgroundColor(): Color {
        const vec = new Vector(mod.GetUIWidgetBgColor(this.handle));
        const alpha = mod.GetUIWidgetBgAlpha(this.handle);
        // Create Color from the vector's x, y, z and the alpha value
        return new Color(vec.x, vec.y, vec.z, alpha);
    }

    /**
     * Sets the background color of this widget (includes alpha).
     */
    public set backgroundColor(color: Color) {
        mod.SetUIWidgetBgColor(this.handle, color.toVector().getHandle());
        mod.SetUIWidgetBgAlpha(this.handle, color.a);
    }

    /**
     * Gets the background fill type of this widget.
     */
    public get bgFill(): mod.UIBgFill {
        return mod.GetUIWidgetBgFill(this.handle);
    }

    /**
     * Sets the background fill type of this widget.
     */
    public set bgFill(bgFill: mod.UIBgFill) {
        mod.SetUIWidgetBgFill(this.handle, bgFill);
    }

    // Padding and Layout

    /**
     * Gets the padding of this widget.
     */
    public get padding(): number {
        return mod.GetUIWidgetPadding(this.handle);
    }

    /**
     * Sets the padding of this widget.
     */
    public set padding(padding: number) {
        mod.SetUIWidgetPadding(this.handle, padding);
    }

    // Widget Identity

    /**
     * Gets the name of this widget.
     */
    public get name(): string {
        return mod.GetUIWidgetName(this.handle);
    }

    /**
     * Sets the name of this widget.
     */
    public set name(name: string) {
        // while this is allowed on the root widget we are setting it ourselves to a special value
        // so that we can identify it from other widgets.
        mod.SetUIWidgetName(this.handle, name);
    }
}

/**
 * A container widget that can hold other UI elements.
 * Only containers can have children added to them.
 */
@Preserve()
export class UIContainerWidget extends UIStylableWidget {
    /**
     * Adds a child container widget.
     * @param props Optional props object containing name, position, size, anchor, and styling properties.
     * @param scope Optional scope context (defaults to parent's scope or GLOBAL if parent is root).
     * @returns The newly created container widget for chaining.
     */
    public addContainer(
        props?: Partial<UIContainerProps>,
        scope?: UIScopeContext
    ): UIContainerWidget {
        const merged = mergeProps(DEFAULT_UI_WIDGET_PROPS, props);
        const name = merged.name || generateUniqueWidgetName();
        const widgetScope = scope ?? this.scopeContext;

        // Normalize vectors (convert array to Vector if needed)
        const position = toVector(merged.position);
        const size = toVector(merged.size);

        mod.AddUIContainer(
            name,
            position.getHandle(),
            size.getHandle(),
            merged.anchor,
            this.handle,
            merged.isVisible,
            merged.padding,
            merged.backgroundColor.toVector().getHandle(),
            merged.backgroundColor.a,
            merged.bgFill
        );
        const widget = mod.FindUIWidgetWithName(name, this.handle);
        const container = new UIContainerWidget(widget);

        // Register in hierarchy with explicit scope
        container.scopeContext = widgetScope;
        const path = hierarchyManager.registerWidget(
            name,
            widgetScope,
            this.hierarchyPath,
            widget
        );
        container.hierarchyPath = path;

        // Apply depth if different from defaults
        if (merged.depth !== mod.UIDepth.BelowGameUI) {
            container.depth = merged.depth;
        }

        return container;
    }

    /**
     * Adds a button widget as a child.
     * @param props Optional props object containing button properties.
     * @param scope Optional scope context (defaults to parent's scope or GLOBAL if parent is root).
     * @returns The newly created button widget for chaining.
     */
    public addButton(
        props?: Partial<UIButtonProps>,
        scope?: UIScopeContext
    ): UIButtonWidget {
        const merged = mergeProps(DEFAULT_UI_BUTTON_PROPS, props);
        const name = merged.name || generateUniqueWidgetName();
        const widgetScope = scope ?? this.scopeContext;

        // Normalize vectors (convert array to Vector if needed)
        const position = toVector(merged.position);
        const size = toVector(merged.size);

        mod.AddUIButton(
            name,
            position.getHandle(),
            size.getHandle(),
            merged.anchor,
            this.handle,
            merged.isVisible,
            merged.padding,
            merged.backgroundColor.toVector().getHandle(),
            merged.backgroundColor.a,
            merged.bgFill,
            merged.isEnabled,
            merged.buttonColorBase.toVector().getHandle(),
            merged.buttonColorBase.a,
            merged.buttonColorHover.toVector().getHandle(),
            merged.buttonColorHover.a,
            merged.buttonColorPressed.toVector().getHandle(),
            merged.buttonColorPressed.a,
            merged.buttonColorFocused.toVector().getHandle(),
            merged.buttonColorFocused.a,
            merged.buttonColorDisabled.toVector().getHandle(),
            merged.buttonColorDisabled.a
        );
        const widget = mod.FindUIWidgetWithName(name, this.handle);
        const button = new UIButtonWidget(widget);

        // Register in hierarchy with explicit scope
        button.scopeContext = widgetScope;
        const path = hierarchyManager.registerWidget(
            name,
            widgetScope,
            this.hierarchyPath,
            widget
        );
        button.hierarchyPath = path;

        // Apply depth if different from defaults
        if (merged.depth !== mod.UIDepth.BelowGameUI) {
            button.depth = merged.depth;
        }

        return button;
    }

    /**
     * Adds a text widget as a child.
     * @param props Optional props object containing text properties.
     * @param scope Optional scope context (defaults to parent's scope or GLOBAL if parent is root).
     * @returns The newly created text widget for chaining.
     */
    public addText(
        props?: Partial<UITextProps>,
        scope?: UIScopeContext
    ): UITextWidget {
        const merged = mergeProps(DEFAULT_UI_TEXT_PROPS, props);
        const name = merged.name || generateUniqueWidgetName();
        const widgetScope = scope ?? this.scopeContext;

        // Normalize vectors (convert array to Vector if needed)
        const position = toVector(merged.position);
        const size = toVector(merged.size);

        mod.AddUIText(
            name,
            position.getHandle(),
            size.getHandle(),
            merged.anchor,
            this.handle,
            merged.isVisible,
            merged.padding,
            merged.backgroundColor.toVector().getHandle(),
            merged.backgroundColor.a,
            merged.bgFill,
            merged.message as mod.Message,
            merged.textSize,
            merged.textColor.toVector().getHandle(),
            merged.textColor.a,
            merged.textAnchor
        );
        const widget = mod.FindUIWidgetWithName(name, this.handle);
        const text = new UITextWidget(widget);

        // Register in hierarchy with explicit scope
        text.scopeContext = widgetScope;
        const path = hierarchyManager.registerWidget(
            name,
            widgetScope,
            this.hierarchyPath,
            widget
        );
        text.hierarchyPath = path;

        // Apply depth if different from defaults
        if (merged.depth !== mod.UIDepth.BelowGameUI) {
            text.depth = merged.depth;
        }

        return text;
    }

    /**
     * Adds an image widget as a child.
     * @param props Optional props object containing image properties.
     * @param scope Optional scope context (defaults to parent's scope or GLOBAL if parent is root).
     * @returns The newly created image widget for chaining.
     */
    public addImage(
        props?: Partial<UIImageProps>,
        scope?: UIScopeContext
    ): UIImageWidget {
        const merged = mergeProps(DEFAULT_UI_IMAGE_PROPS, props);
        const name = merged.name || generateUniqueWidgetName();
        const widgetScope = scope ?? this.scopeContext;

        // Normalize vectors (convert array to Vector if needed)
        const position = toVector(merged.position);
        const size = toVector(merged.size);

        mod.AddUIImage(
            name,
            position.getHandle(),
            size.getHandle(),
            merged.anchor,
            this.handle,
            merged.isVisible,
            merged.padding,
            merged.backgroundColor.toVector().getHandle(),
            merged.backgroundColor.a,
            merged.bgFill,
            merged.imageType,
            merged.imageColor.toVector().getHandle(),
            merged.imageColor.a
        );
        const widget = mod.FindUIWidgetWithName(name, this.handle);
        const image = new UIImageWidget(widget);

        // Register in hierarchy with explicit scope
        image.scopeContext = widgetScope;
        const path = hierarchyManager.registerWidget(
            name,
            widgetScope,
            this.hierarchyPath,
            widget
        );
        image.hierarchyPath = path;

        // Apply depth if different from defaults
        if (merged.depth !== mod.UIDepth.BelowGameUI) {
            image.depth = merged.depth;
        }

        return image;
    }

    /**
     * Adds a weapon image widget as a child.
     * Displays weapon icons with support for color tinting and alpha blending.
     * @param props Optional props object containing weapon and image properties.
     * @param scope Optional scope context (defaults to parent's scope or GLOBAL if parent is root).
     * @returns The newly created weapon image widget for chaining.
     */
    public addWeaponImage(
        props?: Partial<UIWeaponImageProps>,
        scope?: UIScopeContext
    ): UIImageWidget {
        const merged = mergeProps(DEFAULT_UI_WEAPON_IMAGE_PROPS, props);
        const name = merged.name || generateUniqueWidgetName();
        const widgetScope = scope ?? this.scopeContext;

        // Normalize vectors (convert array to Vector if needed)
        const position = toVector(merged.position);
        const size = toVector(merged.size);

        mod.AddUIWeaponImage(
            name,
            position.getHandle(),
            size.getHandle(),
            merged.anchor,
            merged.weapon,
            this.handle
        );
        const widget = mod.FindUIWidgetWithName(name, this.handle);

        // Configure the created weapon image with background and image properties
        mod.SetUIWidgetBgColor(
            widget,
            merged.backgroundColor.toVector().getHandle()
        );
        mod.SetUIWidgetBgAlpha(widget, merged.backgroundColor.a);
        mod.SetUIWidgetBgFill(widget, merged.bgFill);
        mod.SetUIImageColor(widget, merged.imageColor.toVector().getHandle());
        mod.SetUIImageAlpha(widget, merged.imageColor.a);
        mod.SetUIWidgetPadding(widget, merged.padding);
        mod.SetUIWidgetVisible(widget, merged.isVisible);

        const weaponImage = new UIImageWidget(widget);

        // Register in hierarchy with explicit scope
        weaponImage.scopeContext = widgetScope;
        const path = hierarchyManager.registerWidget(
            name,
            widgetScope,
            this.hierarchyPath,
            widget
        );
        weaponImage.hierarchyPath = path;

        // Apply depth if different from defaults
        if (merged.depth !== mod.UIDepth.BelowGameUI) {
            weaponImage.depth = merged.depth;
        }

        return weaponImage;
    }

    /**
     * Get all children widgets in the hierarchy.
     * @returns Array of child hierarchy nodes with their names and paths.
     */
    public getChildren(): Array<{ name: string; path: string }> {
        if (!this.hierarchyPath) return [];
        const children = hierarchyManager.getChildren(this.hierarchyPath);
        return children.map((child) => ({
            name: child.name,
            path: `${this.hierarchyPath}/${child.name}`,
        }));
    }

    /**
     * Debug: Print the UI hierarchy tree.
     */
    public debugPrintHierarchy(): void {
        hierarchyManager.debugPrintHierarchy();
    }
}

/**
 * A text widget wrapper providing text-specific operations.
 */
export class UITextWidget extends UIStylableWidget {
    /**
     * Sets the text label of this widget.
     */
    public set text(message: mod.Message) {
        mod.SetUITextLabel(this.handle, message);
    }

    /**
     * Gets the text color of this widget (includes alpha).
     */
    public get textColor(): Color {
        const vec = new Vector(mod.GetUITextColor(this.handle));
        const alpha = mod.GetUITextAlpha(this.handle);
        // Create Color from the vector's x, y, z and the alpha value
        return new Color(vec.x, vec.y, vec.z, alpha);
    }

    /**
     * Sets the text color of this widget (includes alpha).
     */
    public set textColor(color: Color) {
        mod.SetUITextColor(this.handle, color.toVector().getHandle());
        mod.SetUITextAlpha(this.handle, color.a);
    }

    /**
     * Gets the text size of this widget.
     */
    public get textSize(): number {
        return mod.GetUITextSize(this.handle);
    }

    /**
     * Sets the text size of this widget.
     */
    public set textSize(size: number) {
        mod.SetUITextSize(this.handle, size);
    }

    /**
     * Gets the text anchor of this widget.
     * @returns The text anchor.
     */
    public getTextAnchor(): mod.UIAnchor {
        return mod.GetUITextAnchor(this.handle);
    }

    /**
     * Sets the text anchor of this widget.
     * @param anchor The new text anchor.
     */
    public setTextAnchor(anchor: mod.UIAnchor): void {
        mod.SetUITextAnchor(this.handle, anchor);
    }
}

/**
 * An image widget wrapper providing image-specific operations.
 */
export class UIImageWidget extends UIStylableWidget {
    /**
     * Gets the image type of this widget.
     * @returns The image type.
     */
    public getImageType(): mod.UIImageType {
        return mod.GetUIImageType(this.handle);
    }

    /**
     * Sets the image type of this widget.
     * @param imageType The new image type.
     */
    public setImageType(imageType: mod.UIImageType): void {
        mod.SetUIImageType(this.handle, imageType);
    }

    /**
     * Gets the image color of this widget (includes alpha).
     * @returns The image color.
     */
    public getImageColor(): Color {
        const vec = new Vector(mod.GetUIImageColor(this.handle));
        const alpha = mod.GetUIImageAlpha(this.handle);
        // Create Color from the vector's x, y, z and the alpha value
        return new Color(vec.x, vec.y, vec.z, alpha);
    }

    /**
     * Sets the image color of this widget (includes alpha).
     * @param color The new image color.
     */
    public setImageColor(color: Color): void {
        mod.SetUIImageColor(this.handle, color.toVector().getHandle());
        mod.SetUIImageAlpha(this.handle, color.a);
    }
}

export enum ButtonEvent {
    None = 0,
    ButtonDown = 1 << 0,
    ButtonUp = 1 << 1,
    FocusIn = 1 << 2,
    FocusOut = 1 << 3,
    HoverIn = 1 << 4,
    HoverOut = 1 << 5,

    // Mask representing all possible button event types
    AllEvents = ButtonDown | ButtonUp | FocusIn | FocusOut | HoverIn | HoverOut,
}

export function buttonEventToUIButtonEvent(
    event: ButtonEvent
): mod.UIButtonEvent {
    return Math.log2(event) as mod.UIButtonEvent;
}

/**
 * A button widget wrapper providing button-specific operations and state management.
 */
export class UIButtonWidget extends UIStylableWidget {
    /**
     * Gets the enabled state of this button widget.
     * @returns Whether the button is enabled.
     */
    public getButtonEnabled(): boolean {
        return mod.GetUIButtonEnabled(this.handle);
    }

    /**
     * Sets the enabled state of this button widget.
     * @param enabled Whether the button should be enabled.
     */
    public setButtonEnabled(enabled: boolean): void {
        mod.SetUIButtonEnabled(this.handle, enabled);
    }

    // Button Base State

    /**
     * Gets the base color of this button widget (includes alpha).
     * @returns The base color.
     */
    public getButtonColorBase(): Color {
        const vec = new Vector(mod.GetUIButtonColorBase(this.handle));
        const alpha = mod.GetUIButtonAlphaBase(this.handle);
        return new Color(vec.x, vec.y, vec.z, alpha);
    }

    /**
     * Sets the base color of this button widget (includes alpha).
     * @param color The new base color.
     */
    public setButtonColorBase(color: Color): void {
        mod.SetUIButtonColorBase(this.handle, color.toVector().getHandle());
        mod.SetUIButtonAlphaBase(this.handle, color.a);
    }

    // Button Hover State

    /**
     * Gets the hover color of this button widget (includes alpha).
     */
    public get buttonColorHover(): Color {
        const vec = new Vector(mod.GetUIButtonColorHover(this.handle));
        const alpha = mod.GetUIButtonAlphaHover(this.handle);
        return new Color(vec.x, vec.y, vec.z, alpha);
    }

    /**
     * Sets the hover color of this button widget (includes alpha).
     */
    public set buttonColorHover(color: Color) {
        mod.SetUIButtonColorHover(this.handle, color.toVector().getHandle());
        mod.SetUIButtonAlphaHover(this.handle, color.a);
    }

    // Button Pressed State

    /**
     * Gets the pressed color of this button widget (includes alpha).
     */
    public get buttonColorPressed(): Color {
        const vec = new Vector(mod.GetUIButtonColorPressed(this.handle));
        const alpha = mod.GetUIButtonAlphaPressed(this.handle);
        return new Color(vec.x, vec.y, vec.z, alpha);
    }

    /**
     * Sets the pressed color of this button widget (includes alpha).
     */
    public set buttonColorPressed(color: Color) {
        mod.SetUIButtonColorPressed(this.handle, color.toVector().getHandle());
        mod.SetUIButtonAlphaPressed(this.handle, color.a);
    }

    // Button Focused State

    /**
     * Gets the focused color of this button widget (includes alpha).
     */
    public get buttonColorFocused(): Color {
        const vec = new Vector(mod.GetUIButtonColorFocused(this.handle));
        const alpha = mod.GetUIButtonAlphaFocused(this.handle);
        return new Color(vec.x, vec.y, vec.z, alpha);
    }

    /**
     * Sets the focused color of this button widget (includes alpha).
     */
    public set buttonColorFocused(color: Color) {
        mod.SetUIButtonColorFocused(this.handle, color.toVector().getHandle());
        mod.SetUIButtonAlphaFocused(this.handle, color.a);
    }

    // Button Disabled State

    /**
     * Gets the disabled color of this button widget (includes alpha).
     */
    public get buttonColorDisabled(): Color {
        const vec = new Vector(mod.GetUIButtonColorDisabled(this.handle));
        const alpha = mod.GetUIButtonAlphaDisabled(this.handle);
        return new Color(vec.x, vec.y, vec.z, alpha);
    }

    /**
     * Sets the disabled color of this button widget (includes alpha).
     */
    public set buttonColorDisabled(color: Color) {
        mod.SetUIButtonColorDisabled(this.handle, color.toVector().getHandle());
        mod.SetUIButtonAlphaDisabled(this.handle, color.a);
    }

    // Button Events
    /**
     * Sets which button event types are enabled for this button.
     * Any event types not specified are not dispatched.
     * ButtonEvent.None can be used to disable all events.
     * @param buttonEvent The button event types to enable, e.g., ButtonEvent.ButtonDown | ButtonEvent.ButtonUp
     * @returns This UIButtonWidget for chaining.
     */
    public setEventTypes(buttonEvent: ButtonEvent): UIButtonWidget {
        let mask: number = ButtonEvent.AllEvents;
        while (mask !== 0) {
            const bit = mask & -mask; // Isolate lowest set bit
            mod.EnableUIButtonEvent(
                this.handle,
                buttonEventToUIButtonEvent(bit as ButtonEvent),
                (buttonEvent & bit) !== 0 // isEnabled
            );
            mask ^= bit; // Remove the bit we just processed
        }
        return this;
    }

    /**
     * Registers a callback to be invoked when button events occur for this button.
     * This allows the button to handle its own events internally without external event polling.
     * @param callback The callback function to invoke on button events
     * @param eventTypes The button event types to enable. Defaults to ButtonEvent.AllEvents.
     * @returns This UIButtonWidget for method chaining
     */
    public onEvent(
        callback: (
            button: UIButtonWidget,
            player: Player,
            event: ButtonEvent
        ) => void,
        eventTypes: ButtonEvent = ButtonEvent.AllEvents
    ): UIButtonWidget {
        // Ensure this button has a callback set in the global map
        if (!buttonEventCallbacks.has(this.handle)) {
            buttonEventCallbacks.set(this.handle, new Set());
        }

        const callbacks = buttonEventCallbacks.get(this.handle) ?? new Set();
        callbacks.add(callback);

        // Enable specified button event types
        this.setEventTypes(eventTypes);

        return this;
    }

    /**
     * Clears all registered event callbacks for this button and disables all event types.
     * @returns This UIButtonWidget for method chaining
     */
    public clearEventCallbacks(): UIButtonWidget {
        buttonEventCallbacks.delete(this.handle);
        this.setEventTypes(ButtonEvent.None);
        return this;
    }
}

// ============================================================================
// UI Hierarchy Utility Functions
// ============================================================================

/**
 * Get the hierarchical path of a widget.
 * Example: ROOT/GlobalMenu/TEAM-1-Status
 */
export function getUIWidgetPath(widget: UIWidget): string | null {
    return widget.getPath();
}

/**
 * Clean up all UI widgets for a specific player.
 * Removes all PLAYER-scoped widgets with the given player ID.
 * Call this when a player leaves the game.
 */
export function cleanupPlayerUI(playerId: number): void {
    hierarchyManager.cleanupPlayerUI(playerId);
}

/**
 * Clean up all UI widgets for a specific team.
 * Removes all TEAM-scoped widgets with the given team ID.
 * Call this when a team is disbanded or a player leaves a team.
 */
export function cleanupTeamUI(teamId: number): void {
    hierarchyManager.cleanupTeamUI(teamId);
}

/**
 * Debug: Print the UI hierarchy tree.
 */
export function debugPrintUIHierarchy(): void {
    hierarchyManager.debugPrintHierarchy();
}

/**
 * Create a player-specific UI context that automatically associates widgets with a player.
 * Useful for creating per-player UI elements (menus, overlays, etc.)
 * @param playerId The player ID
 * @param parentContainer The parent container to add to (typically the root container)
 * @returns A container widget with PLAYER scope context set
 */
export function createPlayerUIContext(
    playerId: number,
    parentContainer: UIContainerWidget
): UIContainerWidget {
    const playerContainer = parentContainer.addContainer(
        {
            name: `PlayerUI_${playerId}`,
        },
        { scope: UIScope.PLAYER, playerId }
    );
    return playerContainer;
}

/**
 * Create a team-specific UI context that automatically associates widgets with a team.
 * Useful for creating team-scoped UI elements (team stats, team chat, etc.)
 * @param teamId The team ID
 * @param parentContainer The parent container to add to (typically the root container)
 * @returns A container widget with TEAM scope context set
 */
export function createTeamUIContext(
    teamId: number,
    parentContainer: UIContainerWidget
): UIContainerWidget {
    const teamContainer = parentContainer.addContainer(
        {
            name: `TeamUI_${teamId}`,
        },
        { scope: UIScope.TEAM, teamId }
    );
    return teamContainer;
}
