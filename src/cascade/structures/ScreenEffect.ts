// src/cascade/structures/ScreenEffect.ts
// ScreenEffect wrapper class that extends ModObject.

import { ModObject } from "../core/ModObject";
import type { Player } from "./Player";

/**
 * Wrapper class for ScreenEffect objects, providing ergonomic access to screen effect operations.
 */
export class ScreenEffect extends ModObject<mod.ScreenEffect> {
    /**
     * Enables this screen effect for a specific player.
     * @param player The player to enable the effect for.
     */
    enable(player: Player): void {
        mod.EnableScreenEffect(player.handle, this.handle, true);
    }

    /**
     * Disables this screen effect for a specific player.
     * @param player The player to disable the effect for.
     */
    disable(player: Player): void {
        mod.EnableScreenEffect(player.handle, this.handle, false);
    }

    /**
     * Sets whether this screen effect is enabled for a specific player.
     * @param player The player to affect.
     * @param enabled Whether the effect should be enabled.
     */
    setEnabled(player: Player, enabled: boolean): void {
        mod.EnableScreenEffect(player.handle, this.handle, enabled);
    }
}
