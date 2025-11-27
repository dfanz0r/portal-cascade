// src/cascade/core/ModRegistry.ts
// Registry and lifecycle management system for mods with runtime plug/unplug capability

import {
    registerEventHandler,
    unregisterEventHandler,
    clearAllHandlers,
} from "./EventDispatcher";
import type { IMod } from "./IMod";
import { ValidationError, validateModData } from "./Validation";

/**
 * Metadata for a mod class and its instance.
 */
interface ModEntry {
    modConstructor: new () => IMod;
    instance: IMod | null;
    isPlugged: boolean;
}

namespace EventNames {
    export const OngoingGlobal = "ongoingGlobal";
    export const OngoingAreaTrigger = "ongoingAreaTrigger";
    export const OngoingCapturePoint = "ongoingCapturePoint";
    export const OngoingEmplacementSpawner = "ongoingEmplacementSpawner";
    export const OngoingHQ = "ongoingHQ";
    export const OngoingInteractPoint = "ongoingInteractPoint";
    export const OngoingMCOM = "ongoingMCOM";
    export const OngoingPlayer = "ongoingPlayer";
    export const OngoingScreenEffect = "ongoingScreenEffect";
    export const OngoingSector = "ongoingSector";
    export const OngoingSpawner = "ongoingSpawner";
    export const OngoingSpawnPoint = "ongoingSpawnPoint";
    export const OngoingTeam = "ongoingTeam";
    export const OngoingVehicle = "ongoingVehicle";
    export const OngoingVehicleSpawner = "ongoingVehicleSpawner";
    export const OngoingWaypointPath = "ongoingWaypointPath";
    export const OngoingWorldIcon = "ongoingWorldIcon";
    export const OnAIMoveToFailed = "onAIMoveToFailed";
    export const OnAIMoveToRunning = "onAIMoveToRunning";
    export const OnAIMoveToSucceeded = "onAIMoveToSucceeded";
    export const OnAIParachuteRunning = "onAIParachuteRunning";
    export const OnAIParachuteSucceeded = "onAIParachuteSucceeded";
    export const OnAIWaypointIdleFailed = "onAIWaypointIdleFailed";
    export const OnAIWaypointIdleRunning = "onAIWaypointIdleRunning";
    export const OnAIWaypointIdleSucceeded = "onAIWaypointIdleSucceeded";
    export const OnCapturePointCaptured = "onCapturePointCaptured";
    export const OnCapturePointCapturing = "onCapturePointCapturing";
    export const OnCapturePointLost = "onCapturePointLost";
    export const OnGameModeEnding = "onGameModeEnding";
    export const OnGameModeStarted = "onGameModeStarted";
    export const OnMandown = "onMandown";
    export const OnMCOMArmed = "onMCOMArmed";
    export const OnMCOMDefused = "onMCOMDefused";
    export const OnMCOMDestroyed = "onMCOMDestroyed";
    export const OnPlayerDamaged = "onPlayerDamaged";
    export const OnPlayerDeployed = "onPlayerDeployed";
    export const OnPlayerDied = "onPlayerDied";
    export const OnPlayerEarnedKill = "onPlayerEarnedKill";
    export const OnPlayerEarnedKillAssist = "onPlayerEarnedKillAssist";
    export const OnPlayerEnterAreaTrigger = "onPlayerEnterAreaTrigger";
    export const OnPlayerEnterCapturePoint = "onPlayerEnterCapturePoint";
    export const OnPlayerEnterVehicle = "onPlayerEnterVehicle";
    export const OnPlayerEnterVehicleSeat = "onPlayerEnterVehicleSeat";
    export const OnPlayerExitAreaTrigger = "onPlayerExitAreaTrigger";
    export const OnPlayerExitCapturePoint = "onPlayerExitCapturePoint";
    export const OnPlayerExitVehicle = "onPlayerExitVehicle";
    export const OnPlayerExitVehicleSeat = "onPlayerExitVehicleSeat";
    export const OnPlayerInteract = "onPlayerInteract";
    export const OnPlayerJoinGame = "onPlayerJoinGame";
    export const OnPlayerLeaveGame = "onPlayerLeaveGame";
    export const OnPlayerSwitchTeam = "onPlayerSwitchTeam";
    export const OnPlayerUIButtonEvent = "onPlayerUIButtonEvent";
    export const OnPlayerUndeploy = "onPlayerUndeploy";
    export const OnRayCastHit = "onRayCastHit";
    export const OnRayCastMissed = "onRayCastMissed";
    export const OnRevived = "onRevived";
    export const OnSpawnerSpawned = "onSpawnerSpawned";
    export const OnTimeLimitReached = "onTimeLimitReached";
    export const OnVehicleDestroyed = "onVehicleDestroyed";
    export const OnVehicleSpawned = "onVehicleSpawned";
}

