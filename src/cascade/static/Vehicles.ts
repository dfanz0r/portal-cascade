// src/cascade/static/Vehicles.ts
// Static utility namespace for vehicle operations

import { GameArray } from '../core/GameArray';
import type { Player } from '../structures/Player';
import { Vehicle } from '../structures/Vehicle';

/**
 * Static utility namespace for global vehicle-related operations and queries.
 *
 * For per-vehicle operations, use the instance methods on the Vehicle class:
 * - vehicle.kill(), vehicle.dealDamage(), vehicle.heal(), vehicle.setMaxHealthMultiplier(), etc.
 *
 * For per-player vehicle operations, use the instance methods on the Player class:
 * - player.getVehicle(), player.getVehicleSeat(), player.enterVehicle(), player.exitVehicle()
 */
export namespace Vehicles {
    /**
     * Gets all vehicles in the game.
     * @returns Array of all vehicles.
     */
    export function getAll(): GameArray<Vehicle> {
        return new GameArray(
            mod.AllVehicles(),
            raw => new Vehicle(raw as mod.Vehicle)
        );
    }

    /**
     * Gets the vehicle a player is in.
     * @param player The player.
     * @returns The vehicle, or undefined if not in a vehicle.
     */
    export function getFromPlayer(player: Player): Vehicle | undefined {
        const vehicleHandle = mod.GetVehicleFromPlayer(player.handle);
        // Check if valid using mod.IsVehicleValid if available
        return vehicleHandle ? new Vehicle(vehicleHandle) : undefined;
    }

    /**
     * Checks if a vehicle matches a specific type.
     * @param vehicle The vehicle.
     * @param type The vehicle type.
     * @returns True if the vehicle is of the specified type.
     */
    export function compareType(
        vehicle: Vehicle,
        type: mod.VehicleList
    ): boolean {
        return mod.CompareVehicleName(vehicle.handle, type);
    }
}
