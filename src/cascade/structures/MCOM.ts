// src/cascade/structures/MCOM.ts
// MCOM wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { IEnableable } from "../interfaces/Capabilities";
import { Preserve } from "../decorators";

/**
 * Wrapper class for MCOM (Mobile Construction Object) objects, providing ergonomic access to MCOM operations.
 * Implements capabilities for enabling/disabling.
 */
@Preserve()
export class MCOM extends ModObject<mod.MCOM> implements IEnableable {
    // IEnableable implementation
    /**
     * Enables this MCOM.
     */
    enable(): void {
        mod.EnableGameModeObjective(this.handle, true);
    }

    /**
     * Disables this MCOM.
     */
    disable(): void {
        mod.EnableGameModeObjective(this.handle, false);
    }

    /**
     * Sets the fuse time for this MCOM.
     * @param seconds Time in seconds for the fuse to burn.
     */
    setFuseTime(seconds: number): void {
        mod.SetMCOMFuseTime(this.handle, seconds);
    }
}
