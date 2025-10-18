// src/cascade/static/Equipment.ts
// Static utility namespace for weapon and gadget management

/**
 * Static utility namespace for equipment operations.
 * Provides methods for managing player weapons and gadgets.
 */
export namespace Equipment {
    /**
     * Adds a weapon to a player's inventory.
     * @param player The player.
     * @param weapon The weapon to add.
     */
    export function addWeapon(player: mod.Player, weapon: mod.Weapons): void {
        mod.AddEquipment(player, weapon);
    }

    /**
     * Adds a weapon to a player with a weapon package.
     * @param player The player.
     * @param weapon The weapon to add.
     * @param weaponPackage The weapon package (loadout).
     */
    export function addWeaponWithPackage(
        player: mod.Player,
        weapon: mod.Weapons,
        weaponPackage: mod.WeaponPackage
    ): void {
        mod.AddEquipment(player, weapon, weaponPackage);
    }

    /**
     * Adds a weapon to a player in a specific inventory slot.
     * @param player The player.
     * @param weapon The weapon to add.
     * @param slot The inventory slot.
     */
    export function addWeaponToSlot(
        player: mod.Player,
        weapon: mod.Weapons,
        slot: mod.InventorySlots
    ): void {
        mod.AddEquipment(player, weapon, slot);
    }

    /**
     * Adds a gadget to a player's inventory.
     * @param player The player.
     * @param gadget The gadget to add.
     */
    export function addGadget(player: mod.Player, gadget: mod.Gadgets): void {
        mod.AddEquipment(player, gadget);
    }

    /**
     * Adds a gadget to a player in a specific inventory slot.
     * @param player The player.
     * @param gadget The gadget to add.
     * @param slot The inventory slot.
     */
    export function addGadgetToSlot(
        player: mod.Player,
        gadget: mod.Gadgets,
        slot: mod.InventorySlots
    ): void {
        mod.AddEquipment(player, gadget, slot);
    }

    /**
     * Removes a weapon from a player's inventory.
     * @param player The player.
     * @param weapon The weapon to remove.
     */
    export function removeWeapon(
        player: mod.Player,
        weapon: mod.Weapons
    ): void {
        mod.RemoveEquipment(player, weapon);
    }

    /**
     * Removes a gadget from a player's inventory.
     * @param player The player.
     * @param gadget The gadget to remove.
     */
    export function removeGadget(
        player: mod.Player,
        gadget: mod.Gadgets
    ): void {
        mod.RemoveEquipment(player, gadget);
    }

    /**
     * Forces a player to switch to a specific inventory slot.
     * @param player The player.
     * @param slot The inventory slot to switch to.
     */
    export function switchInventory(
        player: mod.Player,
        slot: mod.InventorySlots
    ): void {
        mod.ForceSwitchInventory(player, slot);
    }

    /**
     * Checks if a player has a specific weapon.
     * @param player The player.
     * @param weapon The weapon to check for.
     * @returns Whether the player has the weapon.
     */
    export function hasWeapon(
        player: mod.Player,
        weapon: mod.Weapons
    ): boolean {
        return mod.HasEquipment(player, weapon);
    }

    /**
     * Checks if a player has a specific gadget.
     * @param player The player.
     * @param gadget The gadget to check for.
     * @returns Whether the player has the gadget.
     */
    export function hasGadget(
        player: mod.Player,
        gadget: mod.Gadgets
    ): boolean {
        return mod.HasEquipment(player, gadget);
    }

    /**
     * Adds an attachment to a weapon package.
     * @param attachment The attachment to add.
     * @param weaponPackage The weapon package.
     */
    export function addAttachmentToWeaponPackage(
        attachment: mod.WeaponAttachments,
        weaponPackage: mod.WeaponPackage
    ): void {
        mod.AddAttachmentToWeaponPackage(attachment, weaponPackage);
    }

    /**
     * Creates a new weapon package.
     * @returns The new weapon package.
     */
    export function createWeaponPackage(): mod.WeaponPackage {
        return mod.CreateNewWeaponPackage();
    }
}
