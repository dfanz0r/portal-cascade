// src/cascade/static/Game.ts
// Static utility namespace for game-wide operations

import RaycastManager from '../core/RaycastManager';

/**
 * Static utility namespace for game-wide operations and settings.
 */
export namespace Game {
    /**
     * Gets the singleton RaycastManager instance for performing raycasts.
     * The engine only supports one active raycast at a time, so this manager
     * queues requests and processes them sequentially.
     * @returns The RaycastManager instance.
     */
    export function getRaycastManager(): RaycastManager {
        return RaycastManager.getInstance();
    }
    /**
     * Sets friendly fire on or off.
     * @param enabled Whether friendly fire should be enabled.
     */
    export function setFriendlyFire(enabled: boolean): void {
        mod.SetFriendlyFire(enabled);
    }

    /**
     * Sets the target score for the game mode.
     * @param score The target score.
     */
    export function setTargetScore(score: number): void {
        mod.SetGameModeTargetScore(score);
    }

    /**
     * Sets the time limit for the game mode.
     * @param seconds Time limit in seconds.
     */
    export function setTimeLimit(seconds: number): void {
        mod.SetGameModeTimeLimit(seconds);
    }

    /**
     * Gets the remaining match time.
     * @returns Remaining time in seconds.
     */
    export function getRemaining(): number {
        return mod.GetMatchTimeRemaining();
    }

    /**
     * Gets the round time.
     * @returns Round time in seconds.
     */
    export function getRoundTime(): number {
        return mod.GetRoundTime();
    }

    /**
     * Gets the target score.
     * @returns The target score.
     */
    export function getTargetScore(): number {
        return mod.GetTargetScore();
    }
    /**
     * Gets the elapsed match time.
     * @returns Elapsed time in seconds.
     */
    export function getElapsed(): number {
        return mod.GetMatchTimeElapsed();
    }

    /**
     * Ends the game mode for a team.
     * Use this when the winner is a team.
     */
    export function endGame(player: mod.Player): void;
    export function endGame(team: mod.Team): void;
    export function endGame(obj: mod.Team | mod.Player): void {
        // biome-ignore lint/suspicious/noExplicitAny: <this is the only sane way to do this imo>
        mod.EndGameMode(obj as any);
    }

    /**
     * Pauses or unpauses the game mode time.
     * @param paused Whether time should be paused.
     */
    export function pauseTime(paused: boolean): void {
        mod.PauseGameModeTime(paused);
    }

    /**
     * Resets the game mode timer.
     */
    export function resetTimer(): void {
        mod.ResetGameModeTime();
    }
}
