// src/cascade/static/Teleport.ts
// Static utility namespace for teleportation operations

import type { Player } from "../structures/Player";
import type { Vehicle } from "../structures/Vehicle";

/**
 * Static utility namespace for teleporting players and vehicles.
 */
export namespace Teleport {
    /**
     * Teleports a player to a destination.
     * @param player The player to teleport.
     * @param destination The destination position.
     * @param orientation The orientation angle in radians.
     */
    export function player(
        player: Player,
        destination: mod.Vector,
        orientation: number
    ): void {
        mod.Teleport(player.handle, destination, orientation);
    }

    /**
     * Teleports a vehicle to a destination.
     * @param vehicle The vehicle to teleport.
     * @param destination The destination position.
     * @param orientation The orientation angle in radians.
     */
    export function vehicle(
        vehicle: Vehicle,
        destination: mod.Vector,
        orientation: number
    ): void {
        mod.Teleport(vehicle.handle, destination, orientation);
    }
}
