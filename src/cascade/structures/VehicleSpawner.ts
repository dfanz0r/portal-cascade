// src/cascade/structures/VehicleSpawner.ts
// VehicleSpawner wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { ISpawner } from "../interfaces/Capabilities";
import type { Vehicle } from "./Vehicle";
import { Preserve } from "../decorators";

/**
 * Wrapper class for VehicleSpawner objects, providing ergonomic access to vehicle spawning operations.
 * Implements capabilities for spawning vehicles.
 */
@Preserve()
export class VehicleSpawner
    extends ModObject<mod.VehicleSpawner>
    implements ISpawner<Vehicle>
{
    // ISpawner implementation
    /**
     * Spawns a new vehicle from this spawner.
     * @returns The spawned vehicle, or undefined if spawning failed.
     */
    spawn(): Vehicle | undefined {
        mod.ForceVehicleSpawnerSpawn(this.handle);
        // Note: The mod API doesn't return the spawned vehicle handle directly
        // You would need to track this via events or other means
        return undefined;
    }

    /**
     * Enables or disables automatic spawning.
     * @param enabled Whether auto-spawning should be enabled.
     */
    setAutoSpawn(enabled: boolean): void {
        mod.SetVehicleSpawnerAutoSpawn(this.handle, enabled);
    }

    /**
     * Sets the respawn time after destruction.
     * @param seconds Time in seconds before respawn.
     */
    setRespawnTime(seconds: number): void {
        mod.SetVehicleSpawnerRespawnTime(this.handle, seconds);
    }

    /**
     * Sets the vehicle type to spawn.
     * @param vehicleType The type of vehicle to spawn.
     */
    setVehicleType(vehicleType: mod.VehicleList): void {
        mod.SetVehicleSpawnerVehicleType(this.handle, vehicleType);
    }

    /**
     * Sets abandon rules for vehicles.
     * @param applyDamage Whether to apply damage to abandoned vehicles.
     * @param timeUntilAbandon Time in seconds before a vehicle is considered abandoned.
     * @param keepAliveRadius Radius within which to keep abandoned vehicles alive.
     */
    setAbandonRules(
        applyDamage: boolean,
        timeUntilAbandon: number,
        keepAliveRadius: number
    ): void {
        mod.SetVehicleSpawnerApplyDamageToAbandonVehicle(
            this.handle,
            applyDamage
        );
        mod.SetVehicleSpawnerTimeUntilAbandon(this.handle, timeUntilAbandon);
        mod.SetVehicleSpawnerKeepAliveAbandonRadius(
            this.handle,
            keepAliveRadius
        );
    }

    /**
     * Sets whether to destroy vehicles left outside of the combat area.
     * @param enabled Whether vehicles should be destroyed outside combat area.
     */
    setAbandonOutOfCombat(enabled: boolean): void {
        mod.SetVehicleSpawnerAbandonVehiclesOutOfCombatArea(
            this.handle,
            enabled
        );
    }

    /**
     * Sets whether to apply damage to abandoned vehicles.
     * @param enabled Whether to apply damage to abandoned vehicles.
     */
    setApplyDamageToAbandoned(enabled: boolean): void {
        mod.SetVehicleSpawnerApplyDamageToAbandonVehicle(this.handle, enabled);
    }

    /**
     * Sets the distance before a vehicle is considered abandoned.
     * @param radius The distance in units.
     */
    setTimeUntilAbandon(seconds: number): void {
        mod.SetVehicleSpawnerTimeUntilAbandon(this.handle, seconds);
    }

    /**
     * Sets the distance from the spawner to keep abandoned vehicles alive.
     * @param radius The distance in units.
     */
    setKeepAliveAbandonRadius(radius: number): void {
        mod.SetVehicleSpawnerKeepAliveAbandonRadius(this.handle, radius);
    }

    /**
     * Sets the distance from the spawner for abandonment consideration.
     * @param radius The distance in units.
     */
    setSpawnerRadius(radius: number): void {
        mod.SetVehicleSpawnerKeepAliveSpawnerRadius(this.handle, radius);
    }
}
