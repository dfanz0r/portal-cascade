// src/cascade/static/UI.ts
// Static utility namespace for UI widget creation and manipulation

import { UIWidget } from '../structures';

/**
 * Static utility namespace for UI widget creation and manipulation.
 * Provides methods for adding, manipulating, and managing UI widgets.
 */
export namespace UI {
    /**
     * Gets the root UI widget.
     * @returns The root UI widget.
     */
    export function GetRoot(): UIWidget {
        const rootHandle = mod.GetUIRoot();
        const rootWidget = new UIWidget(rootHandle);
        return rootWidget;
    }

    /**
     * Adds a container widget to the UI.
     * @param name The widget name.
     * @param position The position vector.
     * @param size The size vector.
     * @param anchor The anchor point.
     */
    export function addContainer(
        name: string,
        position: mod.Vector,
        size: mod.Vector,
        anchor: mod.UIAnchor
    ): void {
        mod.AddUIContainer(name, position, size, anchor);
    }

    /**
     * Adds a button widget to the UI.
     * @param name The widget name.
     * @param position The position vector.
     * @param size The size vector.
     * @param anchor The anchor point.
     */
    export function addButton(
        name: string,
        position: mod.Vector,
        size: mod.Vector,
        anchor: mod.UIAnchor
    ): void {
        mod.AddUIButton(name, position, size, anchor);
    }

    /**
     * Adds a text widget to the UI.
     * @param name The widget name.
     * @param position The position vector.
     * @param size The size vector.
     * @param anchor The anchor point.
     * @param message The text message.
     */
    export function addText(
        name: string,
        position: mod.Vector,
        size: mod.Vector,
        anchor: mod.UIAnchor,
        message: mod.Message
    ): void {
        mod.AddUIText(name, position, size, anchor, message);
    }

    /**
     * Adds an image widget to the UI.
     * @param name The widget name.
     * @param position The position vector.
     * @param size The size vector.
     * @param anchor The anchor point.
     * @param imageType The image type.
     */
    export function addImage(
        name: string,
        position: mod.Vector,
        size: mod.Vector,
        anchor: mod.UIAnchor,
        imageType: mod.UIImageType
    ): void {
        mod.AddUIImage(name, position, size, anchor, imageType);
    }

    /**
     * Adds a gadget image widget to the UI.
     * @param name The widget name.
     * @param position The position vector.
     * @param size The size vector.
     * @param anchor The anchor point.
     * @param gadget The gadget type.
     * @param parent The parent widget.
     */
    export function addGadgetImage(
        name: string,
        position: mod.Vector,
        size: mod.Vector,
        anchor: mod.UIAnchor,
        gadget: mod.Gadgets,
        parent: mod.UIWidget
    ): void {
        mod.AddUIGadgetImage(name, position, size, anchor, gadget, parent);
    }

    /**
     * Adds a weapon image widget to the UI.
     * @param name The widget name.
     * @param position The position vector.
     * @param size The size vector.
     * @param anchor The anchor point.
     * @param weapon The weapon type.
     * @param parent The parent widget.
     */
    export function addWeaponImage(
        name: string,
        position: mod.Vector,
        size: mod.Vector,
        anchor: mod.UIAnchor,
        weapon: mod.Weapons,
        parent: mod.UIWidget
    ): void {
        mod.AddUIWeaponImage(name, position, size, anchor, weapon, parent);
    }

    // TODO - I want to keep track of all the ui widgets created in JS land
    // This will allow us to create a ui debugger/visualization tool
    /**
     * Deletes a widget from the UI.
     * @param widget The widget to delete.
     */
    export function deleteWidget(widget: mod.UIWidget): void {
        mod.DeleteUIWidget(widget);
    }

    /**
     * Deletes all widgets from the UI.
     */
    export function deleteAllWidgets(): void {
        mod.DeleteAllUIWidgets();
    }
}
