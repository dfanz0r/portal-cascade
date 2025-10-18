// src/cascade/structures/UIWidget.ts
// UIWidget wrapper class.

import { Vector } from "../core/Vector";

/**
 * Wrapper class for UIWidget objects, providing ergonomic access to UI widget operations.
 */
export class UIWidget {
    public readonly handle: mod.UIWidget;

    public constructor(handle: mod.UIWidget) {
        this.handle = handle;
    }

    /**
     * Deletes this UI widget.
     */
    public delete(): void {
        mod.DeleteUIWidget(this.handle);
    }

    // Position and Size Properties

    /**
     * Gets the position of this widget.
     * @returns The position vector.
     */
    public getPosition(): Vector {
        return new Vector(mod.GetUIWidgetPosition(this.handle));
    }

    /**
     * Sets the position of this widget.
     * @param position The new position.
     */
    public setPosition(position: Vector | mod.Vector): void {
        const posHandle =
            position instanceof Vector ? position.getHandle() : position;
        mod.SetUIWidgetPosition(this.handle, posHandle);
    }

    /**
     * Gets the size of this widget.
     * @returns The size vector.
     */
    public getSize(): Vector {
        return new Vector(mod.GetUIWidgetSize(this.handle));
    }

    /**
     * Sets the size of this widget.
     * @param size The new size.
     */
    public setSize(size: Vector | mod.Vector): void {
        const sizeHandle = size instanceof Vector ? size.getHandle() : size;
        mod.SetUIWidgetSize(this.handle, sizeHandle);
    }

    // Anchor and Visibility

    /**
     * Gets the anchor point of this widget.
     * @returns The anchor.
     */
    public getAnchor(): mod.UIAnchor {
        return mod.GetUIWidgetAnchor(this.handle);
    }

    /**
     * Sets the anchor point of this widget.
     * @param anchor The new anchor.
     */
    public setAnchor(anchor: mod.UIAnchor): void {
        mod.SetUIWidgetAnchor(this.handle, anchor);
    }

    /**
     * Gets the visibility of this widget.
     * @returns Whether the widget is visible.
     */
    public getVisible(): boolean {
        return mod.GetUIWidgetVisible(this.handle);
    }

    /**
     * Sets the visibility of this widget.
     * @param visible Whether the widget should be visible.
     */
    public setVisible(visible: boolean): void {
        mod.SetUIWidgetVisible(this.handle, visible);
    }

    // Depth and Hierarchy

    /**
     * Gets the depth of this widget.
     * @returns The depth.
     */
    public getDepth(): mod.UIDepth {
        return mod.GetUIWidgetDepth(this.handle);
    }

    /**
     * Sets the depth of this widget.
     * @param depth The new depth.
     */
    public setDepth(depth: mod.UIDepth): void {
        mod.SetUIWidgetDepth(this.handle, depth);
    }

    /**
     * Gets the parent widget of this widget.
     * @returns The parent widget, or undefined if root.
     */
    public getParent(): mod.UIWidget | undefined {
        const parent = mod.GetUIWidgetParent(this.handle);
        return parent !== undefined ? parent : undefined;
    }

    /**
     * Sets the parent widget of this widget.
     * @param parent The new parent widget.
     */
    public setParent(parent: UIWidget): void {
        mod.SetUIWidgetParent(this.handle, parent.handle);
    }

    // Background Styling

    /**
     * Gets the background color of this widget.
     * @returns The background color.
     */
    public getBgColor(): Vector {
        return new Vector(mod.GetUIWidgetBgColor(this.handle));
    }

    /**
     * Sets the background color of this widget.
     * @param color The new background color.
     */
    public setBgColor(color: Vector | mod.Vector): void {
        const colorHandle = color instanceof Vector ? color.getHandle() : color;
        mod.SetUIWidgetBgColor(this.handle, colorHandle);
    }

    /**
     * Gets the background alpha of this widget.
     * @returns The background alpha.
     */
    public getBgAlpha(): number {
        return mod.GetUIWidgetBgAlpha(this.handle);
    }

    /**
     * Sets the background alpha of this widget.
     * @param alpha The new background alpha.
     */
    public setBgAlpha(alpha: number): void {
        mod.SetUIWidgetBgAlpha(this.handle, alpha);
    }

    /**
     * Gets the background fill type of this widget.
     * @returns The background fill type.
     */
    public getBgFill(): mod.UIBgFill {
        return mod.GetUIWidgetBgFill(this.handle);
    }

    /**
     * Sets the background fill type of this widget.
     * @param bgFill The new background fill type.
     */
    public setBgFill(bgFill: mod.UIBgFill): void {
        mod.SetUIWidgetBgFill(this.handle, bgFill);
    }

    // Padding and Layout

    /**
     * Gets the padding of this widget.
     * @returns The padding value.
     */
    public getPadding(): number {
        return mod.GetUIWidgetPadding(this.handle);
    }

