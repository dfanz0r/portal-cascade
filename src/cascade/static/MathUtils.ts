// src/cascade/static/MathUtils.ts
// Static utility namespace for mathematical operations and vector utilities

import { Vector } from "../core/Vector";

/**
 * Gets a random number between min and max.
 * @param min The minimum.
 * @param max The maximum.
 * @returns A random number.
 */
export function random(min: number, max: number): number {
    return mod.RandomReal(min, max);
}

/**
 * Static utility namespace for mathematical and vector operations.
 */
export namespace MathUtils {
    /**
     * Creates a transform from position and rotation vectors.
     * @param position The position vector.
     * @param rotation The rotation vector.
     * @returns The transform.
     */
    export function createTransform(
        position: Vector,
        rotation: Vector
    ): mod.Transform {
        return mod.CreateTransform(position.getHandle(), rotation.getHandle());
    }

    /**
     * Gets the absolute value.
     * @param value The value.
     * @returns The absolute value.
     */
    export function abs(value: number): number {
        return mod.AbsoluteValue(value);
    }

    /**
     * Gets the difference between two angles in degrees.
     * @param a The first angle.
     * @param b The second angle.
     * @returns The angle difference.
     */
    export function angleDifference(a: number, b: number): number {
        return mod.AngleDifference(a, b);
    }

    /**
     * Gets the minimum of two numbers.
     * @param a The first number.
     * @param b The second number.
     * @returns The minimum.
     */
    export function min(a: number, b: number): number {
        // Not directly available in mod API, using conditional
        return a < b ? a : b;
    }

    /**
     * Gets the maximum of two numbers.
     * @param a The first number.
     * @param b The second number.
     * @returns The maximum.
     */
    export function max(a: number, b: number): number {
        return mod.Max(a, b);
    }

    /**
     * Clamps a number between a minimum and maximum value.
     * @param value The value to clamp.
     * @param min The minimum value.
     * @param max The maximum value.
     * @returns The clamped value.
     */
    export function clamp(value: number, min: number, max: number): number {
        return value < min ? min : value > max ? max : value;
    }

    /**
     * Clamps a number between 0 and 1.
     * @param value The value to clamp.
     * @returns The clamped value between 0 and 1.
     */
    export function clamp01(value: number): number {
        return clamp(value, 0, 1);
    }

    /**
     * Repeats a value within a specified length, wrapping around.
     * @param t The value to repeat.
     * @param length The length of the repeat cycle.
     * @returns The repeated value between 0 and length.
     */
    export function repeat(t: number, length: number): number {
        return clamp(t - floor(t / length) * length, 0, length);
    }

    /**
     * Gets the modulo (remainder) of two numbers.
     * @param a The dividend.
     * @param b The divisor.
     * @returns The remainder.
     */
    export function modulo(a: number, b: number): number {
        return mod.Modulo(a, b);
    }

    /**
     * Floors a number.
     * @param value The value.
     * @returns The floored value.
     */
    export function floor(value: number): number {
        return mod.Floor(value);
    }

    /**
     * Ceils a number.
     * @param value The value.
     * @returns The ceiled value.
     */
    export function ceil(value: number): number {
        return mod.Ceiling(value);
    }

    /**
     * Rounds a number to the nearest integer.
     * @param value The value.
     * @returns The rounded value.
     */
    export function round(value: number): number {
        return mod.RoundToInteger(value);
    }

    /**
     * Gets the square root of a number.
     * @param value The value.
     * @returns The square root.
     */
    export function sqrt(value: number): number {
        return mod.SquareRoot(value);
    }

    /**
     * Raises a number to a power.
     * @param base The base.
     * @param exponent The exponent.
     * @returns The result.
     */
    export function pow(base: number, exponent: number): number {
        return mod.RaiseToPower(base, exponent);
    }

    /**
     * Gets the sine of an angle in degrees.
     * @param degrees The angle in degrees.
     * @returns The sine value.
     */
    export function sinDegrees(degrees: number): number {
        return mod.SineFromDegrees(degrees);
    }

    /**
     * Gets the sine of an angle in radians.
     * @param radians The angle in radians.
     * @returns The sine value.
     */
    export function sinRadians(radians: number): number {
        return mod.SineFromRadians(radians);
    }

