// src/cascade/static/Notifications.ts
// Static utility namespace for messaging and notifications

/**
 * Static utility namespace for notification operations.
 * Provides methods for displaying messages, notifications, and error reports.
 */
export namespace Notifications {
    /**
     * Displays a highlighted message in the world log for all players.
     * @param message The message to display.
     */
    export function displayHighlightedWorldLog(message: mod.Message): void {
        mod.DisplayHighlightedWorldLogMessage(message);
    }

    /**
     * Displays a highlighted message in the world log for a specific player.
     * @param message The message to display.
     * @param player The player to show the message to.
     */
    export function displayHighlightedWorldLogForPlayer(
        message: mod.Message,
        player: mod.Player
    ): void {
        mod.DisplayHighlightedWorldLogMessage(message, player);
    }

    /**
     * Displays a highlighted message in the world log for a specific team.
     * @param message The message to display.
     * @param team The team to show the message to.
     */
    export function displayHighlightedWorldLogForTeam(
        message: mod.Message,
        team: mod.Team
    ): void {
        mod.DisplayHighlightedWorldLogMessage(message, team);
    }

    /**
     * Displays a notification message for all players.
     * @param message The notification message.
     */
    export function displayNotification(message: mod.Message): void {
        mod.DisplayNotificationMessage(message);
    }

    /**
     * Displays a notification message for a specific player.
     * @param message The notification message.
     * @param player The player to show the notification to.
     */
    export function displayNotificationForPlayer(
        message: mod.Message,
        player: mod.Player
    ): void {
        mod.DisplayNotificationMessage(message, player);
    }

    /**
     * Displays a notification message for a specific team.
     * @param message The notification message.
     * @param team The team to show the notification to.
     */
    export function displayNotificationForTeam(
        message: mod.Message,
        team: mod.Team
    ): void {
        mod.DisplayNotificationMessage(message, team);
    }

    /**
     * Displays a custom notification in a slot for all players.
     * @param message The custom message.
     * @param slot The notification slot.
     * @param duration The duration to display (in seconds).
     */
    export function displayCustomNotification(
        message: mod.Message,
        slot: mod.CustomNotificationSlots,
        duration: number
    ): void {
        mod.DisplayCustomNotificationMessage(message, slot, duration);
    }

    /**
     * Displays a custom notification in a slot for a specific player.
     * @param message The custom message.
     * @param slot The notification slot.
     * @param duration The duration to display (in seconds).
     * @param player The player to show to.
     */
    export function displayCustomNotificationForPlayer(
        message: mod.Message,
        slot: mod.CustomNotificationSlots,
        duration: number,
        player: mod.Player
    ): void {
        mod.DisplayCustomNotificationMessage(message, slot, duration, player);
    }

    /**
     * Displays a custom notification in a slot for a specific team.
     * @param message The custom message.
     * @param slot The notification slot.
     * @param duration The duration to display (in seconds).
     * @param team The team to show to.
     */
    export function displayCustomNotificationForTeam(
        message: mod.Message,
        slot: mod.CustomNotificationSlots,
        duration: number,
        team: mod.Team
    ): void {
        mod.DisplayCustomNotificationMessage(message, slot, duration, team);
    }

    /**
     * Clears a custom notification slot for all players.
     * @param slot The notification slot to clear.
     */
    export function clearCustomNotification(
        slot: mod.CustomNotificationSlots
    ): void {
        mod.ClearCustomNotificationMessage(slot);
    }

    /**
     * Clears a custom notification slot for a specific player.
     * @param slot The notification slot to clear.
     * @param player The player to clear for.
     */
    export function clearCustomNotificationForPlayer(
        slot: mod.CustomNotificationSlots,
        player: mod.Player
    ): void {
        mod.ClearCustomNotificationMessage(slot, player);
    }

    /**
     * Clears a custom notification slot for a specific team.
     * @param slot The notification slot to clear.
     * @param team The team to clear for.
     */
    export function clearCustomNotificationForTeam(
        slot: mod.CustomNotificationSlots,
        team: mod.Team
    ): void {
        mod.ClearCustomNotificationMessage(slot, team);
    }

    /**
     * Clears all custom notification slots for a specific player.
     * @param player The player to clear all notifications for.
     */
    export function clearAllCustomNotifications(player: mod.Player): void {
        mod.ClearAllCustomNotificationMessages(player);
    }

    /**
     * Sends an error report message to the admin menu.
     * @param message The error message to report.
     */
    export function sendErrorReport(message: mod.Message): void {
        mod.SendErrorReport(message);
    }
}
