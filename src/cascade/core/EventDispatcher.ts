/**
 * src/cascade/core/EventDispatcher.ts
 *
 * Central event dispatcher that manages all event listeners and dispatches events efficiently.
 *
 * This system provides:
 * - O(1) event lookup and dispatch
 * - Support for multiple listeners per event
 * - Dynamic registration and unregistration of event handlers
 * - Zero runtime overhead via direct function invocation (no reflection)
 *
 * The dispatcher is used internally by ModRegistry to forward Portal game events
 * to the correct mod handlers.
 */

/**
 * Toggle for EventDispatcher debug logging.
 * Set to false to disable verbose dispatch logs.
 */
const DEBUG_EVENT_DISPATCHER = false;

/**
 * Map of event name -> array of listener functions.
 * This is the core data structure enabling O(1) lookup and fast iteration.
 */
function formatError(error: unknown): string {
    if (error instanceof Error) {
        const { message, stack } = error;
        if (stack?.includes(message)) {
            return stack;
        }
        return stack ? `${message}\n${stack}` : message;
    }

    if (typeof error === "object" && error !== null) {
        const stack = (error as { stack?: unknown }).stack;
        if (typeof stack === "string" && stack.length > 0) {
            return stack;
        }
    }

    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
}

const eventHandlers = new Map<string, ((...args: unknown[]) => void)[]>();

/**
 * Registers an event handler for a specific event.
 * Multiple handlers can be registered for the same event - all will be called.
 *
 * @param eventName The name of the event (e.g., "OnPlayerJoinGame")
 * @param handler The function to call when the event fires
 */
export function registerEventHandler(
    eventName: string,
    handler: (...args: unknown[]) => void
): void {
    if (typeof handler !== "function") {
        console.error(
            `[EventDispatcher] Attempted to register non-function handler for event "${eventName}"`,
            handler
        );
        return;
    }
    let handlers = eventHandlers.get(eventName);
    if (!handlers) {
        handlers = [];
        eventHandlers.set(eventName, handlers);
    }
    handlers.push(handler);
}

/**
 * Unregisters an event handler for a specific event.
 * This is crucial for dynamic mod lifecycle - when a mod unplugs, all its handlers must be removed.
 *
 * @param eventName The name of the event
 * @param handler The specific handler function to remove
 * @returns true if the handler was found and removed, false otherwise
 */
export function unregisterEventHandler(
    eventName: string,
    handler: (...args: unknown[]) => void
): boolean {
    const handlers = eventHandlers.get(eventName);
    if (!handlers) {
        return false;
    }

    const index = handlers.indexOf(handler);
    if (index === -1) {
        return false;
    }

    handlers.splice(index, 1);

    // Clean up empty handler arrays to keep the map lean
    if (handlers.length === 0) {
        eventHandlers.delete(eventName);
    }

    return true;
}

/**
 * Dispatches an event to all registered listeners for that event.
 * This is the single global function that Portal calls for all events.
 *
 * Performance: O(n) where n is the number of listeners for this specific event.
 * No dynamic dispatch, no property access, direct function invocation.
 *
 * @param eventName The name of the event being dispatched
 * @param args The arguments to pass to each handler
 */
export function dispatchEvent(eventName: string, ...args: unknown[]): void {
    const handlers = eventHandlers.get(eventName);
    if (!handlers) {
        // No handlers registered for this event - silent exit
        return;
    }

    if (DEBUG_EVENT_DISPATCHER) {
        console.log(
            `[EventDispatcher] Dispatching ${eventName} with handlers: ${handlers
                .map((handler) => typeof handler)
                .join(", ")}`
        );
    }

    // Call each handler in order
    for (const handler of handlers) {
        if (typeof handler !== "function") {
            console.error(
                `[EventDispatcher] Skipping non-function handler for event "${eventName}":`,
                handler
            );
            continue;
        }
        try {
            handler(...args);
        } catch (error) {
            // Log the error but continue with other handlers
            console.error(
                `[EventDispatcher] Error in handler for event "${eventName}":\n${formatError(
                    error
                )}`
            );
        }
    }
}

/**
 * Gets the current number of handlers registered for an event.
 * Useful for debugging and monitoring.
 *
 * @param eventName The name of the event
 * @returns The number of registered handlers
 */
export function getHandlerCount(eventName: string): number {
    const handlers = eventHandlers.get(eventName);
    return handlers ? handlers.length : 0;
}

/**
 * Clears all registered handlers for a specific event.
 * Use with caution - this will unregister all listeners.
 *
 * @param eventName The name of the event to clear handlers for
 */
export function clearEventHandlers(eventName: string): void {
    eventHandlers.delete(eventName);
}

/**
 * Clears all handlers for all events.
 * Use with caution - this is a complete reset of the event system.
 */
export function clearAllHandlers(): void {
    eventHandlers.clear();
}

/**
 * Gets a list of all registered event names.
 * Useful for debugging and monitoring.
 *
 * @returns Array of event names that have registered handlers
 */
export function getRegisteredEventNames(): string[] {
    return Array.from(eventHandlers.keys());
}
