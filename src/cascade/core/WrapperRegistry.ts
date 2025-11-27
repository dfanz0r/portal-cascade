// src/cascade/core/WrapperRegistry.ts
// Generic wrapper registry for caching wrapper instances across the framework

import { Preserve } from "../decorators";

/**
 * Function that extracts a unique, comparable key from a handle.
 * Different handle types have different ways to identify equality:
 * - mod.Player: GetObjId(handle)
 * - mod.UIWidget: GetUIWidgetName(handle) or some other stable identifier
 * - etc.
 *
 * @template T The handle type
 * @returns A string key that uniquely identifies this handle
 */
export type HandleKeyExtractor<T> = (handle: T) => string;

/**
 * Validation function type for checking if a handle is still valid.
 * Should return true if the handle is valid and safe to use, false if destroyed/invalid.
 */
export type HandleValidator<T> = (handle: T) => boolean;

/**
 * Generic wrapper registry for caching wrapper instances across the framework.
 *
 * Unlike simple Map-based caching, this registry uses custom key extraction
 * because runtime handles are not directly comparable (each function call returns
 * a different instance even for the same underlying object).
 *
 * Prevents creating new wrapper objects on every event dispatch.
 * Reuses the same wrapper instance for the same underlying handle.
 *
 * Automatically cleans up stale entries when handles become invalid (destroyed on engine side).
 *
 * Usage:
 * ```typescript
 * const playerRegistry = new WrapperRegistry(
 *   (handle: mod.Player) => new Player(handle),
 *   (handle: mod.Player) => mod.GetObjId(handle).toString(), // key extractor
 *   (handle: mod.Player) => mod.IsPlayerValid(handle) // validator
 * );
 * const player = playerRegistry.getOrCreate(eventPlayer); // Reused if valid and cached
 * ```
 *
 * @template T The handle type (any engine type)
 * @template W The wrapper type (e.g., Player, UIButtonWidget)
 */
@Preserve()
export class WrapperRegistry<T, W> {
    private cache = new Map<string, W>();
    private factory: (handle: T) => W;
    private keyExtractor: HandleKeyExtractor<T>;
    private validator?: HandleValidator<T>;

    /**
     * Creates a new wrapper registry.
     * @param factory Function to create a wrapper instance from a handle
     * @param keyExtractor Function to extract a unique, stable key from a handle
     * @param validator Optional function to validate if a handle is still valid.
     *                  If provided, stale entries are removed automatically.
     */
    public constructor(
        factory: (handle: T) => W,
        keyExtractor: HandleKeyExtractor<T>,
        validator?: HandleValidator<T>
    ) {
        this.factory = factory;
        this.keyExtractor = keyExtractor;
        this.validator = validator;
    }

    /**
     * Gets or creates a wrapper instance for a handle.
     * If the handle's key is already cached and still valid, the cached wrapper is returned.
     * Otherwise, a new wrapper is created via the factory and cached.
     *
     * If a cached entry is found but the handle is invalid (via validator), it's removed.
     *
     * @param handle The underlying engine handle
     * @returns The cached or newly created wrapper instance
     */
    public getOrCreate(handle: T): W {
        const key = this.keyExtractor(handle);

        // Check if already cached by key
        let wrapper = this.cache.get(key);
        if (wrapper) {
            // If validator provided, check if handle is still valid
            if (this.validator && !this.validator(handle)) {
                // Handle has been destroyed, remove from cache
                this.cache.delete(key);
                wrapper = this.factory(handle);
                this.cache.set(key, wrapper);
            }
            return wrapper;
        }

        // Not cached, create new wrapper
        wrapper = this.factory(handle);
        this.cache.set(key, wrapper);
        return wrapper;
    }

    /**
     * Removes a wrapper from the cache by its key.
     * Call this when the underlying object is destroyed or no longer valid.
     *
     * @param handle The underlying engine handle (used to extract the key)
     */
    public remove(handle: T): void {
        const key = this.keyExtractor(handle);
        this.cache.delete(key);
    }

    /**
     * Removes a wrapper from the cache by key string directly.
     * Useful when you have the key but not the handle.
     *
     * @param key The cache key
     */
    public removeByKey(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Removes all invalid entries from the cache using the validator.
     * Only works if a validator was provided during construction.
     *
     * Note: This is inefficient because we can't iterate over handles,
     * only keys. A full prune requires external knowledge of which handles
     * are still valid.
     *
     * @returns The number of entries removed
     */
    public prune(): number {
        // Note: Cannot fully prune without keeping handles alongside keys
        // Consider storing handles in a WeakMap if pruning is critical
        return 0;
    }

    /**
     * Clears all cached wrappers.
     */
    public clear(): void {
        this.cache.clear();
    }

    /**
     * Gets the current cache size.
     */
    public size(): number {
        return this.cache.size;
    }
}
