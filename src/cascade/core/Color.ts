import { Vector } from "./Vector";
import { Preserve } from "../decorators";

/**
 * Color class with alpha channel support
 * Provides centralized color handling with automatic alpha channel management
 * Stores RGB as a mod.Vector for direct use with the Portal engine API
 * Stores alpha (0-1) separately
 */
@Preserve()
export class Color {
    private readonly _vector: Vector;
    private readonly _a: number;

    /**
     * Create a new Color
     * Accepts normalized RGB values (0-1) for direct use with mod API
     * @param r Red component (0-1, normalized for mod API)
     * @param g Green component (0-1, normalized for mod API)
     * @param b Blue component (0-1, normalized for mod API)
     * @param a Alpha component (0-1), defaults to 1 (fully opaque)
     */
    constructor(r: number, g: number, b: number, a = 1) {
        // Clamp values to 0-1 range
        const _r = Math.max(0, Math.min(1, r));
        const _g = Math.max(0, Math.min(1, g));
        const _b = Math.max(0, Math.min(1, b));
        this._vector = new Vector(_r, _g, _b);
        this._a = Math.max(0, Math.min(1, a));
    }

    /**
     * Red component (0-1, normalized for mod API)
     */
    get r(): number {
        return this._vector.x;
    }

    /**
     * Green component (0-1, normalized for mod API)
     */
    get g(): number {
        return this._vector.y;
    }

    /**
     * Blue component (0-1, normalized for mod API)
     */
    get b(): number {
        return this._vector.z;
    }

    /**
     * Alpha component (0-1)
     */
    get a(): number {
        return this._a;
    }

    /**
     * Get the internal Vector for RGB components (0-1, normalized for mod API)
     * Can be used directly with mod.SetUIWidgetBgColor() and similar functions
     */
    toVector(): Vector {
        return this._vector;
    }

    /**
     * Get all components as a tuple [r, g, b, a]
     */
    get rgba(): [number, number, number, number] {
        return [this._vector.x, this._vector.y, this._vector.z, this._a];
    }

    /**
     * Get RGB components as a tuple [r, g, b] (0-1, normalized)
     */
    get rgb(): [number, number, number] {
        return [this._vector.x, this._vector.y, this._vector.z];
    }

    /**
     * Create a new Color with a different alpha value
     * @param a Alpha component (0-1)
     * @returns New Color instance with modified alpha
     */
    withAlpha(a: number): Color {
        return new Color(this._vector.x, this._vector.y, this._vector.z, a);
    }

    /**
     * Export as RGBA string: "rgba(r, g, b, a)"
     * Values are normalized (0-1) for display purposes
     * @returns RGBA string format
     */
    toRGBA(): string {
        return `rgba(${this._vector.x}, ${this._vector.y}, ${this._vector.z}, ${this._a})`;
    }

    /**
     * Export as RGB string: "rgb(r, g, b)"
     * Values are normalized (0-1) for display purposes
     * @returns RGB string format
     */
    toRGB(): string {
        return `rgb(${this._vector.x}, ${this._vector.y}, ${this._vector.z})`;
    }

    /**
     * Export as hexadecimal string: "#RRGGBB"
     * Note: alpha channel is not included in hex format
     * @returns Hex string format
     */
    toHex(): string {
        const toHex = (n: number) =>
            Math.round(n * 255)
                .toString(16)
                .padStart(2, "0");
        return `#${toHex(this._vector.x)}${toHex(this._vector.y)}${toHex(
            this._vector.z
        )}`;
    }

    /**
     * Export as hexadecimal string with alpha: "#RRGGBBAA"
     * @returns Hex string with alpha format
     */
    toHexA(): string {
        const toHex = (n: number) =>
            Math.round(n * 255)
                .toString(16)
                .padStart(2, "0");
        const alphaByte = Math.round(this._a * 255);
        return `#${toHex(this._vector.x)}${toHex(this._vector.y)}${toHex(
            this._vector.z
        )}${toHex(alphaByte)}`;
    }

    /**
     * Export as string (defaults to RGBA format)
     * @returns String representation
     */
    toString(): string {
        return this.toRGBA();
    }

    /**
     * Blend this color with another using linear interpolation
     * @param other Color to blend with
     * @param t Blend factor (0-1), where 0 is 100% this color and 1 is 100% other color
     * @returns New blended Color
     */
    blend(other: Color, t: number): Color {
        const clamp = (v: number) => Math.max(0, Math.min(1, v));
        const t2 = clamp(t);
        return new Color(
            this._vector.x + (other._vector.x - this._vector.x) * t2,
            this._vector.y + (other._vector.y - this._vector.y) * t2,
            this._vector.z + (other._vector.z - this._vector.z) * t2,
            this._a + (other._a - this._a) * t2
        );
    }

