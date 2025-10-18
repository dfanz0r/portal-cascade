// src/cascade/structures/EmplacementSpawner.ts
// EmplacementSpawner wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { ISpawner } from "../interfaces/Capabilities";

/**
 * Wrapper class for EmplacementSpawner objects, providing ergonomic access to emplacement spawning operations.
 * Implements capabilities for spawning emplacements.
 */
export class EmplacementSpawner
    extends ModObject<mod.EmplacementSpawner>
    implements ISpawner<ModObject<mod.Object>>
{
    // ISpawner implementation
    /**
     * Spawns a new emplacement from this spawner.
     * @returns The spawned emplacement, or undefined if spawning failed.
     */
    spawn(): ModObject<mod.Object> | undefined {
        mod.ForceEmplacementSpawnerSpawn(this.handle);
        // Note: The mod API doesn't return the spawned emplacement handle directly
        // You would need to track this via events or other means
        return undefined;
    }

    /**
     * Enables or disables automatic spawning.
     * @param enabled Whether auto-spawning should be enabled.
     */
    setAutoSpawn(enabled: boolean): void {
        mod.SetEmplacementSpawnerAutoSpawn(this.handle, enabled);
    }

    /**
     * Sets the respawn time after destruction.
     * @param seconds Time in seconds before respawn.
     */
    setRespawnTime(seconds: number): void {
        mod.SetEmplacementSpawnerRespawnTime(this.handle, seconds);
    }

    /**
     * Sets the emplacement type to spawn.
     * @param emplacementType The type of emplacement to spawn.
     */
    setEmplacementType(emplacementType: mod.StationaryEmplacements): void {
        mod.SetEmplacementSpawnerType(this.handle, emplacementType);
    }

    /**
     * Sets whether to destroy emplacements left outside of the combat area.
     * @param enabled Whether emplacements should be destroyed outside combat area.
     */
    setAbandonOutOfCombat(enabled: boolean): void {
        mod.SetEmplacementSpawnerAbandonVehicleOutOfCombatArea(
            this.handle,
            enabled
        );
    }

    /**
     * Sets whether to apply damage to abandoned emplacements.
     * @param enabled Whether to apply damage to abandoned emplacements.
     */
    setApplyDamageToAbandoned(enabled: boolean): void {
        mod.SetEmplacementSpawnerApplyDamageToAbandonVehicle(
            this.handle,
            enabled
        );
    }

    /**
     * Sets the time before an emplacement is considered abandoned.
     * @param seconds The time in seconds.
     */
    setTimeUntilAbandon(seconds: number): void {
        mod.SetEmplacementSpawnerTimeUntilAbandon(this.handle, seconds);
    }

    /**
     * Sets the distance from the spawner to keep abandoned emplacements alive.
     * @param radius The distance in units.
     */
    setKeepAliveAbandonRadius(radius: number): void {
        mod.SetEmplacementSpawnerKeepAliveAbandonRadius(this.handle, radius);
    }

    /**
     * Sets the distance from the spawner for abandonment consideration.
     * @param radius The distance in units.
     */
    setSpawnerRadius(radius: number): void {
        mod.SetEmplacementSpawnerSpawnerRadius(this.handle, radius);
    }
}
