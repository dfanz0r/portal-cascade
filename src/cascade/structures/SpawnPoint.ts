// src/cascade/structures/SpawnPoint.ts
// SpawnPoint wrapper class that extends ModObject.

import { ModObject } from '../core/ModObject';
import type { Player } from './Player';

/**
 * Wrapper class for SpawnPoint objects, providing ergonomic access to spawn point operations.
 */
export class SpawnPoint extends ModObject<mod.SpawnPoint> {
    /**
     * Spawns a player from this spawn point.
     * @param player The player to spawn.
     */
    spawnPlayer(player: Player): void {
        mod.SpawnPlayerFromSpawnPoint(player.handle, this.handle);
    }

    /**
     * Gets the ID of this spawn point.
     * @returns The spawn point ID.
     */
    getSpawnPointId(): number {
        return this.getId();
    }
}
