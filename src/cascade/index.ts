// src/cascade/index.ts
// Main framework entry point - exports all framework components

// Core
export { ModObject } from "./core/ModObject";
export { IMod } from "./core/IMod";
export { Vector } from "./core/Vector";
export { wait } from "./core/Async";
export {
    registerModClass,
    plug,
    unplug,
    getAvailableMods,
    isModPlugged,
    getPluggedMods,
    clearRegistry,
} from "./core/ModRegistry";

// Interfaces
export type {
    IDamageable,
    IEnableable,
    IOwnable,
    ISpawner,
    IScalable,
    IVisible,
    IUIAttachable,
} from "./interfaces/Capabilities";

// Structures
export * from "./structures";

// Static utilities
export * from "./static";

// Static utilities will be added here later
// export * from "./static";
