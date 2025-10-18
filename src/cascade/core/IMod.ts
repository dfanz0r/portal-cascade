// src/cascade/core/Mod.ts
// Base Mod class that users implement to handle game events

/**
 * Mod base class for game mods. Users should extend this class and implement
 * the event handler methods they want to respond to. All handler methods are optional.
 *
 * The framework will automatically forward event calls to the active mod instance
 * that implements the corresponding handler method.
 *
 * The Mod class only includes the most commonly used events. For a simpler implementation,
 * users can extend this class and implement only the events they need.
 *
 * @example
 * ```typescript
 * export class MyMod extends Mod {
 *     onPlayerJoinGame(player: mod.Player): void {
 *         console.log('Player joined!');
 *     }
 *
 *     onGameModeStarted(): void {
 *         console.log('Game started!');
 *     }
 * }
 *
 * // Create and activate the mod in bootstrap.ts
 * const activeMod = new MyMod();
 * ```
 */
export interface IMod {
    // Lifecycle events
    /**
     * Called when the mod is activated/plugged in at runtime.
     * Use this for initialization, setup, and state initialization.
     * Optional - implement only if needed.
     */
    onPlug?(): void;

    /**
     * Called when the mod is deactivated/unplugged at runtime.
     * Use this for cleanup, state reset, and resource cleanup.
     * Optional - implement only if needed.
     */
    onUnplug?(): void;

    // Global events
    /**
     * Called continuously during gameplay for global updates.
     */
    ongoingGlobal?(): void;

    /**
     * Called when the game mode starts.
     */
    onGameModeStarted?(): void;

    /**
     * Called when the game mode is ending.
     */
    onGameModeEnding?(): void;

    // Player events
    /**
     * Called when a player joins the game.
     */
    onPlayerJoinGame?(player: mod.Player): void;

    /**
     * Called when a player leaves the game.
     */
    onPlayerLeaveGame?(playerId: number): void;

    /**
     * Called when a player deploys.
     */
    onPlayerDeployed?(player: mod.Player): void;

    /**
     * Called when a player undeploys.
     */
    onPlayerUndeploy?(player: mod.Player): void;

    /**
     * Called when a player earns a kill.
     */
    onPlayerEarnedKill?(
        player: mod.Player,
        otherPlayer: mod.Player,
        deathType: mod.DeathType,
        weaponUnlock: mod.WeaponUnlock
    ): void;

    /**
     * Called when a player earns a kill assist.
     */
    onPlayerEarnedKillAssist?(
        player: mod.Player,
        otherPlayer: mod.Player
    ): void;

    /**
     * Called when a player takes damage.
     */
    onPlayerDamaged?(
        player: mod.Player,
        otherPlayer: mod.Player,
        damageType: mod.DamageType,
        weaponUnlock: mod.WeaponUnlock
    ): void;

    /**
     * Called when a player dies.
     */
    onPlayerDied?(
        player: mod.Player,
        otherPlayer: mod.Player,
        deathType: mod.DeathType,
        weaponUnlock: mod.WeaponUnlock
    ): void;

    /**
     * Called when a player is revived.
     */
    onRevived?(player: mod.Player, otherPlayer: mod.Player): void;

    /**
     * Called when a player is forced into the mandown state.
     */
    onMandown?(player: mod.Player, otherPlayer: mod.Player): void;

    /**
     * Called when a player switches teams.
     */
    onPlayerSwitchTeam?(player: mod.Player, team: mod.Team): void;

    // Vehicle events
    /**
     * Called when a vehicle is spawned.
     */
    onVehicleSpawned?(vehicle: mod.Vehicle): void;

    /**
     * Called when a vehicle is destroyed.
     */
    onVehicleDestroyed?(vehicle: mod.Vehicle): void;

    /**
     * Called when a player enters a vehicle.
     */
    onPlayerEnterVehicle?(player: mod.Player, vehicle: mod.Vehicle): void;

    /**
     * Called when a player exits a vehicle.
     */
    onPlayerExitVehicle?(player: mod.Player, vehicle: mod.Vehicle): void;