/**
 * List of valid method names from the IMod interface.
 * Only methods in this list will be bound and dispatched.
 */
const VALID_MOD_METHODS = new Set<string>([
    // Global events
    EventNames.OngoingGlobal,
    EventNames.OnGameModeStarted,
    EventNames.OnGameModeEnding,
    // Player events
    EventNames.OnPlayerJoinGame,
    EventNames.OnPlayerLeaveGame,
    EventNames.OnPlayerDeployed,
    EventNames.OnPlayerUndeploy,
    EventNames.OnPlayerEarnedKill,
    EventNames.OnPlayerEarnedKillAssist,
    EventNames.OnPlayerDamaged,
    EventNames.OnPlayerDied,
    EventNames.OnRevived,
    EventNames.OnMandown,
    EventNames.OnPlayerSwitchTeam,
    // Vehicle events
    EventNames.OnVehicleSpawned,
    EventNames.OnVehicleDestroyed,
    EventNames.OnPlayerEnterVehicle,
    EventNames.OnPlayerExitVehicle,
    EventNames.OnPlayerEnterVehicleSeat,
    EventNames.OnPlayerExitVehicleSeat,
    // Capture point events
    EventNames.OnCapturePointCapturing,
    EventNames.OnCapturePointCaptured,
    EventNames.OnCapturePointLost,
    EventNames.OnPlayerEnterCapturePoint,
    EventNames.OnPlayerExitCapturePoint,
    // MCOM events
    EventNames.OnMCOMArmed,
    EventNames.OnMCOMDefused,
    EventNames.OnMCOMDestroyed,
    // Area trigger events
    EventNames.OnPlayerEnterAreaTrigger,
    EventNames.OnPlayerExitAreaTrigger,
    // Interact point events
    EventNames.OnPlayerInteract,
    // Spawner events
    EventNames.OnSpawnerSpawned,
    // Raycast events
    EventNames.OnRayCastHit,
    EventNames.OnRayCastMissed,
    // UI events
    EventNames.OnPlayerUIButtonEvent,
    // AI events
    EventNames.OnAIMoveToFailed,
    EventNames.OnAIMoveToRunning,
    EventNames.OnAIMoveToSucceeded,
    EventNames.OnAIParachuteRunning,
    EventNames.OnAIParachuteSucceeded,
    EventNames.OnAIWaypointIdleFailed,
    EventNames.OnAIWaypointIdleRunning,
    EventNames.OnAIWaypointIdleSucceeded,
    // Time events
    EventNames.OnTimeLimitReached,
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
 * Registers a mod so it can be plugged in at runtime.
 * Supports class constructors, object mods, and factory functions.
 *
 * Usage patterns:
 * - Class: registerModClass("MyMod", MyModClass)
 * - Object: registerModClass("MyMod", { onPlayerJoinGame: ... })
 * - Factory: registerModClass("MyMod", createMyMod())
 *
 * @param modNameOrConstructor The mod name or class constructor
 * @param modConstructorOrInstance Optional constructor or mod instance
 */
export function registerModClass(
    modNameOrConstructor: string | (new () => IMod),
    modConstructorOrInstance?: (new () => IMod) | IMod
): void {
    let modName: string;
    let modConstructor: new () => IMod;

    // Handle overload: (string, constructor/instance)
    if (typeof modNameOrConstructor === "string") {
        modName = modNameOrConstructor;

        if (modConstructorOrInstance === undefined) {
            throw new Error(
                `[ModRegistry] Missing constructor/instance for mod: ${modName}`
            );
        }

        if (typeof modConstructorOrInstance === "function") {
            // It's a constructor
            modConstructor = modConstructorOrInstance;
        } else if (typeof modConstructorOrInstance === "object") {
            // It's an object mod - wrap it in a factory function
            const objectMod = modConstructorOrInstance as IMod;
            modConstructor = (() => objectMod) as unknown as new () => IMod;
        } else {
            throw new Error(
                `[ModRegistry] Invalid mod registration for: ${modName}`
            );
        }
    }
    // Handle overload: (constructor)
    else if (typeof modNameOrConstructor === "function") {
        modConstructor = modNameOrConstructor;
        modName = modConstructor.name;
    } else {
        throw new Error("[ModRegistry] Invalid arguments to registerModClass");
    }

    if (availableMods.has(modName)) {
        console.warn(
            `[ModRegistry] Mod '${modName}' is already registered, skipping duplicate`
        );
        return;
    }

    availableMods.set(modName, {
        modConstructor,
        instance: null,
        isPlugged: false,
    });

    console.log(`[ModRegistry] Registered mod: ${modName}`);
}

/**
 * Plugs in (activates) a mod at runtime.
 *
 * This process:
 * 1. Looks up the mod class by name
 * 2. Creates a new instance if it doesn't exist
 * 3. Inspects its methods to find event handlers
 * 4. Registers each handler with EventDispatcher (wraps async methods)
 * 5. Calls the mod's onPlug() lifecycle method (awaits if async)
 *
 * @param modName The name of the mod class to activate
 * @returns Promise that resolves to true if successful, false if the mod doesn't exist
 */
export async function plug(modName: string): Promise<boolean> {
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

        // Validate mod data after instantiation
        try {
            validateModData(entry.instance, modName);
            console.log(`[ModRegistry] Validated mod data for: ${modName}`);
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error(
                    `[ModRegistry] Validation failed for mod '${modName}': ${error.message}`
                );
                throw error;
            }
            throw error;
        }
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
            const originalMethod = value as (
                ...args: unknown[]
            ) => void | Promise<void>;

            // Optimize for QuickJS: detect async methods at plug time
            // Only wrap async methods; sync methods bypass wrapper entirely
            const isAsync = originalMethod.constructor.name === "AsyncFunction";
            const handlerToRegister = isAsync
                ? (...args: unknown[]): void => {
                      const result = originalMethod.apply(
                          instance,
                          args
                      ) as Promise<void>;
                      result.catch((error) => {
                          console.error(
                              `[ModRegistry] Error in async handler '${modName}.${methodName}()':`,
                              error
                          );
                      });
                  }
                : originalMethod;

            // Register with EventDispatcher
            registerEventHandler(methodName, handlerToRegister);

            // Track the bound method for later unregistration
            const key = `${modName}.${methodName}`;
            boundMethodsRegistry.set(key, handlerToRegister);

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
            const result = instance.onPlug();
            // Await if async
            if (result instanceof Promise) {
                await result;
            }
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
 * 1. Calls the mod's onUnplug() lifecycle method (awaits if async)
 * 2. Unregisters all of its event handlers from EventDispatcher
 * 3. Clears internal references
 *
 * @param modName The name of the mod to deactivate
 * @returns Promise that resolves to true if successful, false if the mod doesn't exist or isn't plugged
 */
export async function unplug(modName: string): Promise<boolean> {
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
            const result = instance.onUnplug();
            // Await if async
            if (result instanceof Promise) {
                await result;
            }
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
            if (unregisterEventHandler(methodName, boundMethod)) {
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
    clearAllHandlers();
    console.log("[ModRegistry] Registry cleared");
}
