// src/cascade/structures/Sector.ts
// Sector wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { IEnableable } from "../interfaces/Capabilities";

/**
 * Wrapper class for Sector objects, providing ergonomic access to sector operations.
 * Implements capabilities for enablement.
 */
export class Sector extends ModObject<mod.Sector> implements IEnableable {
    // IEnableable implementation
    /**
     * Enables this sector.
     */
    enable(): void {
        mod.EnableGameModeObjective(this.handle, true);
    }

    /**
     * Disables this sector.
     */
    disable(): void {
        mod.EnableGameModeObjective(this.handle, false);
    }
}
