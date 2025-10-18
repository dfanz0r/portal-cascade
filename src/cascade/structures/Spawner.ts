// src/cascade/structures/Spawner.ts
// Spawner wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { Player } from "./Player";

/**
 * Wrapper class for Spawner objects, providing ergonomic access to AI spawning operations.
 */
export class Spawner extends ModObject<mod.Spawner> {
    /**
     * Spawns a new AI player from this spawner.
     * @param args Optional spawn parameters.
     * @returns The spawned AI player, or undefined if spawning failed.
     */
    spawn(...args: unknown[]): Player | undefined {
        // Basic spawn without parameters
        mod.SpawnAIFromAISpawner(this.handle);

        // Note: The mod API doesn't return the spawned AI player handle directly
        // You would need to track this via events or other means
        return undefined;
    }

    /**
     * Sets the delay (in seconds) before AI soldiers unspawn after death.
     * @param seconds Time in seconds before unspawn after death.
     */
    setUnspawnDelay(seconds: number): void {
        mod.SetUnspawnDelayInSeconds(this.handle, seconds);
    }
}