    /**
     * Sets the padding of this widget.
     * @param padding The new padding value.
     */
    public setPadding(padding: number): void {
        mod.SetUIWidgetPadding(this.handle, padding);
    }

    // Widget Identity

    /**
     * Gets the name of this widget.
     * @returns The widget name.
     */
    public getName(): string {
        return mod.GetUIWidgetName(this.handle);
    }

    /**
     * Sets the name of this widget.
     * @param name The new name.
     */
    public setName(name: string): void {
        mod.SetUIWidgetName(this.handle, name);
    }

    // Text Widget Properties

    /**
     * Sets the text label of this widget (if it's a text widget).
     * @param message The new text message.
     */
    public setText(message: mod.Message): void {
        mod.SetUITextLabel(this.handle, message);
    }

    /**
     * Gets the text color of this widget (if it's a text widget).
     * @returns The text color.
     */
    public getTextColor(): Vector {
        return new Vector(mod.GetUITextColor(this.handle));
    }

    /**
     * Sets the text color of this widget (if it's a text widget).
     * @param color The new text color.
     */
    public setTextColor(color: Vector | mod.Vector): void {
        const colorHandle = color instanceof Vector ? color.getHandle() : color;
        mod.SetUITextColor(this.handle, colorHandle);
    }

    /**
     * Gets the text alpha of this widget (if it's a text widget).
     * @returns The text alpha.
     */
    public getTextAlpha(): number {
        return mod.GetUITextAlpha(this.handle);
    }

    /**
     * Sets the text alpha of this widget (if it's a text widget).
     * @param alpha The new text alpha.
     */
    public setTextAlpha(alpha: number): void {
        mod.SetUITextAlpha(this.handle, alpha);
    }

    /**
     * Gets the text size of this widget (if it's a text widget).
     * @returns The text size.
     */
    public getTextSize(): number {
        return mod.GetUITextSize(this.handle);
    }

    /**
     * Sets the text size of this widget (if it's a text widget).
     * @param size The new text size.
     */
    public setTextSize(size: number): void {
        mod.SetUITextSize(this.handle, size);
    }

    /**
     * Gets the text anchor of this widget (if it's a text widget).
     * @returns The text anchor.
     */
    public getTextAnchor(): mod.UIAnchor {
        return mod.GetUITextAnchor(this.handle);
    }

    /**
     * Sets the text anchor of this widget (if it's a text widget).
     * @param anchor The new text anchor.
     */
    public setTextAnchor(anchor: mod.UIAnchor): void {
        mod.SetUITextAnchor(this.handle, anchor);
    }

    // Image Widget Properties

    /**
     * Gets the image type of this widget (if it's an image widget).
     * @returns The image type.
     */
    public getImageType(): mod.UIImageType {
        return mod.GetUIImageType(this.handle);
    }

    /**
     * Sets the image type of this widget (if it's an image widget).
     * @param imageType The new image type.
     */
    public setImageType(imageType: mod.UIImageType): void {
        mod.SetUIImageType(this.handle, imageType);
    }

    /**
     * Gets the image color of this widget (if it's an image widget).
     * @returns The image color.
     */
    public getImageColor(): Vector {
        return new Vector(mod.GetUIImageColor(this.handle));
    }

    /**
     * Sets the image color of this widget (if it's an image widget).
     * @param color The new image color.
     */
    public setImageColor(color: Vector | mod.Vector): void {
        const colorHandle = color instanceof Vector ? color.getHandle() : color;
        mod.SetUIImageColor(this.handle, colorHandle);
    }

    /**
     * Gets the image alpha of this widget (if it's an image widget).
     * @returns The image alpha.
     */
    public getImageAlpha(): number {
        return mod.GetUIImageAlpha(this.handle);
    }

    /**
     * Sets the image alpha of this widget (if it's an image widget).
     * @param alpha The new image alpha.
     */
    public setImageAlpha(alpha: number): void {
        mod.SetUIImageAlpha(this.handle, alpha);
    }

    // Button Widget Properties

    /**
     * Gets the enabled state of this widget (if it's a button widget).
     * @returns Whether the button is enabled.
     */
    public getButtonEnabled(): boolean {
        return mod.GetUIButtonEnabled(this.handle);
    }

    /**
     * Sets the enabled state of this widget (if it's a button widget).
     * @param enabled Whether the button should be enabled.
     */
    public setButtonEnabled(enabled: boolean): void {
        mod.SetUIButtonEnabled(this.handle, enabled);
    }

    // Button Base State

    /**
     * Gets the base color of this button widget.
     * @returns The base color.
     */
    public getButtonColorBase(): Vector {
        return new Vector(mod.GetUIButtonColorBase(this.handle));
    }

    /**
     * Sets the base color of this button widget.
     * @param color The new base color.
     */
    public setButtonColorBase(color: Vector | mod.Vector): void {
        const colorHandle = color instanceof Vector ? color.getHandle() : color;
        mod.SetUIButtonColorBase(this.handle, colorHandle);
    }

