// src/cascade/static/World.ts
// Static utility namespace for world and object operations

import { GameArray } from '../core/GameArray';
import { Player } from '../structures/Player';

/**
 * Static utility namespace for world operations.
 * Provides methods for spawning objects, raycasting, and world manipulation.
 */
export namespace World {
    /**
     * Spawns an object at runtime.
     * @param prefabEnum The prefab type to spawn.
     * @param position The position to spawn at.
     * @param rotation The rotation of the object.
     * @param scale The scale of the object.
     * @returns The object ID if supported, otherwise -1.
     */
    export function spawnObject(
        prefabEnum:
            | mod.RuntimeSpawn_Common
            | mod.RuntimeSpawn_Abbasid
            | mod.RuntimeSpawn_Aftermath
            | mod.RuntimeSpawn_Battery
            | mod.RuntimeSpawn_Capstone
            | mod.RuntimeSpawn_Dumbo
            | mod.RuntimeSpawn_FireStorm
            | mod.RuntimeSpawn_Limestone
            | mod.RuntimeSpawn_Outskirts
            | mod.RuntimeSpawn_Tungsten,
        position: mod.Vector,
        rotation: mod.Vector,
        scale: mod.Vector
    ): mod.Any {
        return mod.SpawnObject(prefabEnum, position, rotation, scale);
    }

    /**
     * Performs a raycast between two points.
     * @param start The start position.
     * @param stop The end position.
     */
    export function raycast(start: mod.Vector, stop: mod.Vector): void {
        mod.RayCast(start, stop);
    }

    /**
     * Performs a raycast for a specific player.
     * @param player The player.
     * @param start The start position.
     * @param stop The end position.
     */
    export function raycastForPlayer(
        player: mod.Player,
        start: mod.Vector,
        stop: mod.Vector
    ): void {
        mod.RayCast(player, start, stop);
    }

    /**
     * Gets all players in a vehicle.
     * @param vehicle The vehicle.
     * @returns Array of players in the vehicle.
     */
    export function getAllPlayersInVehicle(
        vehicle: mod.Vehicle
    ): GameArray<Player> {
        return new GameArray(
            mod.GetAllPlayersInVehicle(vehicle),
            raw => new Player(raw as mod.Player)
        );
    }
}
