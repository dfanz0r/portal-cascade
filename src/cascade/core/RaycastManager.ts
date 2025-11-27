/**
 * RaycastManager - Handles raycast requests with queueing and event-based results
 *
 * The Portal engine only supports one active raycast at a time. This manager:
 * - Queues incoming raycast requests
 * - Processes them sequentially
 * - Handles timeouts for stuck raycasts
 * - Manages event listener registration for raycast results
 */

import type { Player } from "../structures/Player";
import {
    registerEventHandler,
    unregisterEventHandler,
} from "./EventDispatcher";
import type { Vector } from "./Vector";
import { Preserve } from "../decorators";

/**
 * Request parameters for a raycast operation
 */
export interface RaycastRequest {
    /**
     * Origin point for the raycast (world position)
     */
    origin: Vector;

    /**
     * Direction or end point for the raycast
     * If end point, treated as absolute position
     */
    direction: Vector;

    /**
     * Optional: Player performing the raycast (for engine queries)
     * If provided, raycast is relative to player; if not, world-space raycast
     */
    player?: Player;

    /**
     * Optional: Timeout in milliseconds (default: 5000)
     * If raycast doesn't complete within this time, it's canceled
     */
    timeout?: number;
}

/**
 * Result of a raycast operation
 */
export interface RaycastResult {
    /**
     * Whether something was hit
     */
    hit: boolean;

    /**
     * Hit position (if hit)
     */
    hitPosition?: Vector;

    /**
     * Object that was hit (if hit)
     */
    hitObject?: Player | object;

    /**
     * Distance from origin to hit point
     */
    distance?: number;

    /**
     * Any error that occurred
     */
    error?: string;
}

/**
 * Internal queue item for pending raycasts
 */
