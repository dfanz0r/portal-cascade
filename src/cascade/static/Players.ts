// src/cascade/static/Players.ts
// Static utility namespace for player-related operations

import { GameArray } from '../core/GameArray';
import { Player } from '../structures/Player';

/**
 * Static utility namespace for player-related operations and queries.
 */
export namespace Players {
    /**
     * Gets all players in the game.
     * @returns Array of all players.
     */
    export function getAll(): GameArray<Player> {
        return new GameArray(
            mod.AllPlayers(),
            raw => new Player(raw as mod.Player)
        );
    }

    /**
     * Gets the player closest to a position.
     * @param position The position to check from.
     * @param team Optional team filter.
     * @returns The closest player.
     */
    export function getClosestTo(
        position: mod.Vector,
        team?: mod.Team
    ): mod.Player {
        if (team !== undefined) {
            return mod.ClosestPlayerTo(position, team);
        }
        return mod.ClosestPlayerTo(position);
    }

    /**
     * Gets the player farthest from a position.
     * @param position The position to check from.
     * @param team Optional team filter.
     * @returns The farthest player.
     */
    export function getFarthestFrom(
        position: mod.Vector,
        team?: mod.Team
    ): mod.Player {
        if (team !== undefined) {
            return mod.FarthestPlayerFrom(position, team);
        }
        return mod.FarthestPlayerFrom(position);
    }

    /**
     * Deploys all players.
     */
    export function deployAll(): void {
        mod.DeployAllPlayers();
    }

    /**
     * Undeploys all players.
     */
    export function undeployAll(): void {
        mod.UndeployAllPlayers();
    }

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

    /**
     * Sets the damage multiplier from AI to human players (global setting).
     * @param multiplier The damage multiplier.
     */
    export function setAIToHumanDamageModifier(multiplier: number): void {
        mod.SetAIToHumanDamageModifier(multiplier);
    }

    /**
     * Disables player joining.
     */
    export function disableJoining(): void {
        mod.DisablePlayerJoin();
    }
}
