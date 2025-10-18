// src/cascade/core/ModObject.ts
// A thin base wrapper that stores the engine handle and provides universal operations
// available to mod.Object values. Methods map directly to engine calls.

/**
 * Base class for all framework wrappers that hold a raw handle from the engine.
 * Provides universal operations available to mod.Object values.
 */
export abstract class ModObject<T extends mod.Object> {
    /**
     * The raw engine handle for this object.
     */
    public readonly handle: T;

    /**
     * Creates a new ModObject wrapper.
     * @param handle The raw engine object handle.
     */
    public constructor(handle: T) {
        this.handle = handle;
    }

    /**
     * Gets the engine ID of this object.
     * @returns The object's ID, or -1 if the object is invalid.
     */
    getId(): number {
        try {
            return mod.GetObjId(this.handle);
        } catch (e) {
            // Player/object no longer valid - likely called during leave/cleanup events
            return -1;
        }
    }

    /**
     * Moves the object by the specified position delta.
     * @param positionDelta The position change vector.
     */
    move(positionDelta: mod.Vector): void;

    /**
     * Moves the object by the specified position and rotation deltas.
     * @param positionDelta The position change vector.
     * @param rotationDelta The rotation change vector.
     */
    move(positionDelta: mod.Vector, rotationDelta: mod.Vector): void;

    move(positionDelta: mod.Vector, rotationDelta?: mod.Vector): void {
        if (rotationDelta !== undefined) {
            mod.MoveObject(this.handle, positionDelta, rotationDelta);
        } else {
            mod.MoveObject(this.handle, positionDelta);
        }
    }

    /**
     * Rotates the object by the specified rotation delta.
     * @param rotationDelta The rotation change vector.
     */
    rotate(rotationDelta: mod.Vector): void {
        mod.RotateObject(this.handle, rotationDelta);
    }

    /**
     * Sets the object's transform.
     * @param transform The new transform.
     */
    setTransform(transform: mod.Transform): void {
        mod.SetObjectTransform(this.handle, transform);
    }

    /**
     * Sets the object's transform over time.
     * @param transform The target transform.
     * @param timeInSeconds Duration of the transition.
     * @param shouldLoop Whether to loop indefinitely.
     * @param shouldReverse Whether to reverse the animation.
     */
    setTransformOverTime(
        transform: mod.Transform,
        timeInSeconds: number,
        shouldLoop: boolean,
        shouldReverse: boolean
    ): void {
        mod.SetObjectTransformOverTime(
            this.handle,
            transform,
            timeInSeconds,
            shouldLoop,
            shouldReverse
        );
    }

    /**
     * Moves the object over time.
     * @param positionDelta The position change vector.
     * @param rotationDelta The rotation change vector.
     * @param timeInSeconds Duration of the movement.
     * @param shouldLoop Whether to loop indefinitely.
     * @param shouldReverse Whether to reverse the animation.
     */
    moveOverTime(
        positionDelta: mod.Vector,
        rotationDelta: mod.Vector,
        timeInSeconds: number,
        shouldLoop: boolean,
        shouldReverse: boolean
    ): void {
        mod.MoveObjectOverTime(
            this.handle,
            positionDelta,
            rotationDelta,
            timeInSeconds,
            shouldLoop,
            shouldReverse
        );
    }

    /**
     * Orbits the object around a transform over time.
     * @param orbitTransform The center transform to orbit around.
     * @param timeInSeconds Duration of one orbit.
     * @param radius Distance from the center.
     * @param shouldLoop Whether to loop indefinitely.
     * @param shouldReverse Whether to reverse direction.
     * @param clockwise Whether to orbit clockwise.
     */
    orbitOverTime(
        orbitTransform: mod.Transform,
        timeInSeconds: number,
        radius: number,
        shouldLoop: boolean,
        shouldReverse: boolean,
        clockwise: boolean
    ): void;

    /**
     * Orbits the object around a transform over time with custom axis.
     * @param orbitTransform The center transform to orbit around.
     * @param timeInSeconds Duration of one orbit.
     * @param radius Distance from the center.
     * @param shouldLoop Whether to loop indefinitely.
     * @param shouldReverse Whether to reverse direction.
     * @param clockwise Whether to orbit clockwise.
     * @param orbitAxis The axis to orbit around.
     */
    orbitOverTime(
        orbitTransform: mod.Transform,
        timeInSeconds: number,
        radius: number,
        shouldLoop: boolean,
        shouldReverse: boolean,
        clockwise: boolean,
        orbitAxis: mod.Vector
    ): void;

