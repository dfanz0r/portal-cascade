// src/cascade/structures/Vehicle.ts
// Vehicle wrapper class that extends ModObject and implements relevant capabilities.

import { GameArray } from "../core/GameArray";
import { ModObject } from "../core/ModObject";
import type { Vector } from "../core/Vector";
import type { IDamageable } from "../interfaces/Capabilities";
import { Player } from "./Player";
import { Preserve } from "../decorators";

/**
 * Wrapper class for Vehicle objects, providing ergonomic access to vehicle-related operations.
 * Implements capabilities for damage.
 */
@Preserve()
export class Vehicle extends ModObject<mod.Vehicle> implements IDamageable {
    // IDamageable implementation
    /**
     * Kills this vehicle (destroys it).
     */
    kill(): void {
        mod.Kill(this.handle);
    }

    /**
     * Deals damage to this vehicle.
     * @param amount The amount of damage to deal.
     * @param dealer Optional player who dealt the damage (not supported for vehicles).
     */
    dealDamage(amount: number, dealer?: mod.Player): void {
        // Vehicles don't support dealer parameter in DealDamage
        mod.DealDamage(this.handle, amount);
    }

    /**
     * Heals this vehicle.
     * @param amount The amount of healing to apply.
     * @param healer Optional player who performed the healing (not supported for vehicles).
     */
    heal(amount: number, healer?: mod.Player): void {
        // Vehicles don't support healer parameter in Heal
        mod.Heal(this.handle, amount);
    }

    /**
     * Sets the maximum health multiplier for this vehicle.
     * @param multiplier The health multiplier (e.g., 1.0 = normal health).
     */
    setMaxHealthMultiplier(multiplier: number): void {
        mod.SetVehicleMaxHealthMultiplier(this.handle, multiplier);
    }

    /**
     * Forces a player into a specific seat of this vehicle.
     * @param player The player to seat.
     * @param seatNumber The seat number (0-based index).
     */
    forcePlayerToSeat(player: mod.Player, seatNumber: number): void {
        mod.ForcePlayerToSeat(player, this.handle, seatNumber);
    }

    /**
     * Forces all players to exit this vehicle.
     */
    ejectAll(): void {
        mod.ForcePlayerExitVehicle(this.handle);
    }

    /**
     * Gets the team of this vehicle.
     * @returns The vehicle's team.
     */
    getTeam(): mod.Team {
        return mod.GetVehicleTeam(this.handle);
    }

    /**
     * Checks if this vehicle is occupied.
     * @returns True if the vehicle has a player in it.
     */
    isOccupied(): boolean {
        return mod.IsVehicleOccupied(this.handle);
    }

    /**
     * Checks if a specific seat is occupied.
     * @param seatIndex The seat index.
     * @returns True if the seat is occupied.
     */
    isSeatOccupied(seatIndex: number): boolean {
        return mod.IsVehicleSeatOccupied(this.handle, seatIndex);
    }

    /**
     * Gets the number of seats in this vehicle.
     * @returns The seat count.
     */
    getSeatCount(): number {
        return mod.GetVehicleSeatCount(this.handle);
    }

    /**
     * Gets all players in this vehicle.
     * @returns Array of players in the vehicle.
     */
    getPlayersInVehicle(): GameArray<Player> {
        return new GameArray(
            mod.GetAllPlayersInVehicle(this.handle),
            (raw) => new Player(raw as mod.Player)
        );
    }

    /**
     * Gets the player in a specific seat.
     * @param seatIndex The seat index.
     * @returns The player handle in the seat, or invalid if no one is there.
     */
    getPlayerInSeat(seatIndex: number): mod.Player {
        return mod.GetPlayerFromVehicleSeat(this.handle, seatIndex);
    }

    /**
     * Teleports a vehicle to a destination.
     * @param vehicle The vehicle to teleport.
     * @param destination The destination position.
     * @param orientation The orientation angle in radians.
     */
    teleport(destination: Vector, orientation: number): void {
        mod.Teleport(this.handle, destination.getHandle(), orientation);
    }
}