    /**
     * Called when a player enters a specific vehicle seat.
     */
    onPlayerEnterVehicleSeat?(
        player: mod.Player,
        vehicle: mod.Vehicle,
        seat: mod.Object
    ): void;

    /**
     * Called when a player exits a specific vehicle seat.
     */
    onPlayerExitVehicleSeat?(
        player: mod.Player,
        vehicle: mod.Vehicle,
        seat: mod.Object
    ): void;

    // Capture point events
    /**
     * Called when a team begins capturing a capture point.
     */
    onCapturePointCapturing?(capturePoint: mod.CapturePoint): void;

    /**
     * Called when a team captures a capture point.
     */
    onCapturePointCaptured?(capturePoint: mod.CapturePoint): void;

    /**
     * Called when a team loses control of a capture point.
     */
    onCapturePointLost?(capturePoint: mod.CapturePoint): void;

    /**
     * Called when a player enters a capture point area.
     */
    onPlayerEnterCapturePoint?(
        player: mod.Player,
        capturePoint: mod.CapturePoint
    ): void;

    /**
     * Called when a player exits a capture point area.
     */
    onPlayerExitCapturePoint?(
        player: mod.Player,
        capturePoint: mod.CapturePoint
    ): void;

    // MCOM events
    /**
     * Called when an MCOM is armed.
     */
    onMCOMArmed?(mcom: mod.MCOM): void;

    /**
     * Called when an MCOM is defused.
     */
    onMCOMDefused?(mcom: mod.MCOM): void;

    /**
     * Called when an MCOM detonates.
     */
    onMCOMDestroyed?(mcom: mod.MCOM): void;

    // Area trigger events
    /**
     * Called when a player enters an area trigger.
     */
    onPlayerEnterAreaTrigger?(
        player: mod.Player,
        areaTrigger: mod.AreaTrigger
    ): void;

    /**
     * Called when a player exits an area trigger.
     */
    onPlayerExitAreaTrigger?(
        player: mod.Player,
        areaTrigger: mod.AreaTrigger
    ): void;

    // Interact point events
    /**
     * Called when a player interacts with an interact point.
     */
    onPlayerInteract?(
        player: mod.Player,
        interactPoint: mod.InteractPoint
    ): void;

    // Spawner events
    /**
     * Called when a spawner spawns an AI.
     */
    onSpawnerSpawned?(player: mod.Player, spawner: mod.Spawner): void;

    // Raycast events
    /**
     * Called when a raycast hits a target.
     */
    onRayCastHit?(
        player: mod.Player,
        point: mod.Vector,
        normal: mod.Vector
    ): void;

    /**
     * Called when a raycast misses.
     */
    onRayCastMissed?(player: mod.Player): void;

    // UI events
    /**
     * Called when a player interacts with a UI button.
     */
    onPlayerUIButtonEvent?(
        player: mod.Player,
        uiWidget: mod.UIWidget,
        uiButtonEvent: mod.UIButtonEvent
    ): void;

    // AI events
    /**
     * Called when an AI fails to move to a destination.
     */
    onAIMoveToFailed?(player: mod.Player): void;

    /**
     * Called when an AI starts moving to a target location.
     */
    onAIMoveToRunning?(player: mod.Player): void;

    /**
     * Called when an AI reaches its target location.
     */
    onAIMoveToSucceeded?(player: mod.Player): void;

    /**
     * Called when an AI parachute action is running.
     */
    onAIParachuteRunning?(player: mod.Player): void;

    /**
     * Called when an AI parachute action succeeds.
     */
    onAIParachuteSucceeded?(player: mod.Player): void;

    /**
     * Called when an AI stops following a waypoint.
     */
    onAIWaypointIdleFailed?(player: mod.Player): void;

    /**
     * Called when an AI starts following a waypoint.
     */
    onAIWaypointIdleRunning?(player: mod.Player): void;

    /**
     * Called when an AI finishes following a waypoint.
     */
    onAIWaypointIdleSucceeded?(player: mod.Player): void;

    // Time events
    /**
     * Called when the time limit is reached.
     */
    onTimeLimitReached?(): void;
}
