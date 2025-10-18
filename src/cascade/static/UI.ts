// src/cascade/static/UI.ts
// Static utility namespace for UI widget creation and manipulation

/**
 * Static utility namespace for UI widget creation and manipulation.
 * Provides methods for adding, manipulating, and managing UI widgets.
 */
export namespace UI {
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

    /**
     * Finds a widget by name.
     * @param name The widget name.
     * @returns The widget, or any if not found.
     */
    export function findWidgetByName(name: string): mod.Any {
        return mod.FindUIWidgetWithName(name);
    }

    /**
     * Finds a widget by name within a search root.
     * @param name The widget name.
     * @param searchRoot The root widget to search within.
     * @returns The widget.
     */
    export function findWidgetByNameIn(
        name: string,
        searchRoot: mod.UIWidget
    ): mod.UIWidget {
        return mod.FindUIWidgetWithName(name, searchRoot);
    }

    /**
     * Enables a UI button event.
     * @param widget The button widget.
     * @param buttonEvent The button event type.
     */
    export function enableButtonEvent(
        widget: mod.UIWidget,
        buttonEvent: mod.UIButtonEvent
    ): void {
        mod.EnableUIButtonEvent(widget, buttonEvent, true);
    }

    /**
     * Disables a UI button event.
     * @param widget The button widget.
     * @param buttonEvent The button event type.
     */
    export function disableButtonEvent(
        widget: mod.UIWidget,
        buttonEvent: mod.UIButtonEvent
    ): void {
        mod.EnableUIButtonEvent(widget, buttonEvent, false);
    }

    /**
     * Sets the position of a widget.
     * @param widget The widget.
     * @param position The position vector.
     */
    export function setPosition(
        widget: mod.UIWidget,
        position: mod.Vector
    ): void {
        mod.SetUIWidgetPosition(widget, position);
    }

    /**
     * Sets the size of a widget.
     * @param widget The widget.
     * @param size The size vector.
     */
    export function setSize(widget: mod.UIWidget, size: mod.Vector): void {
        mod.SetUIWidgetSize(widget, size);
    }

    /**
     * Sets the anchor of a widget.
     * @param widget The widget.
     * @param anchor The anchor point.
     */
    export function setAnchor(
        widget: mod.UIWidget,
        anchor: mod.UIAnchor
    ): void {
        mod.SetUIWidgetAnchor(widget, anchor);
    }

    /**
     * Sets the visibility of a widget.
     * @param widget The widget.
     * @param visible Whether the widget is visible.
     */
    export function setVisible(widget: mod.UIWidget, visible: boolean): void {
        mod.SetUIWidgetVisible(widget, visible);
    }

    /**
     * Sets the depth of a widget.
     * @param widget The widget.
     * @param depth The depth.
     */
    export function setDepth(widget: mod.UIWidget, depth: mod.UIDepth): void {
        mod.SetUIWidgetDepth(widget, depth);
    }

    /**
     * Sets the parent of a widget.
     * @param widget The widget.
     * @param parent The parent widget.
     */
    export function setParent(
        widget: mod.UIWidget,
        parent: mod.UIWidget
    ): void {
        mod.SetUIWidgetParent(widget, parent);
    }

    /**
     * Sets the padding of a widget.
     * @param widget The widget.
     * @param padding The padding value.
     */
    export function setPadding(widget: mod.UIWidget, padding: number): void {
        mod.SetUIWidgetPadding(widget, padding);
    }

    /**
     * Sets the background color of a widget.
     * @param widget The widget.
     * @param color The color vector.
     */
    export function setBgColor(widget: mod.UIWidget, color: mod.Vector): void {
        mod.SetUIWidgetBgColor(widget, color);
    }

    /**
     * Sets the background alpha of a widget.
     * @param widget The widget.
     * @param alpha The alpha value.
     */
    export function setBgAlpha(widget: mod.UIWidget, alpha: number): void {
        mod.SetUIWidgetBgAlpha(widget, alpha);
    }

    /**
     * Sets the background fill of a widget.
     * @param widget The widget.
     * @param bgFill The background fill type.
     */
    export function setBgFill(
        widget: mod.UIWidget,
        bgFill: mod.UIBgFill
    ): void {
        mod.SetUIWidgetBgFill(widget, bgFill);
    }

    /**
     * Sets the name of a widget.
     * @param widget The widget.
     * @param name The name.
     */
    export function setName(widget: mod.UIWidget, name: string): void {
        mod.SetUIWidgetName(widget, name);
    }

    /**
     * Sets the text label of a text widget.
     * @param widget The text widget.
     * @param message The text message.
     */
    export function setText(widget: mod.UIWidget, message: mod.Message): void {
        mod.SetUITextLabel(widget, message);
    }

    /**
     * Sets the text color of a text widget.
     * @param widget The text widget.
     * @param color The color vector.
     */
    export function setTextColor(
        widget: mod.UIWidget,
        color: mod.Vector
    ): void {
        mod.SetUITextColor(widget, color);
    }

