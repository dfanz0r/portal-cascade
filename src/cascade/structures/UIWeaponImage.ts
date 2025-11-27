// src/cascade/structures/UIWeaponImage.ts
// UIWeaponImage wrapper class for displaying weapon icons/images in the UI

import { Color } from "../core/Color";
import { Vector } from "../core/Vector";
import { UIStylableWidget } from "./UIWidget";

/**
 * A weapon image widget wrapper providing weapon-specific operations and styling.
 *
 * Displays weapon images in the UI with support for color tinting and alpha transparency.
 * Extends UIStylableWidget to inherit positioning, sizing, and basic styling capabilities.
 *
 * Weapon images are specialized image widgets that display weapon icons.
 * They support the same color and alpha properties as regular image widgets.
 *
 * Useful for HUD overlays, weapon selectors, equipment displays, and other UI elements
 * that need to show weapon images with customizable appearance.
 *
 * @example
 * ```typescript
 * const container = UI.GetRoot() as UIContainerWidget;
 * const weaponImage = container.addWeaponImage({
 *     weapon: mod.Weapons.M416,
 *     position: new Vector(10, 10, 0),
 *     size: new Vector(100, 100, 0),
 *     imageColor: Color.white(),
 *     imageAlpha: 1,
 * });
 *
 * // Tint the weapon image
 * weaponImage.setImageColor(Color.red());
 * weaponImage.setImageAlpha(0.8);
 * ```
 */
export class UIWeaponImage extends UIStylableWidget {
    /**
     * Gets the image type of this weapon widget.
     * Weapon image widgets use the image type field for internal weapon representation.
     * @returns The image type.
     */
    public getImageType(): mod.UIImageType {
        return mod.GetUIImageType(this.handle);
    }

    /**
     * Gets the image color of this weapon widget as a Color instance.
     * @returns The image color (color components are normalized 0-1 from mod API).
     */
    public getImageColor(): Vector {
        return new Vector(mod.GetUIImageColor(this.handle));
    }

    /**
     * Sets the image color of this weapon widget.
     * Supports Color instances, Vector objects, or [r, g, b] arrays.
     * @param color The new image color.
     */
    public setImageColor(
        color: Color | Vector | [number, number, number]
    ): void {
        let vector: Vector;

        if (color instanceof Color) {
            // Normalize Color from [0-255] to [0-1] for normalized UI coordinates
            vector = new Vector(color.r / 255, color.g / 255, color.b / 255);
        } else if (color instanceof Vector) {
            vector = color;
        } else {
            // Array format [r, g, b]
            vector = new Vector(color[0], color[1], color[2]);
        }

        mod.SetUIImageColor(this.handle, vector.getHandle());
    }

    /**
     * Gets the image alpha of this weapon widget.
     * @returns The image alpha (0-1).
     */
    public getImageAlpha(): number {
        return mod.GetUIImageAlpha(this.handle);
    }

    /**
     * Sets the image alpha of this weapon widget.
     * @param alpha The new image alpha (0-1).
     */
    public setImageAlpha(alpha: number): void {
        mod.SetUIImageAlpha(this.handle, alpha);
    }
}
