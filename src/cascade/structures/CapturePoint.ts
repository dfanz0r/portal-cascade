// src/cascade/structures/CapturePoint.ts
// CapturePoint wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { IEnableable, IOwnable } from "../interfaces/Capabilities";
import { GameArray } from "./GameArray";
import type { Player } from "./Player";

/**
 * Wrapper class for CapturePoint objects, providing ergonomic access to capture point operations.
 * Implements capabilities for ownership and enabling/disabling.
 */
export class CapturePoint
    extends ModObject<mod.CapturePoint>
    implements IOwnable, IEnableable
{
    // IOwnable implementation
    /**
     * Gets the current owner team of this capture point.
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
     * Sets the owner team of this capture point.
     * @param team The new owning team.
     */
    setOwner(team: mod.Team): void {
        mod.SetCapturePointOwner(this.handle, team);
    }

    // IEnableable implementation
    /**
     * Enables this capture point.
     */
    enable(): void {
        mod.EnableGameModeObjective(this.handle, true);
    }

    /**
     * Disables this capture point.
     */
    disable(): void {
        mod.EnableGameModeObjective(this.handle, false);
    }

    /**
     * Sets the capturing time for this capture point.
     * @param seconds Time in seconds to capture the point.
     */
    setCapturingTime(seconds: number): void {
        mod.SetCapturePointCapturingTime(this.handle, seconds);
    }

    /**
     * Sets the neutralization time for this capture point.
     * @param seconds Time in seconds to neutralize the point.
     */
    setNeutralizationTime(seconds: number): void {
        mod.SetCapturePointNeutralizationTime(this.handle, seconds);
    }

    /**
     * Sets the maximum capture multiplier for this capture point.
     * @param multiplier The multiplier value.
     */
    setMaxCaptureMultiplier(multiplier: number): void {
        mod.SetMaxCaptureMultiplier(this.handle, multiplier);
    }

    /**
     * Gets the current owner team of this capture point.
     * @returns The team that currently owns this capture point.
     */
    getCurrentOwnerTeam(): mod.Team {
        return mod.GetCurrentOwnerTeam(this.handle);
    }

    /**
     * Gets the team that is currently capturing this capture point.
     * @returns The team currently capturing the point.
     */
    getProgressTeam(): mod.Team {
        return mod.GetOwnerProgressTeam(this.handle);
    }

    /**
     * Gets the capture progress of this capture point.
     * @returns A number from 0 to 1 representing capture progress.
     */
    getProgress(): number {
        return mod.GetCaptureProgress(this.handle);
    }

    /**
     * Gets all players currently on this capture point.
     * @returns Array of players on the point.
     */
    getPlayersOnPoint(): GameArray<Player> {
        return new GameArray(mod.GetPlayersOnPoint(this.handle));
    }

    /**
     * Enables or disables deploying on this capture point for the owning team.
     * @param enabled Whether deploying should be allowed.
     */
    enableDeploying(enabled: boolean): void {
        mod.EnableCapturePointDeploying(this.handle, enabled);
    }
}
