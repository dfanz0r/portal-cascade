// src/cascade/structures/Player.ts
// Player wrapper class that extends ModObject and implements relevant capabilities.

import { ModObject } from "../core/ModObject";
import type { Vector } from "../core/Vector";
import type { IDamageable } from "../interfaces/Capabilities";
import { Preserve } from "../decorators";

/**
 * Wrapper class for Player objects, providing ergonomic access to player-related operations.
 * Implements capabilities for damage.
 */
@Preserve()
export class Player extends ModObject<mod.Player> implements IDamageable {
    // IDamageable implementation
    /**
     * Kills this player.
     */
    kill(): void {
        mod.Kill(this.handle);
    }

    /**
     * Deals damage to this player.
     * @param amount The amount of damage to deal.
     * @param dealer Optional player who dealt the damage.
     */
    dealDamage(amount: number, dealer?: mod.Player): void {
        if (dealer !== undefined) {
            mod.DealDamage(this.handle, amount, dealer);
        } else {
            mod.DealDamage(this.handle, amount);
        }
    }

    /**
     * Heals this player.
     * @param amount The amount of healing to apply.
     * @param healer Optional player who performed the healing.
     */
    heal(amount: number, healer?: mod.Player): void {
        if (healer !== undefined) {
            mod.Heal(this.handle, amount, healer);
        } else {
            mod.Heal(this.handle, amount);
        }
    }

    // Player-specific methods
    /**
     * Gets the team this player belongs to.
     * @returns The player's team.
     */
    getTeam(): mod.Team {
        return mod.GetTeam(this.handle);
    }

    /**
     * Gets the number of kills this player has.
     * @returns The kill count.
     */
    getKills(): number {
        return mod.GetPlayerKills(this.handle);
    }

    /**
     * Gets the number of deaths this player has.
     * @returns The death count.
     */
    getDeaths(): number {
        return mod.GetPlayerDeaths(this.handle);
    }

    /**
     * Checks if this player is valid (alive and in the game).
     * @returns True if the player is valid, false otherwise.
     */
    isValid(): boolean {
        return mod.IsPlayerValid(this.handle);
    }

    /**
     * Forces this player to revive.
     */
    revive(): void {
        mod.ForceRevive(this.handle);
    }

    /**
     * Deploys this player into the game.
     */
    deploy(): void {
        mod.DeployPlayer(this.handle);
    }

    /**
     * Undeploys this player from the game.
     */
    undeploy(): void {
        mod.UndeployPlayer(this.handle);
    }

    /**
     * Gets the vehicle this player is currently in.
     * @returns The vehicle, or undefined if not in a vehicle.
     */
    getVehicle(): mod.Vehicle | undefined {
        const vehicle = mod.GetVehicleFromPlayer(this.handle);
        // Note: Need to check if vehicle is valid, but API might not have a direct way
        return vehicle;
    }

    /**
     * Gets the seat number this player is in within their vehicle.
     * @returns The seat number, or -1 if not in a vehicle.
     */
    getVehicleSeat(): number {
        return mod.GetPlayerVehicleSeat(this.handle);
    }

    /**
     * Forces this player to exit their vehicle.
     */
    exitVehicle(): void {
        mod.ForcePlayerExitVehicle(this.handle);
    }

    /**
     * Forces this player into a specific seat in a vehicle.
     * @param vehicle The vehicle to enter.
     * @param seatNumber The seat number (use -1 for first available).
     */
    enterVehicle(vehicle: mod.Vehicle, seatNumber: number): void {
        mod.ForcePlayerToSeat(this.handle, vehicle, seatNumber);
    }

    /**
     * Spots a target player for this player's team.
     * @param target The player to spot.
     * @param duration How long to spot (in seconds).
     */
    spot(target: mod.Player, duration: number): void {
        mod.SpotTarget(target, duration);
    }

    // AI-related methods (if this is an AI player)
    /**
     * Sets this AI player to battlefield behavior.
     */
    setAIBattlefieldBehavior(): void {
        mod.AIBattlefieldBehavior(this.handle);
    }

    /**
     * Sets this AI player to idle behavior.
     */
    setAIIdleBehavior(): void {
        mod.AIIdleBehavior(this.handle);
    }

    /**
     * Sets this AI player to parachute behavior.
     */
    setAIParachuteBehavior(): void {
        mod.AIParachuteBehavior(this.handle);
    }

    /**
     * Enables shooting for this AI player.
     */
    enableAIShooting(): void {
        mod.AIEnableShooting(this.handle);
    }

    /**
     * Enables targeting for this AI player.
     */
    enableAITargeting(): void {
        mod.AIEnableTargeting(this.handle);
    }

    /**
     * Sets a target for this AI player.
     * @param target The target player.
     */
    setAITarget(target: mod.Player): void {
        mod.AISetTarget(this.handle, target);
    }

    /**
     * Sets the maximum health for this player.
     * @param maxHealth The maximum health value.
     */
    setMaxHealth(maxHealth: number): void {
        mod.SetPlayerMaxHealth(this.handle, maxHealth);
    }

    /**
     * Sets the movement speed multiplier for this player.
     * @param multiplier The speed multiplier (1.0 = normal speed).
     */
    setMovementSpeedMultiplier(multiplier: number): void {
        mod.SetPlayerMovementSpeedMultiplier(this.handle, multiplier);
    }

    /**
     * Sets the team for this player.
     * @param team The team to assign.
     */
    setTeam(team: mod.Team): void {
        mod.SetTeam(this.handle, team);
    }

    /**
     * Sets the redeploy time for this player.
     * @param seconds Time in seconds before redeployment is allowed.
     */
    setRedeployTime(seconds: number): void {
        mod.SetRedeployTime(this.handle, seconds);
    }

    /**
     * Enables or disables deployment for this player.
     * @param allowed Whether deployment is allowed.
     */
    enableDeploy(allowed: boolean): void {
        mod.EnablePlayerDeploy(this.handle, allowed);
    }

    /**
     * Sets the camera type for this player.
     * @param cameraType The camera type.
     * @param cameraIndex Optional camera index.
     */
    setCamera(cameraType: mod.Cameras, cameraIndex?: number): void {
        if (cameraIndex !== undefined) {
            mod.SetCameraTypeForPlayer(this.handle, cameraType, cameraIndex);
        } else {
            mod.SetCameraTypeForPlayer(this.handle, cameraType);
        }
    }

    /**
     * Enables or disables all input restrictions for this player.
     * @param restrict Whether to restrict all inputs.
     */
    enableAllInputRestrictions(restrict: boolean): void {
        mod.EnableAllInputRestrictions(this.handle, restrict);
    }

    /**
     * Enables or disables a specific input restriction for this player.
     * @param inputRestriction The input to restrict.
     * @param restrict Whether to restrict this input.
     */
    enableInputRestriction(
        inputRestriction: mod.RestrictedInputs,
        restrict: boolean
    ): void {
        mod.EnableInputRestriction(this.handle, inputRestriction, restrict);
    }

    /**
     * Sets whether this player should skip the man down state.
     * @param skip Whether to skip man down.
     */
    skipManDown(skip: boolean): void {
        mod.SkipManDown(this.handle, skip);
    }

    /**
     * Forces this player into the man down state.
     */
    forceManDown(): void {
        mod.ForceManDown(this.handle);
    }

    /**
     * Teleports player to a destination.
     * @param destination The destination position.
     * @param orientation The orientation angle in radians.
     */
    teleport(destination: Vector, orientation: number): void {
        mod.Teleport(this.handle, destination.getHandle(), orientation);
    }
}
