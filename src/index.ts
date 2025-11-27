/**
 * portal-cascade Framework
 *
 * This framework provides modern, strongly-typed TypeScript wrappers
 * around the Battlefield Portal mod API with support for multiple decoupled mods.
 */

// Import core framework components
import {
    Color,
    ModObject,
    RaycastManager,
    ValidationError,
    Vector,
    registerModClass,
    validateMessageData,
    validateModData,
    validateStringsData,
} from "./cascade";
import type { IMod, RaycastRequest, RaycastResult } from "./cascade";
import type {
    IDamageable,
    IEnableable,
    IOwnable,
    IScalable,
    ISpawner,
    IUIAttachable,
    IVisible,
} from "./cascade";

// Import structure wrappers
import {
    AISpawner,
    AreaTrigger,
    CapturePoint,
    EmplacementSpawner,
    GameArray,
    HQ,
    InteractPoint,
    MCOM,
    Player,
    ScreenEffect,
    Sector,
    SpawnPoint,
    Spawner,
    Team,
    UIWidget,
    Vehicle,
    VehicleSpawner,
    WaypointPath,
    WorldIcon,
} from "./cascade";

// Import static namespaces
import {
    Audio,
    Deployment,
    Equipment,
    Game,
    MathUtils,
    Notifications,
    Players,
    Scoreboard,
    UI,
    Variables,
    Vehicles,
    World,
} from "./cascade";

// Import async utilities
import { wait } from "./cascade";

// Import decorator
import { AutoPlug } from "./cascade";

// Re-export core framework
export { ModObject, registerModClass, Vector, Color, RaycastManager, AutoPlug };
export {
    ValidationError,
    validateModData,
    validateMessageData,
    validateStringsData,
};
export type { IMod, RaycastRequest, RaycastResult };
export type {
    IDamageable,
    IEnableable,
    IOwnable,
    ISpawner,
    IScalable,
    IVisible,
    IUIAttachable,
};

// Re-export structure wrappers
export {
    GameArray,
    Player,
    Vehicle,
    CapturePoint,
    MCOM,
    HQ,
    VehicleSpawner,
    AISpawner,
    EmplacementSpawner,
    InteractPoint,
    ScreenEffect,
    Sector,
    SpawnPoint,
    Team,
    WaypointPath,
    WorldIcon,
    AreaTrigger,
    Spawner,
    UIWidget,
};

// Re-export static namespaces
export {
    Game,
    Players,
    Deployment,
    Vehicles,
    Variables,
    Audio,
    World,
    Scoreboard,
    Notifications,
    Equipment,
    UI,
    MathUtils,
};

// Re-export async utilities
export { wait };
