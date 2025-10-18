// src/cascade/core/ModRegistry.ts
// Registry and lifecycle management system for mods with runtime plug/unplug capability

import * as EventDispatcher from "./EventDispatcher";
import type { IMod } from "./IMod";

/**
 * Metadata for a mod class and its instance.
 */
interface ModEntry {
    modConstructor: new () => IMod;
    instance: IMod | null;
    isPlugged: boolean;
}

/**
 * List of valid method names from the IMod interface.
 * Only methods in this list will be bound and dispatched.
 */
const VALID_MOD_METHODS = new Set<string>([
    // Global events
    "ongoingGlobal",
    "onGameModeStarted",
    "onGameModeEnding",
    // Player events
    "onPlayerJoinGame",
    "onPlayerLeaveGame",
    "onPlayerDeployed",
    "onPlayerUndeploy",
    "onPlayerEarnedKill",
    "onPlayerEarnedKillAssist",
    "onPlayerDamaged",
    "onPlayerDied",
    "onRevived",
    "onMandown",
    "onPlayerSwitchTeam",
    // Vehicle events
    "onVehicleSpawned",
    "onVehicleDestroyed",
    "onPlayerEnterVehicle",
    "onPlayerExitVehicle",
    "onPlayerEnterVehicleSeat",
    "onPlayerExitVehicleSeat",
    // Capture point events
    "onCapturePointCapturing",
    "onCapturePointCaptured",
    "onCapturePointLost",
    "onPlayerEnterCapturePoint",
    "onPlayerExitCapturePoint",
    // MCOM events
    "onMCOMArmed",
    "onMCOMDefused",
    "onMCOMDestroyed",
    // Area trigger events
    "onPlayerEnterAreaTrigger",
    "onPlayerExitAreaTrigger",
    // Interact point events
    "onPlayerInteract",
    // Spawner events
    "onSpawnerSpawned",
    // Raycast events
    "onRayCastHit",
    "onRayCastMissed",
    // UI events
    "onPlayerUIButtonEvent",
    // AI events
    "onAIMoveToFailed",
    "onAIMoveToRunning",
    "onAIMoveToSucceeded",
    "onAIParachuteRunning",
    "onAIParachuteSucceeded",
    "onAIWaypointIdleFailed",
    "onAIWaypointIdleRunning",
    "onAIWaypointIdleSucceeded",
    // Time events
    "onTimeLimitReached",
]);

/**
 * Global registry of all available mod classes.
 * Maps mod name (class name) to its entry.
 */
const LIFECYCLE_METHODS = new Set<string>(["onPlug", "onUnplug"]);

const availableMods = new Map<string, ModEntry>();

/**
 * Map of bound methods for tracking during lifecycle operations.
 * Maps "{modName}.{methodName}" to the bound method function.
 */
const boundMethodsRegistry = new Map<string, (...args: unknown[]) => void>();

/**
 * Registers a mod class so it can be plugged in at runtime.
 * This creates a ModEntry for the class but does NOT instantiate it yet.
 * Instantiation happens when plug() is called.
 *
 * @param modConstructor The class constructor (must extend Mod)
 * @param modName Optional explicit name. If not provided, uses the class name.
 */
export function registerModClass<T extends new () => IMod>(
    modConstructor: T,
    modName?: string
): void {
    const name = modName || modConstructor.name;

    if (availableMods.has(name)) {
        console.warn(
            `[ModRegistry] Mod class '${name}' is already registered, skipping duplicate`
        );
        return;
    }

    availableMods.set(name, {
        modConstructor,
        instance: null,
        isPlugged: false,
    });

    console.log(`[ModRegistry] Registered mod class: ${name}`);
}

/**
 * Plugs in (activates) a mod at runtime.
 *
 * This process:
 * 1. Looks up the mod class by name
 * 2. Creates a new instance if it doesn't exist
 * 3. Inspects its methods to find event handlers
 * 4. Registers each handler with EventDispatcher
 * 5. Calls the mod's onPlug() lifecycle method
 *
 * @param modName The name of the mod class to activate
 * @returns true if successful, false if the mod doesn't exist
 */
