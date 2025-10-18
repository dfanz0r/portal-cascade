// src/cascade/structures/Team.ts
// Team wrapper class.

/**
 * Wrapper class for Team objects, providing ergonomic access to team operations.
 */
export class Team {
    public readonly handle: mod.Team;

    public constructor(handle: mod.Team) {
        this.handle = handle;
    }

    /**
     * Gets the score for this team.
     * @returns The team's current score.
     */
    getScore(): number {
        return mod.GetGameModeScore(this.handle);
    }

    /**
     * Sets the score for this team.
     * @param score The new score.
     */
    setScore(score: number): void {
        mod.SetGameModeScore(this.handle, score);
    }

    /**
     * Checks if this team belongs to the specified faction.
     * @param faction The faction to check.
     * @returns True if the team belongs to the faction.
     */
    isFaction(faction: mod.Factions): boolean {
        return mod.IsFaction(this.handle, faction);
    }
}