    /**
     * Gets the base alpha of this button widget.
     * @returns The base alpha.
     */
    public getButtonAlphaBase(): number {
        return mod.GetUIButtonAlphaBase(this.handle);
    }

    /**
     * Sets the base alpha of this button widget.
     * @param alpha The new base alpha.
     */
    public setButtonAlphaBase(alpha: number): void {
        mod.SetUIButtonAlphaBase(this.handle, alpha);
    }

    // Button Hover State

    /**
     * Gets the hover color of this button widget.
     * @returns The hover color.
     */
    public getButtonColorHover(): Vector {
        return new Vector(mod.GetUIButtonColorHover(this.handle));
    }

    /**
     * Sets the hover color of this button widget.
     * @param color The new hover color.
     */
    public setButtonColorHover(color: Vector | mod.Vector): void {
        const colorHandle = color instanceof Vector ? color.getHandle() : color;
        mod.SetUIButtonColorHover(this.handle, colorHandle);
    }

    /**
     * Gets the hover alpha of this button widget.
     * @returns The hover alpha.
     */
    public getButtonAlphaHover(): number {
        return mod.GetUIButtonAlphaHover(this.handle);
    }

    /**
     * Sets the hover alpha of this button widget.
     * @param alpha The new hover alpha.
     */
    public setButtonAlphaHover(alpha: number): void {
        mod.SetUIButtonAlphaHover(this.handle, alpha);
    }

    // Button Pressed State

    /**
     * Gets the pressed color of this button widget.
     * @returns The pressed color.
     */
    public getButtonColorPressed(): Vector {
        return new Vector(mod.GetUIButtonColorPressed(this.handle));
    }

    /**
     * Sets the pressed color of this button widget.
     * @param color The new pressed color.
     */
    public setButtonColorPressed(color: Vector | mod.Vector): void {
        const colorHandle = color instanceof Vector ? color.getHandle() : color;
        mod.SetUIButtonColorPressed(this.handle, colorHandle);
    }

    /**
     * Gets the pressed alpha of this button widget.
     * @returns The pressed alpha.
     */
    public getButtonAlphaPressed(): number {
        return mod.GetUIButtonAlphaPressed(this.handle);
    }

    /**
     * Sets the pressed alpha of this button widget.
     * @param alpha The new pressed alpha.
     */
    public setButtonAlphaPressed(alpha: number): void {
        mod.SetUIButtonAlphaPressed(this.handle, alpha);
    }

    // Button Focused State

    /**
     * Gets the focused color of this button widget.
     * @returns The focused color.
     */
    public getButtonColorFocused(): Vector {
        return new Vector(mod.GetUIButtonColorFocused(this.handle));
    }

    /**
     * Sets the focused color of this button widget.
     * @param color The new focused color.
     */
    public setButtonColorFocused(color: Vector | mod.Vector): void {
        const colorHandle = color instanceof Vector ? color.getHandle() : color;
        mod.SetUIButtonColorFocused(this.handle, colorHandle);
    }

    /**
     * Gets the focused alpha of this button widget.
     * @returns The focused alpha.
     */
    public getButtonAlphaFocused(): number {
        return mod.GetUIButtonAlphaFocused(this.handle);
    }

    /**
     * Sets the focused alpha of this button widget.
     * @param alpha The new focused alpha.
     */
    public setButtonAlphaFocused(alpha: number): void {
        mod.SetUIButtonAlphaFocused(this.handle, alpha);
    }

    // Button Disabled State

    /**
     * Gets the disabled color of this button widget.
     * @returns The disabled color.
     */
    public getButtonColorDisabled(): Vector {
        return new Vector(mod.GetUIButtonColorDisabled(this.handle));
    }

    /**
     * Sets the disabled color of this button widget.
     * @param color The new disabled color.
     */
    public setButtonColorDisabled(color: Vector | mod.Vector): void {
        const colorHandle = color instanceof Vector ? color.getHandle() : color;
        mod.SetUIButtonColorDisabled(this.handle, colorHandle);
    }

    /**
     * Gets the disabled alpha of this button widget.
     * @returns The disabled alpha.
     */
    public getButtonAlphaDisabled(): number {
        return mod.GetUIButtonAlphaDisabled(this.handle);
    }

    /**
     * Sets the disabled alpha of this button widget.
     * @param alpha The new disabled alpha.
     */
    public setButtonAlphaDisabled(alpha: number): void {
        mod.SetUIButtonAlphaDisabled(this.handle, alpha);
    }

    // Button Events

    /**
     * Enables a button event for this widget.
     * @param buttonEvent The button event type.
     */
    public enableButtonEvent(buttonEvent: mod.UIButtonEvent): void {
        mod.EnableUIButtonEvent(this.handle, buttonEvent, true);
    }

    /**
     * Disables a button event for this widget.
     * @param buttonEvent The button event type.
     */
    public disableButtonEvent(buttonEvent: mod.UIButtonEvent): void {
        mod.EnableUIButtonEvent(this.handle, buttonEvent, false);
    }
}
