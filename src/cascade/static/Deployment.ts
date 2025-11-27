// src/cascade/static/Deployment.ts
// Static utility namespace for player spawn and deployment control

import type { Player } from '../structures/Player';
import type { SpawnPoint } from '../structures/SpawnPoint';

/**
 * Static utility namespace for controlling player deployment and spawning.
 *
 * For per-player operations, use the instance methods on the Player class:
 * - player.deploy(), player.undeploy(), player.setRedeployTime(), player.enableDeploy()
 */
export namespace Deployment {
    /**
     * Deploys all players into the game (global operation).
     */
    export function deployAll(): void {
        mod.DeployAllPlayers();
    }

    /**
     * Undeploys all players back to the deploy screen (global operation).
     */
    export function undeployAll(): void {
        mod.UndeployAllPlayers();
    }

    /**
     * Sets the spawn mode for the game (global setting).
     * @param mode The spawn mode.
     */
    export function setSpawnMode(mode: mod.SpawnModes): void {
        mod.SetSpawnMode(mode);
    }

    /**
     * Enables or disables deployment for all players (global setting).
     * @param enabled Whether deployment should be allowed.
     */
    export function enableAllPlayerDeploy(enabled: boolean): void {
        mod.EnableAllPlayerDeploy(enabled);
    }

    /**
     * Spawns a player from a specific spawn point.
     * @param player The player to spawn.
     * @param spawnPoint The spawn point.
     */
    export function spawnPlayerFromSpawnPoint(
        player: Player,
        spawnPoint: SpawnPoint
    ): void {
        mod.SpawnPlayerFromSpawnPoint(player.handle, spawnPoint.handle);
    }

    /**
     * Spawns a player from a spawn point by ID.
     * @param player The player to spawn.
     * @param spawnPointId The spawn point ID.
     */
    export function spawnPlayerFromSpawnPointId(
        player: Player,
        spawnPointId: number
    ): void {
        mod.SpawnPlayerFromSpawnPoint(player.handle, spawnPointId);
    }
}
