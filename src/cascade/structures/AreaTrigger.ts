// src/cascade/structures/AreaTrigger.ts
// AreaTrigger wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { IEnableable } from "../interfaces/Capabilities";
import { Preserve } from "../decorators";

/**
 * Wrapper class for AreaTrigger objects, providing ergonomic access to area trigger operations.
 * Implements capabilities for enablement.
 */
@Preserve()
export class AreaTrigger
    extends ModObject<mod.AreaTrigger>
    implements IEnableable
{
    // IEnableable implementation
    /**
     * Enables this area trigger.
     */
    enable(): void {
        mod.EnableAreaTrigger(this.handle, true);
    }

    /**
     * Disables this area trigger.
     */
    disable(): void {
        mod.EnableAreaTrigger(this.handle, false);
    }
}
