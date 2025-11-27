// src/cascade/structures/WorldIcon.ts
// WorldIcon wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import { Vector } from "../core/Vector";
import type { IEnableable } from "../interfaces/Capabilities";
import type { Player } from "./Player";
import type { Team } from "./Team";
import { Preserve } from "../decorators";

/**
 * Wrapper class for WorldIcon objects, providing ergonomic access to world icon operations.
 * Implements capabilities for enablement.
 */
@Preserve()
export class WorldIcon extends ModObject<mod.WorldIcon> implements IEnableable {
    // IEnableable implementation
    /**
     * Enables this world icon (both image and text).
     */
    enable(): void {
        mod.EnableWorldIconImage(this.handle, true);
        mod.EnableWorldIconText(this.handle, true);
    }

    /**
     * Disables this world icon (both image and text).
     */
    disable(): void {
        mod.EnableWorldIconImage(this.handle, false);
        mod.EnableWorldIconText(this.handle, false);
    }

    /**
     * Sets the position of this world icon.
     * @param position The new position.
     */
    setPosition(position: Vector | mod.Vector): void {
        const posHandle =
            position instanceof Vector ? position.getHandle() : position;
        mod.SetWorldIconPosition(this.handle, posHandle);
    }

    /**
     * Sets the text displayed above this world icon.
     * @param text The new text message.
     */
    setText(text: mod.Message): void {
        mod.SetWorldIconText(this.handle, text);
    }

    /**
     * Sets the color of this world icon.
     * @param color The new color vector.
     */
    setColor(color: Vector | mod.Vector): void {
        const colorHandle = color instanceof Vector ? color.getHandle() : color;
        mod.SetWorldIconColor(this.handle, colorHandle);
    }

    /**
     * Sets the image displayed for this world icon.
     * @param image The new image type.
     */
    setImage(image: mod.WorldIconImages): void {
        mod.SetWorldIconImage(this.handle, image);
    }

    /**
     * Sets the owner team for this world icon (restricts visibility to team).
     * @param team The owning team.
     */
    setOwnerTeam(team: mod.Team): void {
        mod.SetWorldIconOwner(this.handle, team);
    }

    /**
     * Sets the owner player for this world icon (restricts visibility to player).
     * @param player The owning player.
     */
    setOwnerPlayer(player: Player): void {
        mod.SetWorldIconOwner(this.handle, player.handle);
    }

    /**
     * Enables or disables the text display of this world icon.
     * @param enabled Whether text should be visible.
     */
    enableText(enabled: boolean): void {
        mod.EnableWorldIconText(this.handle, enabled);
    }

    /**
     * Enables or disables the image display of this world icon.
     * @param enabled Whether image should be visible.
     */
    enableImage(enabled: boolean): void {
        mod.EnableWorldIconImage(this.handle, enabled);
    }
}
