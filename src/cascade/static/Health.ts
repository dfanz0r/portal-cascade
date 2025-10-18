// src/cascade/static/Health.ts
// Static utility namespace for global health-related operations

/**
 * Static utility namespace for global damage, healing, and health-related operations.
 *
 * For per-player/vehicle operations, use the instance methods on Player and Vehicle classes:
 * - player.kill(), player.dealDamage(), player.heal(), player.revive(), etc.
 * - vehicle.kill(), vehicle.dealDamage(), vehicle.heal(), etc.
 */
export namespace Health {
    /**
     * Sets the damage multiplier from AI to human players (global setting).
     * @param multiplier The damage multiplier.
     */
    export function setAIToHumanDamageModifier(multiplier: number): void {
        mod.SetAIToHumanDamageModifier(multiplier);
    }
}