export function plug(modName: string): boolean {
    const entry = availableMods.get(modName);
    if (!entry) {
        console.error(
            `[ModRegistry] Cannot plug: mod class '${modName}' not found in registry`
        );
        return false;
    }

    if (entry.isPlugged) {
        console.warn(
            `[ModRegistry] Mod '${modName}' is already plugged, skipping`
        );
        return true;
    }

    // Instantiate the mod if needed
    if (!entry.instance) {
        entry.instance = new entry.modConstructor();
        console.log(`[ModRegistry] Created instance of mod: ${modName}`);
    }

    const instance = entry.instance;

    // Discover and bind all event handler methods
    const methodNames = new Set<string>();

    // Add instance properties
    for (const key of Object.keys(instance)) {
        methodNames.add(key);
    }

    // Add prototype methods
    let proto = Object.getPrototypeOf(instance);
    while (proto && proto !== Object.prototype) {
        for (const key of Object.getOwnPropertyNames(proto)) {
            methodNames.add(key);
        }
        proto = Object.getPrototypeOf(proto);
    }

    let handlerCount = 0;
    const handlers: string[] = [];

    for (const methodName of methodNames) {
        // Skip lifecycle methods - they're called directly, not dispatched
        if (methodName === "onPlug" || methodName === "onUnplug") {
            continue;
        }

        // Only bind valid event handler methods
        if (!VALID_MOD_METHODS.has(methodName)) {
            continue;
        }

        // Lifecycle methods are invoked directly and should not be registered as event handlers
        if (LIFECYCLE_METHODS.has(methodName)) {
            continue;
        }

        const value = (instance as Record<string, unknown>)[methodName];
        if (typeof value === "function" && methodName !== "constructor") {
            // Bind the method to preserve 'this' context
            const boundMethod = (value as (...args: unknown[]) => void).bind(
                instance
            );

            // Register with EventDispatcher
            EventDispatcher.registerEventHandler(methodName, boundMethod);

            // Track the bound method for later unregistration
            const key = `${modName}.${methodName}`;
            boundMethodsRegistry.set(key, boundMethod);

            handlers.push(methodName);
            handlerCount++;
            console.log(`  [ModRegistry] Bound: ${modName}.${methodName}()`);
        }
    }

    console.log(
        `[ModRegistry] Plugged mod '${modName}' with ${handlerCount} event handlers: [${handlers.join(
            ", "
        )}]`
    );

    entry.isPlugged = true;

    // Call the onPlug lifecycle method if it exists
    if (typeof instance.onPlug === "function") {
        try {
            instance.onPlug();
            console.log(`[ModRegistry] Called onPlug() for mod: ${modName}`);
        } catch (error) {
            console.error(
                `[ModRegistry] Error in onPlug() for mod '${modName}':`,
                error
            );
        }
    }

    return true;
}

/**
 * Unplugs (deactivates) a mod at runtime.
 *
 * This process:
 * 1. Calls the mod's onUnplug() lifecycle method
 * 2. Unregisters all of its event handlers from EventDispatcher
 * 3. Clears internal references
 *
 * @param modName The name of the mod to deactivate
 * @returns true if successful, false if the mod doesn't exist or isn't plugged
 */
export function unplug(modName: string): boolean {
    const entry = availableMods.get(modName);
    if (!entry) {
        console.error(
            `[ModRegistry] Cannot unplug: mod class '${modName}' not found in registry`
        );
        return false;
    }

    if (!entry.isPlugged || !entry.instance) {
        console.warn(`[ModRegistry] Mod '${modName}' is not plugged, skipping`);
        return true;
    }

    const instance = entry.instance;

    // Call the onUnplug lifecycle method if it exists
    if (typeof instance.onUnplug === "function") {
        try {
            instance.onUnplug();
            console.log(`[ModRegistry] Called onUnplug() for mod: ${modName}`);
        } catch (error) {
            console.error(
                `[ModRegistry] Error in onUnplug() for mod '${modName}':`,
                error
            );
        }
    }

    // Unregister all event handlers for this mod
    let unregisteredCount = 0;
    for (const [key, boundMethod] of boundMethodsRegistry.entries()) {
        if (key.startsWith(`${modName}.`)) {
            const methodName = key.substring(modName.length + 1);
            if (
                EventDispatcher.unregisterEventHandler(methodName, boundMethod)
            ) {
                unregisteredCount++;
                console.log(`  [ModRegistry] Unbound: ${key}()`);
            }
            boundMethodsRegistry.delete(key);
        }
    }

    console.log(
        `[ModRegistry] Unplugged mod '${modName}', unregistered ${unregisteredCount} event handlers`
    );

    entry.isPlugged = false;

    return true;
}

/**
 * Gets all available mod names (both plugged and unplugged).
 * @returns Array of registered mod class names
 */
export function getAvailableMods(): string[] {
    return Array.from(availableMods.keys());
}

/**
 * Gets the plugged status of a mod.
 * @param modName The mod class name
 * @returns true if the mod is currently plugged in
 */
export function isModPlugged(modName: string): boolean {
    const entry = availableMods.get(modName);
    return entry?.isPlugged ?? false;
}

/**
 * Gets all currently plugged mods.
 * @returns Array of mod names that are currently active
 */
export function getPluggedMods(): string[] {
    const plugged: string[] = [];
    for (const [name, entry] of availableMods) {
        if (entry.isPlugged) {
            plugged.push(name);
        }
    }
    return plugged;
}

/**
 * Clears the entire registry (mainly for testing).
 */
export function clearRegistry(): void {
    availableMods.clear();
    boundMethodsRegistry.clear();
    EventDispatcher.clearAllHandlers();
    console.log("[ModRegistry] Registry cleared");
}