    /**
     * Create Color from hexadecimal string
     * @param hex Hex string in format "#RGB", "#RRGGBB", "#RGBA", or "#RRGGBBAA"
     * @returns Color instance
     * @throws If hex string format is invalid
     */
    static fromHex(hex: string): Color {
        // Remove # if present
        const cleaned = hex.replace(/^#/, "").toUpperCase();

        if (cleaned.length === 3) {
            // #RGB format
            const r = Number.parseInt(cleaned[0] + cleaned[0], 16);
            const g = Number.parseInt(cleaned[1] + cleaned[1], 16);
            const b = Number.parseInt(cleaned[2] + cleaned[2], 16);
            return new Color(r, g, b);
        }

        if (cleaned.length === 6) {
            // #RRGGBB format
            const r = Number.parseInt(cleaned.substring(0, 2), 16);
            const g = Number.parseInt(cleaned.substring(2, 4), 16);
            const b = Number.parseInt(cleaned.substring(4, 6), 16);
            return new Color(r, g, b);
        }

        if (cleaned.length === 4) {
            // #RGBA format
            const r = Number.parseInt(cleaned[0] + cleaned[0], 16);
            const g = Number.parseInt(cleaned[1] + cleaned[1], 16);
            const b = Number.parseInt(cleaned[2] + cleaned[2], 16);
            const a = Number.parseInt(cleaned[3] + cleaned[3], 16) / 255;
            return new Color(r, g, b, a);
        }

        if (cleaned.length === 8) {
            // #RRGGBBAA format
            const r = Number.parseInt(cleaned.substring(0, 2), 16);
            const g = Number.parseInt(cleaned.substring(2, 4), 16);
            const b = Number.parseInt(cleaned.substring(4, 6), 16);
            const a = Number.parseInt(cleaned.substring(6, 8), 16) / 255;
            return new Color(r, g, b, a);
        }

        throw new Error(
            `Invalid hex color format: "${hex}". Expected "#RGB", "#RRGGBB", "#RGBA", or "#RRGGBBAA"`
        );
    }

    /**
     * Create a transparent color (fully transparent black)
     * @returns Color instance with alpha 0
     */
    static transparent(): Color {
        return new Color(0, 0, 0, 0);
    }

    /**
     * Create a fully opaque white color
     * @returns Color instance
     */
    static white(): Color {
        return new Color(255, 255, 255, 1);
    }

    /**
     * Create a fully opaque black color
     * @returns Color instance
     */
    static black(): Color {
        return new Color(0, 0, 0, 1);
    }

    /**
     * Create a fully opaque red color
     * @returns Color instance
     */
    static red(): Color {
        return new Color(255, 0, 0, 1);
    }

    /**
     * Create a fully opaque green color
     * @returns Color instance
     */
    static green(): Color {
        return new Color(0, 255, 0, 1);
    }

    /**
     * Create a fully opaque blue color
     * @returns Color instance
     */
    static blue(): Color {
        return new Color(0, 0, 255, 1);
    }

    /**
     * Create a fully opaque yellow color
     * @returns Color instance
     */
    static yellow(): Color {
        return new Color(255, 255, 0, 1);
    }

    /**
     * Create a fully opaque cyan color
     * @returns Color instance
     */
    static cyan(): Color {
        return new Color(0, 255, 255, 1);
    }

    /**
     * Create a fully opaque magenta color
     * @returns Color instance
     */
    static magenta(): Color {
        return new Color(255, 0, 255, 1);
    }

    /**
     * Create a fully opaque gray color
     * @returns Color instance
     */
    static gray(): Color {
        return new Color(128, 128, 128, 1);
    }

    /**
     * Equality check
     * @param other Color to compare with
     * @returns True if all components match
     */
    equals(other: Color): boolean {
        return (
            this._vector.x === other._vector.x &&
            this._vector.y === other._vector.y &&
            this._vector.z === other._vector.z &&
            this._a === other._a
        );
    }

    /**
     * Clone this color
     * @returns New Color instance with same values
     */
    clone(): Color {
        return new Color(
            this._vector.x,
            this._vector.y,
            this._vector.z,
            this._a
        );
    }
}
