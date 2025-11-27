# Complete UIWidget System Guide

The UIWidget system provides a comprehensive UI creation and management system with a **props-based API**, **hierarchical organization**, and **multi-scope support** (Global, Team, Player) that can be mixed at any level.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Creating Widgets](#creating-widgets)
3. [Widget Types and Props](#widget-types-and-props)
4. [Hierarchical Organization](#hierarchical-organization)
5. [Vector Shorthand](#vector-shorthand)
6. [Cleanup and Context Creation](#cleanup-and-context-creation)
7. [Real-World Example](#real-world-example)
8. [Debugging](#debugging)
9. [Complete API Reference](#complete-api-reference)
10. [Best Practices](#best-practices)

---

## Core Concepts

### Three Scope Types

The UI system supports three independent scope types that can be mixed at any hierarchy level:

```typescript
export enum UIScope {
    GLOBAL = 0, // Visible to all players
    TEAM = 1, // Visible to team members only
    PLAYER = 2, // Visible to specific players only
}

export type UIScopeContext =
    | { scope: UIScope.GLOBAL }
    | { scope: UIScope.TEAM; teamId: number }
    | { scope: UIScope.PLAYER; playerId: number };
```

### Props-Based API

All widgets are created using props objects for clean, declarative syntax:

```typescript
// Minimal - uses all defaults
const menu = root.addContainer();

// Custom props - only specify what you need
const menu = root.addContainer({
    name: "MainMenu",
    position: [100, 100, 0],
    size: [400, 300, 0],
    bgColor: [0.1, 0.1, 0.1],
    bgAlpha: 0.8,
});

// With scope
const teamStatus = root.addContainer(
    { name: "Status" },
    { scope: UIScope.TEAM, teamId: 1 }
);
```

### Hierarchical Paths

Widgets are organized using hierarchical paths with scope indicators:

```
*ROOT*                                      Global root
*ROOT*/Menu                                 Global child
*ROOT*/Menu/[TEAM-1]Status                  Team child under global parent
*ROOT*/[TEAM-1]TeamArea                     Team-scoped widget
*ROOT*/[TEAM-1]TeamArea/[PLAYER-5]Name     Player child under team parent
*ROOT*/[PLAYER-8]Overlay                    Player-scoped widget
*ROOT*/[PLAYER-8]Overlay/Score              Child under player parent
```

---

## Creating Widgets

### Basic Usage

```typescript
import { UI, Vector, UIScope, ButtonEvent } from "cascade";

const root = UI.getRoot();

// Minimal - uses all defaults
const menu = root.addContainer();

// Custom props - only specify what you need
const menu = root.addContainer({
    name: "GameMenu",
    position: new Vector(100, 100, 0),
    size: new Vector(400, 300, 0),
    bgColor: new Vector(0.1, 0.1, 0.1),
    bgAlpha: 0.8,
});

// Chaining
const button = menu
    .addButton({ name: "Start" })
    .onEvent((btn, player, event) => {
        if (event === ButtonEvent.ButtonDown) {
            console.log(`${player.getName()} clicked start`);
        }
    }, ButtonEvent.ButtonDown);
```

### Optional Props

All props are optional - unspecified props use sensible defaults. Works great for quick prototyping:

```typescript
// Works - uses all defaults
root.addContainer();

// Works - mixes defaults with custom values
root.addContainer({
    name: "MyMenu",
    bgAlpha: 0.5,
});

// Works - only specify what you need
const button = menu.addButton({
    name: "MyBtn",
    position: [100, 100, 0],
});
```

---

## Widget Types and Props

### Base Props - Available on All Widgets

```typescript
export interface UIWidgetBaseProps {
    name?: string; // Auto-generated if not provided
    position?: VectorLike; // Defaults to (0, 0, 0)
    size?: VectorLike; // Defaults to (100, 100, 0)
    anchor?: mod.UIAnchor; // Defaults to UIAnchor.TopLeft
    isVisible?: boolean; // Defaults to true
    depth?: mod.UIDepth; // Defaults to UIDepth.BelowGameUI
    bgColor?: VectorLike; // Defaults to (0, 0, 0)
    bgAlpha?: number; // Defaults to 0
    bgFill?: mod.UIBgFill; // Defaults to UIBgFill.Solid
    padding?: number; // Defaults to 0
}
```

### Container Widget

```typescript
export interface UIContainerProps extends UIWidgetBaseProps {}
```

**Purpose:** Organize UI elements hierarchically. Only containers can have children.

**Example:**

```typescript
const root = UI.getRoot();

const mainContainer = root.addContainer({
    name: "MainUI",
    position: [0, 0, 0],
    size: [1920, 1080, 0],
    bgColor: [0, 0, 0],
    bgAlpha: 0.3,
});

// Add children
const header = mainContainer.addContainer({ name: "Header" });
const content = mainContainer.addContainer({ name: "Content" });
const footer = mainContainer.addContainer({ name: "Footer" });
```

### Text Widget

```typescript
export interface UITextProps extends UIWidgetBaseProps {
    message?: mod.Message | string; // Defaults to ""
    textColor?: VectorLike; // Defaults to (1, 1, 1)
    textAlpha?: number; // Defaults to 1
    textSize?: number; // Defaults to 1
    textAnchor?: mod.UIAnchor; // Defaults to UIAnchor.TopLeft
}
```

**Purpose:** Display text labels or messages.

**Example:**

```typescript
const header = menu.addText({
    name: "Title",
    message: "Welcome to the Game",
    position: [0, 10, 0],
    size: [400, 40, 0],
    textColor: [1, 1, 0.5],
    textSize: 2,
    textAnchor: mod.UIAnchor.TopCenter,
    anchor: mod.UIAnchor.TopCenter,
});

// Update dynamically
header.text = "New Title";
header.textColor = new Vector(0, 1, 0);
header.textSize = 2.5;
```

### Image Widget

```typescript
export interface UIImageProps extends UIWidgetBaseProps {
    imageType?: mod.UIImageType; // Defaults to UIImageType.None
    imageColor?: VectorLike; // Defaults to (1, 1, 1)
    imageAlpha?: number; // Defaults to 1
}
```

**Purpose:** Display images and icons.

**Example:**

```typescript
const icon = menu.addImage({
    name: "Icon",
    imageType: mod.UIImageType.QuestionMark,
    position: [10, 10, 0],
    size: [32, 32, 0],
    imageColor: [1, 0.8, 0],
    imageAlpha: 0.9,
});

// Update dynamically
icon.setImageType(mod.UIImageType.CheckMark);
icon.setImageColor(new Vector(0, 1, 0));
```

### Button Widget

```typescript
export interface UIButtonProps extends UIWidgetBaseProps {
    isEnabled?: boolean; // Defaults to true
    buttonColorBase?: VectorLike; // Defaults to (1, 1, 1)
    buttonAlphaBase?: number; // Defaults to 1
    buttonColorHover?: VectorLike; // Defaults to (0.5, 0.5, 0.5)
    buttonAlphaHover?: number; // Defaults to 1
    buttonColorPressed?: VectorLike; // Defaults to (0.3, 0.3, 0.3)
    buttonAlphaPressed?: number; // Defaults to 1
    buttonColorFocused?: VectorLike; // Defaults to (1, 1, 1)
    buttonAlphaFocused?: number; // Defaults to 1
    buttonColorDisabled?: VectorLike; // Defaults to (0.8, 0.8, 0.8)
    buttonAlphaDisabled?: number; // Defaults to 1
}
```

**Purpose:** Interactive button elements with event handling and state colors.

**Example:**

```typescript
import { ButtonEvent } from "cascade";

const startBtn = menu
    .addButton({
        name: "StartButton",
        position: [50, 100, 0],
        size: [300, 50, 0],
        bgColor: [0.2, 0.6, 0.2],
        bgAlpha: 0.8,
        buttonColorBase: [0, 0.8, 0],
        buttonColorHover: [0, 1, 0],
        buttonColorPressed: [0, 0.6, 0],
        isEnabled: true,
    })
    .onEvent((btn, player, event) => {
        if (event === ButtonEvent.ButtonDown) {
            console.log(`${player.getName()} clicked start`);
        }
    }, ButtonEvent.ButtonDown);

// Update dynamically
startBtn.setButtonEnabled(false);
startBtn.setButtonColorBase(new Vector(0.5, 0.5, 0.5));
```

---

## Hierarchical Organization

### ⚠️ CRITICAL: Scope Visibility Blocking

**Scope acts as a visibility barrier in the UI tree hierarchy.** When traversing from root to children:

-   **If a widget's scope is incompatible with a player**, that player cannot see it OR any of its descendants
-   **This applies even if descendants have compatible scopes**
-   The rendering tree stops at the first incompatible scope

**Example:** If Player-5 encounters a `[PLAYER-8]Overlay` widget, Player-5 will not see that widget or anything inside it, even if there's a `[GLOBAL]InfoPanel` nested deeper.

This is a critical design consideration - **structure your widget hierarchy to avoid unintended scope blocking**.

### Important: Scope Visibility Rules

**Scope acts as a visibility filter at each level of the hierarchy.** When traversing the UI tree, if a player encounters a widget with a scope they cannot see, they will not see that widget OR any of its descendants - even if deeper descendants have compatible scopes.

#### Scope Visibility Examples

For a player to see a widget, ALL ancestors in the tree must have compatible scopes:

```
Example tree structure:
*ROOT* (GLOBAL)
  └─ [PLAYER-5]Container (PLAYER-5)
      ├─ [TEAM-1]Stats (TEAM-1)
      │  └─ Score (TEAM-1)
      └─ [PLAYER-8]Badge (PLAYER-8)      ← SCOPE BARRIER
          └─ Icon (GLOBAL)              ← BLOCKED, won't render

Player-5 viewing (not on Team-1):
  ✅ Sees *ROOT* (GLOBAL - visible to all)
  ✅ Sees [PLAYER-5]Container (matches player 5)
  ❌ CANNOT see [TEAM-1]Stats (not on team 1)
  ❌ CANNOT see Score (parent was blocked)
  ❌ CANNOT see [PLAYER-8]Badge (different player - SCOPE BARRIER)
  ❌ CANNOT see Icon (ancestor was blocked)

Player-5 on Team-1 viewing:
  ✅ Sees *ROOT* (GLOBAL)
  ✅ Sees [PLAYER-5]Container (matches player 5)
  ✅ Sees [TEAM-1]Stats (on team 1)
  ✅ Sees Score (all ancestors visible)
  ❌ CANNOT see [PLAYER-8]Badge (different player - SCOPE BARRIER)
  ❌ CANNOT see Icon (ancestor [PLAYER-8]Badge was blocked)
```

### Scope Blocking Rules

When a player encounters a widget with an **incompatible scope**, they cannot see it or any descendants:

-   **Different PLAYER scope** → Complete block (most restrictive)
-   **Different TEAM scope** → Complete block (if not on that team)
-   **GLOBAL scope** → Always visible
-   **Matching PLAYER scope** → Always visible
-   **Matching TEAM scope** → Always visible

**Key principle:** The rendering stops at the first scope that doesn't match. You must structure your hierarchy so that scope changes make logical sense.

### Visibility Enforcement

**The mod API automatically enforces scope visibility at render time.** You don't need to manually set widget visibility based on scope - the underlying engine handles this.

**However**, you must be aware of scope blocking when structuring your hierarchy, because incompatible scopes will prevent descendant widgets from being rendered, even if those descendants have compatible scopes.

### Path Format Rules

-   **Global widgets:** `Menu`, `HUD`, `Button1`
-   **Team-scoped:** `[TEAM-1]Widget`, `[TEAM-2]Status`
-   **Player-scoped:** `[PLAYER-5]Overlay`, `[PLAYER-8]Chat`
-   **Mixed paths:** `*ROOT*/Parent/[TEAM-1]Child/[PLAYER-5]Grandchild`

### Creating Global Widgets (Default)

```typescript
const root = UI.getRoot();

// Automatically GLOBAL scope (default)
const menu = root.addContainer({
    name: "GameMenu",
    position: [100, 100, 0],
});

const button = menu.addButton({
    name: "StartBtn",
});

// Resulting paths:
// menu -> *ROOT*/GameMenu
// button -> *ROOT*/GameMenu/StartBtn
```

### Creating Team-Scoped Widgets

```typescript
import { UIScope } from "cascade";

const root = UI.getRoot();

// Create team status - visible only to team members
const teamStatus = root.addContainer(
    { name: "Status" },
    { scope: UIScope.TEAM, teamId: 1 }
);

// Children inherit parent scope unless overridden
const healthBar = teamStatus.addText({
    name: "Health",
    message: "Team Health: 100%",
});

// Resulting paths:
// teamStatus -> *ROOT*/[TEAM-1]Status
// healthBar -> *ROOT*/[TEAM-1]Status/Health
```

### Creating Player-Scoped Widgets

```typescript
import { UIScope } from "cascade";

const root = UI.getRoot();

// Create player overlay - visible only to player
const playerOverlay = root.addContainer(
    { name: "Overlay" },
    { scope: UIScope.PLAYER, playerId: 5 }
);

// Add player-specific elements
const scoreDisplay = playerOverlay.addText({
    name: "Score",
    message: "Score: 1000",
});

// Resulting paths:
// playerOverlay -> *ROOT*/[PLAYER-5]Overlay
// scoreDisplay -> *ROOT*/[PLAYER-5]Overlay/Score
```

### Mixing Scopes in Hierarchy

**Key feature: each widget can have a different scope than its parent**

```typescript
import { UIScope } from "cascade";

const root = UI.getRoot(); // GLOBAL scope

// Create global menu
const gameMenu = root.addContainer({
    name: "GameUI",
    // Inherits GLOBAL from root
});

// Add team-specific section (change scope)
const team1Section = gameMenu.addContainer(
    { name: "Team1Info" },
    { scope: UIScope.TEAM, teamId: 1 } // NEW SCOPE
);

// Add player-specific within team section (change scope again)
const player5Badge = team1Section.addContainer(
    { name: "Badge" },
    { scope: UIScope.PLAYER, playerId: 5 } // NEW SCOPE
);

// Resulting hierarchy:
// *ROOT*/GameUI (GLOBAL)
// *ROOT*/GameUI/[TEAM-1]Team1Info (TEAM)
// *ROOT*/GameUI/[TEAM-1]Team1Info/[PLAYER-5]Badge (PLAYER)
```

### Scope Inheritance

When you don't specify a scope, children inherit the parent's scope:

```typescript
import { UIScope } from "cascade";

const root = UI.getRoot(); // GLOBAL scope

// Inherits GLOBAL from root
const menu = root.addContainer({ name: "Menu" });

// Explicitly change scope
const teamArea = menu.addContainer(
    { name: "Team1Area" },
    { scope: UIScope.TEAM, teamId: 1 }
);

// Inherits TEAM from parent
const teamStatus = teamArea.addText({
    name: "Status",
});
```

---

## Vector Shorthand

All vector properties (position, size, colors) support three formats:

```typescript
export type VectorLike =
    | Vector // Vector object
    | [number, number, number] // Array shorthand
    | GameArray<number>; // GameArray with 3+ elements
```

### Using Vector Shorthand

```typescript
// Format 1: Vector object
const widget = root.addContainer({
    position: new Vector(100, 200, 0),
    size: new Vector(500, 300, 0),
    bgColor: new Vector(0.2, 0.2, 0.2),
});

// Format 2: Array shorthand (most concise)
const widget = root.addContainer({
    position: [100, 200, 0],
    size: [500, 300, 0],
    bgColor: [0.2, 0.2, 0.2],
});

// Format 3: GameArray<number> with first 3 elements as [x, y, z]
import { GameArray } from "cascade";

const coords = new GameArray<number>();
coords.push(100).push(200).push(0);
const widget = root.addContainer({
    position: coords,
});

// Mix formats
const button = container.addButton({
    position: [50, 100, 0], // Array shorthand
    size: new Vector(200, 50, 0), // Vector object
    bgColor: colorGameArray, // GameArray
    buttonColorBase: [1, 1, 1], // Array
    buttonColorHover: new Vector(0.8, 0.8, 0.8), // Vector
});
```

### Benefits

-   **Concise syntax:** `[x, y, z]` is shorter than `new Vector(x, y, z)`
-   **Data interoperability:** Use GameArray sources directly without conversion
-   **Type-safe:** Full TypeScript type checking on all formats

---

## Cleanup and Context Creation

### Accessing Hierarchy Information

#### Get Widget Path

```typescript
import { getUIWidgetPath } from "cascade";

const widget = menu.addButton({ name: "MyBtn" });
const path = getUIWidgetPath(widget);
console.log(path); // "*ROOT*/Menu/MyBtn"
```

#### Get Widget Scope

```typescript
const widget = root.addButton(
    { name: "Btn" },
    { scope: UIScope.PLAYER, playerId: 5 }
);

console.log(widget.scopeContext);
// { scope: UIScope.PLAYER, playerId: 5 }
```

#### Get Children

```typescript
const container = root.addContainer({ name: "Menu" });
container.addButton({ name: "Option1" });
container.addButton({ name: "Option2" });

const children = container.getChildren();
// [
//   { name: "Option1", path: "*ROOT*/Menu/Option1" },
//   { name: "Option2", path: "*ROOT*/Menu/Option2" }
// ]
```

### Clean Up Player UI

When a player leaves the game:

```typescript
import { cleanupPlayerUI, purgeAllPlayerUI } from "cascade";

onPlayerLeaveGame(player) {
    const playerId = player.getId();

    // Option 1: Remove only PLAYER-scoped widgets
    cleanupPlayerUI(playerId);

    // Option 2: Remove ALL widgets associated with player (recommended)
    // This includes PLAYER-scoped widgets AND all descendants
    purgeAllPlayerUI(playerId);
}
```

### Clean Up Team UI

When a team is disbanded:

```typescript
import { cleanupTeamUI } from "cascade";

disbandTeam(teamId) {
    cleanupTeamUI(teamId);  // Removes all [TEAM-N] widgets
}
```

### Create Player Context

```typescript
import { createPlayerUIContext } from "cascade";

const root = UI.getRoot();
const playerCtx = createPlayerUIContext(8, root);

// Everything in playerCtx is automatically player-scoped
const overlay = playerCtx.addContainer({ name: "HUD" });
const score = overlay.addText({ name: "Score" });

// Hierarchy:
// *ROOT*/PlayerUI_8 (PLAYER scope)
// *ROOT*/PlayerUI_8/HUD (inherits PLAYER)
// *ROOT*/PlayerUI_8/HUD/Score (inherits PLAYER)
```

### Create Team Context

```typescript
import { createTeamUIContext } from "cascade";

const root = UI.getRoot();
const teamCtx = createTeamUIContext(1, root);

// Everything in teamCtx is automatically team-scoped
const teamBoard = teamCtx.addContainer({ name: "Scoreboard" });

// Hierarchy:
// *ROOT*/TeamUI_1 (TEAM scope, team 1)
// *ROOT*/TeamUI_1/Scoreboard (inherits TEAM)
```

---

## Real-World Example

### Complete Game UI Manager

```typescript
import {
    UI,
    Vector,
    UIScope,
    ButtonEvent,
    createPlayerUIContext,
    createTeamUIContext,
    cleanupPlayerUI,
    cleanupTeamUI,
    purgeAllPlayerUI,
} from "cascade";

class GameUIManager {
    private root: UIContainerWidget;
    private playerContexts = new Map<number, UIContainerWidget>();
    private teamContexts = new Map<number, UIContainerWidget>();

    constructor() {
        this.root = UI.getRoot();
        this.setupGlobalUI();
    }

    private setupGlobalUI(): void {
        // Create global game menu (visible to everyone)
        const gameMenu = this.root.addContainer({
            name: "GameMenu",
            position: [0, 0, 0],
            bgColor: [0.1, 0.1, 0.1],
            bgAlpha: 0.9,
        });

        // Global notifications
        gameMenu.addText({
            name: "GlobalNotif",
            message: "Server Ready",
            textColor: [0, 1, 0],
        });
    }

    public setupPlayerUI(playerId: number): void {
        // Create player-scoped context
        const playerCtx = createPlayerUIContext(playerId, this.root);
        this.playerContexts.set(playerId, playerCtx);

        // Player-specific HUD
        const hud = playerCtx.addContainer({ name: "HUD" });

        hud.addText({
            name: "PlayerName",
            message: `Player ${playerId}`,
            position: [10, 10, 0],
        });

        const scoreWidget = hud.addText({
            name: "Score",
            message: "0",
            position: [10, 40, 0],
        });
    }

    public setupTeamUI(teamId: number): void {
        // Create team-scoped context
        const teamCtx = createTeamUIContext(teamId, this.root);
        this.teamContexts.set(teamId, teamCtx);

        // Team stats (all team members see these)
        const stats = teamCtx.addContainer({
            name: "Stats",
            position: [600, 0, 0],
        });

        stats.addText({
            name: "TeamHealth",
            message: `Team Health: 100%`,
        });
    }

    public onPlayerJoin(playerId: number): void {
        this.setupPlayerUI(playerId);
    }

    public onPlayerLeave(playerId: number): void {
        purgeAllPlayerUI(playerId);
        this.playerContexts.delete(playerId);
    }

    public onTeamDisbanded(teamId: number): void {
        cleanupTeamUI(teamId);
        this.teamContexts.delete(teamId);
    }
}
```

---

## Debugging

### Print Hierarchy

```typescript
import { debugPrintUIHierarchy } from "cascade";

// Print entire hierarchy
debugPrintUIHierarchy();

// Output example:
// === UI Hierarchy ===
// *ROOT* (GLOBAL)
//   Menu (GLOBAL)
//     StartBtn (GLOBAL)
//   [TEAM-1]Status (TEAM-1)
//     Health (TEAM-1)
//     [PLAYER-5]Badge (PLAYER-5)
//   [PLAYER-8]Overlay (PLAYER-8)
//     Score (PLAYER-8)
```

### Print Widget Info

```typescript
const widget = menu.addButton({ name: "MyBtn" });

console.log(widget.getPath()); // "*ROOT*/Menu/MyBtn"
console.log(widget.scopeContext); // { scope: UIScope.GLOBAL }
console.log(widget.hierarchyPath); // "*ROOT*/Menu/MyBtn"
```

---

## Complete API Reference

### Enums and Types

```typescript
export enum UIScope {
    GLOBAL = 0,
    TEAM = 1,
    PLAYER = 2,
}

export type UIScopeContext =
    | { scope: UIScope.GLOBAL }
    | { scope: UIScope.TEAM; teamId: number }
    | { scope: UIScope.PLAYER; playerId: number };

export type VectorLike = Vector | [number, number, number] | GameArray<number>;

export enum ButtonEvent {
    ButtonDown = 1 << 0,
    ButtonUp = 1 << 1,
    FocusIn = 1 << 2,
    FocusOut = 1 << 3,
    HoverIn = 1 << 4,
    HoverOut = 1 << 5,
    AllEvents = ButtonDown | ButtonUp | FocusIn | FocusOut | HoverIn | HoverOut,
}
```

### Widget Creation Methods

```typescript
// Container (can have children)
container.addContainer(props?: Partial<UIContainerProps>, scope?: UIScopeContext): UIContainerWidget

// Button (can have event handlers)
container.addButton(props?: Partial<UIButtonProps>, scope?: UIScopeContext): UIButtonWidget

// Text (can display text)
container.addText(props?: Partial<UITextProps>, scope?: UIScopeContext): UITextWidget

// Image (can display images)
container.addImage(props?: Partial<UIImageProps>, scope?: UIScopeContext): UIImageWidget
```

### Widget Methods (Common to All)

```typescript
// Lifecycle
widget.delete(): void

// Properties (Get/Set)
widget.position: Vector
widget.size: Vector
widget.anchor: mod.UIAnchor
widget.isVisible: boolean
widget.depth: mod.UIDepth
widget.bgColor: Vector
widget.bgAlpha: number
widget.bgFill: mod.UIBgFill
widget.padding: number
widget.name: string
widget.parent: UIWidget | undefined

// Hierarchy
widget.getPath(): string | null
widget.hierarchyPath: string | null
widget.scopeContext: UIScopeContext
```

### Text Widget Methods

```typescript
text.text = message;                    // Set text
text.textColor: Vector                  // Get/set color
text.textAlpha: number                  // Get/set alpha
text.textSize: number                   // Get/set size
text.getTextAnchor(): mod.UIAnchor
text.setTextAnchor(anchor: mod.UIAnchor): void
```

### Image Widget Methods

```typescript
image.getImageType(): mod.UIImageType
image.setImageType(type: mod.UIImageType): void
image.getImageColor(): Vector
image.setImageColor(color: Vector): void
image.getImageAlpha(): number
image.setImageAlpha(alpha: number): void
```

### Button Widget Methods

```typescript
button.getButtonEnabled(): boolean
button.setButtonEnabled(enabled: boolean): void

// Colors for different states
button.getButtonColorBase(): Vector
button.setButtonColorBase(color: Vector): void
button.getButtonAlphaBase(): number
button.setButtonAlphaBase(alpha: number): void

button.buttonColorHover: Vector
button.buttonAlphaHover: number

button.buttonColorPressed: Vector
button.buttonAlphaPressed: number

button.buttonColorFocused: Vector
button.buttonAlphaFocused: number

button.buttonColorDisabled: Vector
button.buttonAlphaDisabled: number

// Events
button.onEvent(
    callback: (button: UIButtonWidget, player: Player, event: ButtonEvent) => void,
    eventTypes?: ButtonEvent
): UIButtonWidget
button.clearEventCallbacks(): UIButtonWidget
button.setEventTypes(event: ButtonEvent): UIButtonWidget
```

### Container Widget Methods

```typescript
container.getChildren(): Array<{ name: string; path: string }>
container.debugPrintHierarchy(): void
```

### Utility Functions

```typescript
// Initialization (call once during mod setup)
initializeUIButtonEventHandling(): void

// Paths and queries
getUIWidgetPath(widget: UIWidget): string | null

// Cleanup
cleanupPlayerUI(playerId: number): void
cleanupTeamUI(teamId: number): void
purgeAllPlayerUI(playerId: number): void

// Debugging
debugPrintUIHierarchy(): void

// Context creation
createPlayerUIContext(playerId: number, parent: UIContainerWidget): UIContainerWidget
createTeamUIContext(teamId: number, parent: UIContainerWidget): UIContainerWidget
```

### Default Values Table

| Property            | Default             |
| ------------------- | ------------------- |
| name                | Auto-generated      |
| position            | (0, 0, 0)           |
| size                | (100, 100, 0)       |
| anchor              | UIAnchor.TopLeft    |
| isVisible           | true                |
| depth               | UIDepth.BelowGameUI |
| bgColor             | (0, 0, 0)           |
| bgAlpha             | 0                   |
| bgFill              | UIBgFill.Solid      |
| padding             | 0                   |
| **Text-specific**   |                     |
| message             | ""                  |
| textColor           | (1, 1, 1)           |
| textAlpha           | 1                   |
| textSize            | 1                   |
| textAnchor          | UIAnchor.TopLeft    |
| **Image-specific**  |                     |
| imageType           | UIImageType.None    |
| imageColor          | (1, 1, 1)           |
| imageAlpha          | 1                   |
| **Button-specific** |                     |
| isEnabled           | true                |
| buttonColorBase     | (1, 1, 1)           |
| buttonAlphaBase     | 1                   |
| buttonColorHover    | (0.5, 0.5, 0.5)     |
| buttonAlphaHover    | 1                   |
| buttonColorPressed  | (0.3, 0.3, 0.3)     |
| buttonAlphaPressed  | 1                   |
| buttonColorFocused  | (1, 1, 1)           |
| buttonAlphaFocused  | 1                   |
| buttonColorDisabled | (0.8, 0.8, 0.8)     |
| buttonAlphaDisabled | 1                   |

---

## Best Practices

### 1. Use Array Shorthand for Vectors

```typescript
// ✅ Good - concise
const widget = root.addContainer({
    position: [100, 200, 0],
    bgColor: [0.2, 0.2, 0.2],
});

// ❌ Verbose
const widget = root.addContainer({
    position: new Vector(100, 200, 0),
    bgColor: new Vector(0.2, 0.2, 0.2),
});
```

### 2. Leverage Scope Inheritance

```typescript
// ✅ Good - don't repeat scope
const teamContainer = root.addContainer(
    { name: "Team1" },
    { scope: UIScope.TEAM, teamId: 1 }
);
const statusWidget = teamContainer.addText({ name: "Status" }); // Inherits TEAM

// ❌ Redundant - unnecessary scope specification
const statusWidget = teamContainer.addText(
    { name: "Status" },
    { scope: UIScope.TEAM, teamId: 1 } // Already inherited
);
```

### 3. Clean Up on Player Leave

```typescript
// ✅ Good - comprehensive cleanup
onPlayerLeave(player) {
    purgeAllPlayerUI(player.getId());
}

// ⚠️ Incomplete - misses descendants
onPlayerLeave(player) {
    cleanupPlayerUI(player.getId());
}
```

### 4. Use Contexts for Organization

```typescript
// ✅ Good - organized structure
const playerCtx = createPlayerUIContext(playerId, root);
const hud = playerCtx.addContainer({ name: "HUD" });
const score = hud.addText({ name: "Score" });

// ❌ Manual - error-prone
const playerContainer = root.addContainer(
    { name: `PlayerUI_${playerId}` },
    { scope: UIScope.PLAYER, playerId }
);
```

### 5. Name Widgets Meaningfully

```typescript
// ✅ Good - clear purpose
const startBtn = menu.addButton({
    name: "StartButton",
    // ...
});

// ❌ Vague
const btn = menu.addButton({
    name: "btn",
    // ...
});
```

### 6. Minimize Scope Mixing

```typescript
// ✅ Good - clear intention
const global = root.addContainer({ name: "Global" }); // GLOBAL
const team = global.addContainer(
    { name: "Team1" },
    { scope: UIScope.TEAM, teamId: 1 }
); // TEAM
const player = team.addContainer(
    { name: "Player" },
    { scope: UIScope.PLAYER, playerId: 5 }
); // PLAYER

// ❌ Confusing - too much scope jumping
const widget1 = root.addContainer({ name: "W1" }); // GLOBAL
const widget2 = widget1.addContainer(
    { name: "W2" },
    { scope: UIScope.PLAYER, playerId: 3 }
); // Sudden PLAYER jump
const widget3 = widget2.addContainer(
    { name: "W3" },
    { scope: UIScope.TEAM, teamId: 1 }
); // Back to TEAM
```

### 7. Structure Scopes to Avoid Blocking

Remember: **scope acts as a barrier**. If a child has an incompatible scope from a player's perspective, that player won't see it OR any descendants.

This is handled automatically by the mod API - scope visibility is enforced at render time. However, you must structure your hierarchy carefully to avoid unintended blocking.

```typescript
// ❌ BAD - Player-8 scope blocks Player-5 from seeing descendants
const playerOverlay = root.addContainer(
    { name: "Overlay" },
    { scope: UIScope.PLAYER, playerId: 5 }
);

playerOverlay.addContainer(
    { name: "HUD" },
    { scope: UIScope.PLAYER, playerId: 8 } // SCOPE BARRIER - player 5 won't see this or children
);

// ✅ GOOD - Keep global/team elements at top level, player-specific separate
const globalUI = root.addContainer({ name: "GameUI" }); // GLOBAL

// Add player-specific containers as siblings, not nested in other player scopes
const player5UI = root.addContainer(
    { name: "Player5UI" },
    { scope: UIScope.PLAYER, playerId: 5 }
);

const player8UI = root.addContainer(
    { name: "Player8UI" },
    { scope: UIScope.PLAYER, playerId: 8 }
);

// Each player only sees their own container - no blocking
```

### 8. Test Hierarchy During Development

```typescript
// During development
debugPrintUIHierarchy();

// When something seems wrong
console.log(widget.getPath());
console.log(widget.scopeContext);
```

### 9. Initialize Button Events Once

```typescript
// In mod setup (call once)
import { initializeUIButtonEventHandling } from "cascade";

initializeUIButtonEventHandling();

// Then use buttons throughout your code
const btn = container
    .addButton({ name: "Btn" })
    .onEvent((btn, player, event) => {
        // This will work now
    }, ButtonEvent.ButtonDown);
```

---

## Key Features

✅ **Props-Based API** - Clean, declarative widget creation
✅ **Three Scope Types** - Global, Team, Player at any hierarchy level
✅ **Mixed Hierarchies** - Different scope types can be mixed freely
✅ **Scope Inheritance** - Children inherit parent scope unless overridden
✅ **Comprehensive Cleanup** - Remove all widgets for a scope or player
✅ **Path-Based Organization** - Intuitive hierarchical naming
✅ **Full Hierarchy Tracking** - Query relationships and organization
✅ **Vector Shorthand** - Multiple formats for position/color properties
✅ **Type-Safe** - Full TypeScript support with autocomplete
✅ **Event System** - Built-in button event handling
✅ **Debugging Tools** - Print and inspect hierarchies easily
✅ **Context Helpers** - Quick creation of player/team UI contexts