    orbitOverTime(
        orbitTransform: mod.Transform,
        timeInSeconds: number,
        radius: number,
        shouldLoop: boolean,
        shouldReverse: boolean,
        clockwise: boolean,
        orbitAxis?: mod.Vector
    ): void {
        if (orbitAxis !== undefined) {
            mod.OrbitObjectOverTime(
                this.handle,
                orbitTransform,
                timeInSeconds,
                radius,
                shouldLoop,
                shouldReverse,
                clockwise,
                orbitAxis
            );
        } else {
            mod.OrbitObjectOverTime(
                this.handle,
                orbitTransform,
                timeInSeconds,
                radius,
                shouldLoop,
                shouldReverse,
                clockwise
            );
        }
    }

    /**
     * Stops any active movement for this object.
     */
    stopMovement(): void {
        mod.StopActiveMovementForObject(this.handle);
    }

    /**
     * Adds a UI icon to this object.
     * @param image The icon image.
     * @param verticalOffset Vertical offset from the object.
     * @param iconColour Color of the icon.
     * @param iconText Text to display with the icon.
     * @param visibility Who can see the icon.
     */
    addIcon(
        image: mod.WorldIconImages,
        verticalOffset: number,
        iconColour: mod.Vector,
        iconText: mod.Message,
        visibility: mod.Player | mod.Team
    ): void;

    /**
     * Adds a UI icon to this object (visible to all).
     * @param image The icon image.
     * @param verticalOffset Vertical offset from the object.
     * @param iconColour Color of the icon.
     * @param iconText Text to display with the icon.
     */
    addIcon(
        image: mod.WorldIconImages,
        verticalOffset: number,
        iconColour: mod.Vector,
        iconText: mod.Message
    ): void;

    addIcon(
        image: mod.WorldIconImages,
        verticalOffset: number,
        iconColour: mod.Vector,
        iconText: mod.Message,
        visibility?: mod.Player | mod.Team
    ): void {
        if (visibility !== undefined) {
            mod.AddUIIcon(
                this.handle,
                image,
                verticalOffset,
                iconColour,
                iconText,
                visibility
            );
        } else {
            mod.AddUIIcon(
                this.handle,
                image,
                verticalOffset,
                iconColour,
                iconText
            );
        }
    }

    /**
     * Removes the UI icon from this object.
     * @param visibility Optional visibility filter for removal.
     */
    removeIcon(): void;
    removeIcon(visibility: mod.Player | mod.Team): void;
    removeIcon(visibility?: mod.Player | mod.Team): void {
        if (visibility !== undefined) {
            mod.RemoveUIIcon(this.handle, visibility);
        } else {
            mod.RemoveUIIcon(this.handle);
        }
    }

    /**
     * Unspawns this object from the game world.
     */
    unspawn(): void {
        mod.UnspawnObject(this.handle);
    }

    /**
     * Gets the current position of this object.
     * @returns The position vector.
     */
    getPosition(): mod.Vector {
        return mod.GetObjectPosition(this.handle);
    }

    /**
     * Sets the position of this object.
     * @param position The new position vector.
     */
    setPosition(position: mod.Vector): void {
        const currentRotation = this.getRotation();
        const newTransform = mod.CreateTransform(position, currentRotation);
        mod.SetObjectTransform(this.handle, newTransform);
    }

    /**
     * Gets the current rotation of this object.
     * @returns The rotation vector.
     */
    getRotation(): mod.Vector {
        return mod.GetObjectRotation(this.handle);
    }

    /**
     * Sets the rotation of this object.
     * @param rotation The new rotation vector.
     */
    setRotation(rotation: mod.Vector): void {
        const currentPosition = this.getPosition();
        const newTransform = mod.CreateTransform(currentPosition, rotation);
        mod.SetObjectTransform(this.handle, newTransform);
    }

    /**
     * Gets the current transform of this object.
     * @returns The transform object.
     */
    getTransform(): mod.Transform {
        return mod.GetObjectTransform(this.handle);
    }
}