    /**
     * Gets the cosine of an angle in degrees.
     * @param degrees The angle in degrees.
     * @returns The cosine value.
     */
    export function cosDegrees(degrees: number): number {
        return mod.CosineFromDegrees(degrees);
    }

    /**
     * Gets the cosine of an angle in radians.
     * @param radians The angle in radians.
     * @returns The cosine value.
     */
    export function cosRadians(radians: number): number {
        return mod.CosineFromRadians(radians);
    }

    /**
     * Gets the tangent of an angle in degrees.
     * @param degrees The angle in degrees.
     * @returns The tangent value.
     */
    export function tanDegrees(degrees: number): number {
        return mod.TangentFromDegrees(degrees);
    }

    /**
     * Gets the tangent of an angle in radians.
     * @param radians The angle in radians.
     * @returns The tangent value.
     */
    export function tanRadians(radians: number): number {
        return mod.TangentFromRadians(radians);
    }

    /**
     * Gets the arcsine in degrees.
     * @param value The value (-1 to 1).
     * @returns The arcsine in degrees.
     */
    export function asinDegrees(value: number): number {
        return mod.ArcsineInDegrees(value);
    }

    /**
     * Gets the arcsine in radians.
     * @param value The value (-1 to 1).
     * @returns The arcsine in radians.
     */
    export function asinRadians(value: number): number {
        return mod.ArcsineInRadians(value);
    }

    /**
     * Gets the arccosine in degrees.
     * @param value The value (-1 to 1).
     * @returns The arccosine in degrees.
     */
    export function acosDegrees(value: number): number {
        return mod.ArccosineInDegrees(value);
    }

    /**
     * Gets the arccosine in radians.
     * @param value The value (-1 to 1).
     * @returns The arccosine in radians.
     */
    export function acosRadians(value: number): number {
        return mod.ArccosineInRadians(value);
    }

    /**
     * Gets the arctangent in degrees.
     * @param value The value.
     * @returns The arctangent in degrees.
     */
    export function atanDegrees(value: number): number {
        return mod.ArctangentInDegrees(value);
    }

    /**
     * Gets the arctangent in radians.
     * @param value The value.
     * @returns The arctangent in radians.
     */
    export function atanRadians(value: number): number {
        return mod.ArctangentInRadians(value);
    }

    /**
     * Converts degrees to radians.
     * @param degrees The degrees.
     * @returns The radians.
     */
    export function degreesToRadians(degrees: number): number {
        return mod.DegreesToRadians(degrees);
    }

    /**
     * Converts radians to degrees.
     * @param radians The radians.
     * @returns The degrees.
     */
    export function radiansToDegrees(radians: number): number {
        return mod.RadiansToDegrees(radians);
    }

    /**
     * Gets the constant value of pi.
     * @returns Pi.
     */
    export function pi(): number {
        return mod.Pi();
    }

    /**
     * Gets a random number between min and max.
     * @param min The minimum.
     * @param max The maximum.
     * @returns A random number.
     */
    export function random(min: number, max: number): number {
        return mod.RandomReal(min, max);
    }

    /**
     * Converts a local position to world position for a player.
     * @param localPos The local position.
     * @param player The player.
     * @returns The world position.
     */
    export function toWorldPosition(
        localPos: Vector,
        player: mod.Player
    ): Vector {
        return new Vector(mod.WorldPositionOf(localPos.getHandle(), player));
    }

    /**
     * Converts a world position to local position for a player.
     * @param worldPos The world position.
     * @param player The player.
     * @returns The local position.
     */
    export function toLocalPosition(
        worldPos: Vector,
        player: mod.Player
    ): Vector {
        return new Vector(mod.LocalPositionOf(worldPos.getHandle(), player));
    }

    /**
     * Converts a local vector to world vector for a player.
     * @param localVec The local vector.
     * @param player The player.
     * @returns The world vector.
     */
    export function toWorldVector(
        localVec: Vector,
        player: mod.Player
    ): Vector {
        return new Vector(mod.WorldVectorOf(localVec.getHandle(), player));
    }

    /**
     * Converts a world vector to local vector for a player.
     * @param worldVec The world vector.
     * @param player The player.
     * @returns The local vector.
     */
    export function toLocalVector(
        worldVec: Vector,
        player: mod.Player
    ): Vector {
        return new Vector(mod.LocalVectorOf(worldVec.getHandle(), player));
    }
}
