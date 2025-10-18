// src/cascade/structures/InteractPoint.ts
// InteractPoint wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { IEnableable } from "../interfaces/Capabilities";

/**
 * Wrapper class for InteractPoint objects, providing ergonomic access to interact point operations.
 * Implements capabilities for enablement.
 */
export class InteractPoint
    extends ModObject<mod.InteractPoint>
    implements IEnableable
{
    // IEnableable implementation
    /**
     * Enables this interact point.
     */
    enable(): void {
        mod.EnableInteractPoint(this.handle, true);
    }

    /**
     * Disables this interact point.
     */
    disable(): void {
        mod.EnableInteractPoint(this.handle, false);
    }
}
