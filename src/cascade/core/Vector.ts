// src/cascade/core/Vector.ts
// Vector wrapper class providing developer-friendly access to mod.Vector

/**
 * Wrapper class for Vector objects, providing ergonomic access to vector components and operations.
 */
export class Vector {
    private handle: mod.Vector;

    /**
     * Creates a new Vector wrapper from x, y, z components.
     * @param x The X component.
     * @param y The Y component.
     * @param z The Z component.
     */
    public constructor(x: number, y: number, z: number);

    /**
     * Creates a new Vector wrapper from an existing mod.Vector handle.
     * @param handle The mod.Vector handle.
     */
    public constructor(handle: mod.Vector);

    public constructor(x: number | mod.Vector, y?: number, z?: number) {
        if (typeof x === "number" && y !== undefined && z !== undefined) {
            this.handle = mod.CreateVector(x, y, z);
        } else if (typeof x !== "number") {
            this.handle = x as mod.Vector;
        } else {
            throw new Error(
                "Vector constructor requires either (x, y, z) numbers or a single mod.Vector handle"
            );
        }
    }

    /**
     * Gets the underlying mod.Vector handle.
     * @returns The mod.Vector handle.
     */
    public getHandle(): mod.Vector {
        return this.handle;
    }

    /**
     * Property accessor for the X component.
     */
    public get x(): number {
        return mod.XComponentOf(this.handle);
    }

    public set x(value: number) {
        this.handle = mod.CreateVector(value, this.y, this.z);
    }

    /**
     * Property accessor for the Y component.
     */
    public get y(): number {
        return mod.YComponentOf(this.handle);
    }

    public set y(value: number) {
        this.handle = mod.CreateVector(this.x, value, this.z);
    }

    /**
     * Property accessor for the Z component.
     */
    public get z(): number {
        return mod.ZComponentOf(this.handle);
    }

    public set z(value: number) {
        this.handle = mod.CreateVector(this.x, this.y, value);
    }

    /**
     * Gets the magnitude (length) of this vector.
     * @returns The magnitude.
     */
    public magnitude(): number {
        return mod.DistanceBetween(mod.CreateVector(0, 0, 0), this.handle);
    }

    /**
     * Normalizes this vector (returns a new Vector with magnitude 1).
     * @returns A new normalized Vector.
     */
    public normalized(): Vector {
        return new Vector(mod.Normalize(this.handle));
    }

    /**
     * Adds another vector to this vector.
     * @param other The vector to add.
     * @returns A new Vector representing the sum.
     */
    public add(other: Vector): Vector {
        return new Vector(
            mod.Add(this.handle, other.getHandle()) as mod.Vector
        );
    }

    /**
     * Subtracts another vector from this vector.
     * @param other The vector to subtract.
     * @returns A new Vector representing the difference.
     */
    public subtract(other: Vector): Vector {
        return new Vector(
            mod.Subtract(this.handle, other.getHandle()) as mod.Vector
        );
    }

    /**
     * Multiplies this vector by a scalar.
     * @param scalar The scalar to multiply by.
     * @returns A new scaled Vector.
     */
    public multiply(scalar: number): Vector {
        return new Vector(mod.Multiply(this.handle, scalar) as mod.Vector);
    }

    /**
     * Divides this vector by a scalar.
     * @param scalar The scalar to divide by.
     * @returns A new scaled Vector.
     */
    public divide(scalar: number): Vector {
        return new Vector(mod.Divide(this.handle, scalar) as mod.Vector);
    }

    /**
     * Calculates the dot product of this vector with another.
     * @param other The other vector.
     * @returns The dot product.
     */
    public dot(other: Vector): number {
        return mod.DotProduct(this.handle, other.getHandle());
    }

    /**
     * Calculates the cross product of this vector with another.
     * @param other The other vector.
     * @returns A new Vector representing the cross product.
     */
    public cross(other: Vector): Vector {
        return new Vector(mod.CrossProduct(this.handle, other.getHandle()));
    }

    /**
     * Calculates the distance to another vector.
     * @param other The other vector.
     * @returns The distance.
     */
    public distanceTo(other: Vector): number {
        return mod.DistanceBetween(this.handle, other.getHandle());
    }

    /**
     * Calculates the direction vector toward another vector.
     * @param other The target vector.
     * @returns A new Vector representing the direction.
     */
    public directionTo(other: Vector): Vector {
        return new Vector(mod.DirectionTowards(this.handle, other.getHandle()));
    }

    /**
     * Calculates the angle between this vector and another in degrees.
     * @param other The other vector.
     * @returns The angle in degrees.
     */
    public angleTo(other: Vector): number {
        return mod.AngleBetweenVectors(this.handle, other.getHandle());
    }

    /**
     * Creates a clone of this vector.
     * @returns A new Vector with the same components.
     */
    public clone(): Vector {
        return new Vector(this.x, this.y, this.z);
    }

    /**
     * Checks if this vector equals another vector.
     * @param other The other vector.
     * @returns True if vectors are equal, false otherwise.
     */
    public equals(other: Vector): boolean {
        return mod.Equals(this.handle, other.getHandle());
    }

    /**
     * Converts this vector to a string representation.
     * @returns A string representation of the vector.
     */
    public toString(): string {
        return `Vector(${this.x}, ${this.y}, ${this.z})`;
    }

    /**
     * Gets the vector components as a tuple.
     * @returns A tuple [x, y, z] of the vector components.
     */
    public toTuple(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    /**
     * Creates a Vector with all components set to zero.
     * @returns A new zero Vector.
     */
    public static zero(): Vector {
        return new Vector(0, 0, 0);
    }

    /**
     * Creates a Vector with all components set to one.
     * @returns A new one Vector.
     */
    public static one(): Vector {
        return new Vector(1, 1, 1);
    }

    /**
     * Creates a forward direction Vector (0, 0, -1).
     * @returns A new forward Vector.
     */
    public static forward(): Vector {
        return new Vector(mod.ForwardVector());
    }

    /**
     * Creates a backward direction Vector (0, 0, 1).
     * @returns A new backward Vector.
     */
    public static backward(): Vector {
        return new Vector(mod.BackwardVector());
    }

    /**
     * Creates a right direction Vector (1, 0, 0).
     * @returns A new right Vector.
     */
    public static right(): Vector {
        return new Vector(mod.RightVector());
    }

    /**
     * Creates a left direction Vector (-1, 0, 0).
     * @returns A new left Vector.
     */
    public static left(): Vector {
        return new Vector(mod.LeftVector());
    }

    /**
     * Creates an up direction Vector (0, 1, 0).
     * @returns A new up Vector.
     */
    public static up(): Vector {
        return new Vector(mod.UpVector());
    }

    /**
     * Creates a down direction Vector (0, -1, 0).
     * @returns A new down Vector.
     */
    public static down(): Vector {
        return new Vector(mod.DownVector());
    }

    /**
     * Lerps between two vectors.
     * @param a The start vector.
     * @param b The end vector.
     * @param t The interpolation factor (0 to 1).
     * @returns A new interpolated Vector.
     */
    public static lerp(a: Vector, b: Vector, t: number): Vector {
        return new Vector(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t,
            a.z + (b.z - a.z) * t
        );
    }

    /**
     * Creates a direction vector from yaw and pitch angles in degrees.
     * @param yaw The horizontal angle in degrees.
     * @param pitch The vertical angle in degrees.
     * @returns A new direction Vector.
     */
    public static fromAngles(yaw: number, pitch: number): Vector {
        return new Vector(mod.DirectionFromAngles(yaw, pitch));
    }
}
