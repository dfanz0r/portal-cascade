// src/cascade/static/Cameras.ts
// Static utility namespace for camera control

/**
 * Static utility namespace for controlling camera types for players.
 *
 * For per-player camera control, use the instance method on the Player class:
 * - player.setCamera(cameraType, cameraIndex?)
 */
export namespace Cameras {
    /**
     * Sets the camera type for all players (global operation).
     * @param type The camera type.
     */
    export function setTypeForAll(type: mod.Cameras): void {
        mod.SetCameraTypeForAll(type);
    }

    /**
     * Sets the camera type for all players with an index (global operation).
     * @param type The camera type.
     * @param cameraIndex The camera index.
     */
    export function setTypeForAllWithIndex(
        type: mod.Cameras,
        cameraIndex: number
    ): void {
        mod.SetCameraTypeForAll(type, cameraIndex);
    }
}