    /**
     * Sets the text alpha of a text widget.
     * @param widget The text widget.
     * @param alpha The alpha value.
     */
    export function setTextAlpha(widget: mod.UIWidget, alpha: number): void {
        mod.SetUITextAlpha(widget, alpha);
    }

    /**
     * Sets the text size of a text widget.
     * @param widget The text widget.
     * @param size The text size.
     */
    export function setTextSize(widget: mod.UIWidget, size: number): void {
        mod.SetUITextSize(widget, size);
    }

    /**
     * Sets the text anchor of a text widget.
     * @param widget The text widget.
     * @param anchor The anchor point.
     */
    export function setTextAnchor(
        widget: mod.UIWidget,
        anchor: mod.UIAnchor
    ): void {
        mod.SetUITextAnchor(widget, anchor);
    }

    /**
     * Sets the image type of an image widget.
     * @param widget The image widget.
     * @param imageType The image type.
     */
    export function setImageType(
        widget: mod.UIWidget,
        imageType: mod.UIImageType
    ): void {
        mod.SetUIImageType(widget, imageType);
    }

    /**
     * Sets the color of an image widget.
     * @param widget The image widget.
     * @param color The color vector.
     */
    export function setImageColor(
        widget: mod.UIWidget,
        color: mod.Vector
    ): void {
        mod.SetUIImageColor(widget, color);
    }

    /**
     * Sets the alpha of an image widget.
     * @param widget The image widget.
     * @param alpha The alpha value.
     */
    export function setImageAlpha(widget: mod.UIWidget, alpha: number): void {
        mod.SetUIImageAlpha(widget, alpha);
    }

    /**
     * Sets the enabled state of a button widget.
     * @param widget The button widget.
     * @param enabled Whether the button is enabled.
     */
    export function setButtonEnabled(
        widget: mod.UIWidget,
        enabled: boolean
    ): void {
        mod.SetUIButtonEnabled(widget, enabled);
    }

    /**
     * Sets the base color of a button widget.
     * @param widget The button widget.
     * @param color The color vector.
     */
    export function setButtonColorBase(
        widget: mod.UIWidget,
        color: mod.Vector
    ): void {
        mod.SetUIButtonColorBase(widget, color);
    }

    /**
     * Sets the base alpha of a button widget.
     * @param widget The button widget.
     * @param alpha The alpha value.
     */
    export function setButtonAlphaBase(
        widget: mod.UIWidget,
        alpha: number
    ): void {
        mod.SetUIButtonAlphaBase(widget, alpha);
    }

    /**
     * Sets the hover color of a button widget.
     * @param widget The button widget.
     * @param color The color vector.
     */
    export function setButtonColorHover(
        widget: mod.UIWidget,
        color: mod.Vector
    ): void {
        mod.SetUIButtonColorHover(widget, color);
    }

    /**
     * Sets the hover alpha of a button widget.
     * @param widget The button widget.
     * @param alpha The alpha value.
     */
    export function setButtonAlphaHover(
        widget: mod.UIWidget,
        alpha: number
    ): void {
        mod.SetUIButtonAlphaHover(widget, alpha);
    }

    /**
     * Sets the pressed color of a button widget.
     * @param widget The button widget.
     * @param color The color vector.
     */
    export function setButtonColorPressed(
        widget: mod.UIWidget,
        color: mod.Vector
    ): void {
        mod.SetUIButtonColorPressed(widget, color);
    }

    /**
     * Sets the pressed alpha of a button widget.
     * @param widget The button widget.
     * @param alpha The alpha value.
     */
    export function setButtonAlphaPressed(
        widget: mod.UIWidget,
        alpha: number
    ): void {
        mod.SetUIButtonAlphaPressed(widget, alpha);
    }

    /**
     * Sets the focused color of a button widget.
     * @param widget The button widget.
     * @param color The color vector.
     */
    export function setButtonColorFocused(
        widget: mod.UIWidget,
        color: mod.Vector
    ): void {
        mod.SetUIButtonColorFocused(widget, color);
    }

    /**
     * Sets the focused alpha of a button widget.
     * @param widget The button widget.
     * @param alpha The alpha value.
     */
    export function setButtonAlphaFocused(
        widget: mod.UIWidget,
        alpha: number
    ): void {
        mod.SetUIButtonAlphaFocused(widget, alpha);
    }

    /**
     * Sets the disabled color of a button widget.
     * @param widget The button widget.
     * @param color The color vector.
     */
    export function setButtonColorDisabled(
        widget: mod.UIWidget,
        color: mod.Vector
    ): void {
        mod.SetUIButtonColorDisabled(widget, color);
    }

    /**
     * Sets the disabled alpha of a button widget.
     * @param widget The button widget.
     * @param alpha The alpha value.
     */
    export function setButtonAlphaDisabled(
        widget: mod.UIWidget,
        alpha: number
    ): void {
        mod.SetUIButtonAlphaDisabled(widget, alpha);
    }
}
