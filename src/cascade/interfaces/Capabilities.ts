// src/cascade/interfaces/Capabilities.ts
// Capability interfaces define cohesive, minimal behaviors that classes compose.
// These are pure type contracts with no side effects.

/**
 * Represents an entity that can be damaged, killed, or healed.
 */
export interface IDamageable {
    /**
     * Kills the entity.
     */
    kill(): void;

    /**
     * Deals damage to the entity.
     * @param amount The amount of damage to deal.
     * @param dealer Optional player who dealt the damage.
     */
    dealDamage(amount: number, dealer?: mod.Player): void;

    /**
     * Heals the entity.
     * @param amount The amount of healing to apply.
     * @param healer Optional player who performed the healing.
     */
    heal(amount: number, healer?: mod.Player): void;
}

/**
 * Represents an entity that can be enabled or disabled.
 */
export interface IEnableable {
    /**
     * Enables the entity.
     */
    enable(): void;

    /**
     * Disables the entity.
     */
    disable(): void;
}

/**
 * Represents an entity that can be owned by a team.
 */
export interface IOwnable {
    /**
     * Gets the current owner team.
     * @returns The owning team.
     */
    getOwner(): mod.Team;

    /**
     * Sets the owner team.
     * @param team The new owning team.
     */
    setOwner(team: mod.Team): void;
}

/**
 * Represents a spawner that can create entities.
 */
export interface ISpawner<T> {
    /**
     * Spawns a new entity.
     * @param args Additional arguments for spawning.
     * @returns The spawned entity, or undefined if spawning failed.
     */
    spawn(...args: unknown[]): T | undefined;

    /**
     * Enables or disables automatic spawning.
     * @param enabled Whether auto-spawning should be enabled.
     */
    setAutoSpawn(enabled: boolean): void;

    /**
     * Sets the respawn time after destruction.
     * @param seconds Time in seconds before respawn.
     */
    setRespawnTime(seconds: number): void;
}

/**
 * Represents an entity that can be scaled.
 */
export interface IScalable {
    /**
     * Gets the current scale.
     * @returns The scale vector.
     */
    getScale(): mod.Vector;

    /**
     * Sets the scale.
     * @param scale The new scale vector.
     */
    setScale(scale: mod.Vector): void;
}

/**
 * Represents an entity that can be made visible or invisible.
 */
export interface IVisible {
    /**
     * Shows the entity.
     */
    show(): void;

    /**
     * Hides the entity.
     */
    hide(): void;

    /**
     * Checks if the entity is visible.
     * @returns True if visible, false otherwise.
     */
    isVisible(): boolean;
}

/**
 * Represents an entity that can have UI widgets attached.
 */
export interface IUIAttachable {
    /**
     * Adds a UI widget to this entity.
     * @param widget The UI widget to attach.
     */
    attachUI(widget: mod.UIWidget): void;

    /**
     * Removes a UI widget from this entity.
     * @param widget The UI widget to detach.
     */
    detachUI(widget: mod.UIWidget): void;
}