interface QueuedRaycast {
    request: RaycastRequest;
    resolve: (result: RaycastResult) => void;
    reject: (error: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * Singleton manager for sequential raycast processing
 */
@Preserve()
class RaycastManager {
    private static instance: RaycastManager | null = null;

    private queue: QueuedRaycast[] = [];
    private activeRaycast: QueuedRaycast | null = null;
    private raycastResultHandler: ((...args: unknown[]) => void) | null = null;
    private raycastMissHandler: ((...args: unknown[]) => void) | null = null;

    private constructor() {
        this.setupEventListeners();
    }

    /**
     * Get or create the singleton RaycastManager instance
     */
    static getInstance(): RaycastManager {
        if (!RaycastManager.instance) {
            RaycastManager.instance = new RaycastManager();
        }
        return RaycastManager.instance;
    }

    /**
     * Setup event listeners for raycast results
     * Listens to OnRayCastHit and OnRayCastMissed events from the engine
     */
    private setupEventListeners(): void {
        // Handler for successful raycast hits
        this.raycastResultHandler = (...args: unknown[]): void => {
            const result = args[0] as RaycastResult;
            if (this.activeRaycast) {
                clearTimeout(this.activeRaycast.timeoutId);
                this.activeRaycast.resolve(result);
                this.activeRaycast = null;

                console.log(
                    `[RaycastManager] Raycast hit at distance ${result.distance}`
                );
                // Process next queued raycast at the end of this callback
                this.processQueue();
            }
        };

        // Handler for raycast misses
        this.raycastMissHandler = (...args: unknown[]): void => {
            if (this.activeRaycast) {
                clearTimeout(this.activeRaycast.timeoutId);
                this.activeRaycast.resolve({
                    hit: false,
                    error: "Raycast missed (nothing hit)",
                });
                this.activeRaycast = null;

                console.log("[RaycastManager] Raycast missed");
                // Process next queued raycast at the end of this callback
                this.processQueue();
            }
        };

        // Register handlers with event dispatcher
        if (this.raycastResultHandler) {
            registerEventHandler("onRayCastHit", this.raycastResultHandler);
        }
        if (this.raycastMissHandler) {
            registerEventHandler("onRayCastMissed", this.raycastMissHandler);
        }
    }

    /**
     * Perform a raycast operation
     * Returns a promise that resolves when the raycast completes
     *
     * @param request Raycast request parameters
     * @returns Promise resolving to raycast result
     */
    async raycast(request: RaycastRequest): Promise<RaycastResult> {
        return new Promise<RaycastResult>((resolve, reject) => {
            const timeout = request.timeout ?? 5000;

            // Create timeout handler
            const timeoutId = setTimeout(() => {
                const error = new Error(`Raycast timed out after ${timeout}ms`);

                // Remove from queue if still there
                const index = this.queue.findIndex(
                    (item) => item.request === request
                );
                if (index !== -1) {
                    this.queue.splice(index, 1);
                }

                console.error("[RaycastManager] Raycast timeout:", error);
                reject(error);
            }, timeout);

            // Add to queue
            const queuedRaycast: QueuedRaycast = {
                request,
                resolve,
                reject,
                timeoutId,
            };

            this.queue.push(queuedRaycast);

            console.log(
                `[RaycastManager] Queued raycast (queue size: ${this.queue.length})`
            );

            // Try to process if not busy
            if (!this.activeRaycast) {
                this.processQueue();
            }
        });
    }

    /**
     * Process the next raycast in the queue
     * Executes the raycast request through the engine
     */
    private processQueue(): void {
        if (this.activeRaycast || this.queue.length === 0) {
            return;
        }

        const queuedRaycast = this.queue.shift();
        if (!queuedRaycast) {
            return;
        }

        this.activeRaycast = queuedRaycast;
        const request = queuedRaycast.request;

        console.log(
            `[RaycastManager] Processing raycast (${this.queue.length} remaining in queue)`
        );

        // Execute the raycast through the engine
        try {
            // Call Portal engine RayCast function
            // The result will be handled by the event listeners (onRayCastHit or onRayCastMissed)
            // Unwrap the Vector wrappers to get raw mod.Vector handles
            const origin = request.origin.getHandle();
            const direction = request.direction.getHandle();

            if (request.player) {
                // Player-relative raycast
                // Unwrap the Player wrapper to get raw mod.Player handle
                const playerHandle = request.player.handle;
                mod.RayCast(playerHandle, origin, direction);
            } else {
                // World-space raycast
                mod.RayCast(origin, direction);
            }
        } catch (error) {
            clearTimeout(queuedRaycast.timeoutId);
            this.activeRaycast = null;

            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.error(
                "[RaycastManager] Raycast execution error:",
                errorMessage
            );

            queuedRaycast.reject(
                new Error(`Raycast execution failed: ${errorMessage}`)
            );

            // Try next in queue
            this.processQueue();
        }
    }

    /**
     * Get the current queue size
     * Useful for monitoring how many raycasts are pending
     */
    getQueueSize(): number {
        return this.queue.length + (this.activeRaycast ? 1 : 0);
    }

    /**
     * Clear the queue and cancel all pending raycasts
     * Called when mod unloads
     */
    clearQueue(): void {
        // Cancel pending raycasts
        for (const queuedRaycast of this.queue) {
            clearTimeout(queuedRaycast.timeoutId);
            queuedRaycast.reject(new Error("Raycast queue cleared"));
        }

        // Cancel active raycast
        if (this.activeRaycast) {
            clearTimeout(this.activeRaycast.timeoutId);
            this.activeRaycast.reject(new Error("Raycast queue cleared"));
        }

        this.queue = [];
        this.activeRaycast = null;

        console.log("[RaycastManager] Queue cleared");
    }

    /**
     * Cleanup: Unregister event listeners
     * Called when framework is shutting down
     */
    destroy(): void {
        this.clearQueue();

        if (this.raycastResultHandler) {
            unregisterEventHandler("onRayCastHit", this.raycastResultHandler);
        }

        if (this.raycastMissHandler) {
            unregisterEventHandler("onRayCastMissed", this.raycastMissHandler);
        }

        RaycastManager.instance = null;
        console.log("[RaycastManager] Destroyed");
    }
}

export default RaycastManager;
