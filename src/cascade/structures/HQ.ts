// src/cascade/structures/HQ.ts
// HQ wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { IEnableable, IOwnable } from "../interfaces/Capabilities";

/**
 * Wrapper class for HQ (Headquarters) objects, providing ergonomic access to HQ operations.
 * Implements capabilities for ownership and enabling/disabling.
 */
export class HQ extends ModObject<mod.HQ> implements IOwnable, IEnableable {
    // IOwnable implementation
    /**
     * Gets the current owner team of this HQ.
     * @returns The owning team.
     */
    getOwner(): mod.Team {
        // Note: This might need to be implemented via events or state tracking
        // as the mod API may not provide direct getters for ownership
        throw new Error(
            "getOwner() not implemented - requires state tracking or event monitoring"
        );
    }

    /**
     * Sets the owner team of this HQ.
     * @param team The new owning team.
     */
    setOwner(team: mod.Team): void {
        mod.SetHQTeam(this.handle, team);
    }

    // IEnableable implementation
    /**
     * Enables this HQ.
     */
    enable(): void {
        mod.EnableGameModeObjective(this.handle, true);
    }

    /**
     * Disables this HQ.
     */
    disable(): void {
        mod.EnableGameModeObjective(this.handle, false);
    }
}
