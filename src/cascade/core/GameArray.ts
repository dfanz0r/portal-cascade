// src/cascade/structures/GameArray.ts
// Wrapper class for mod.Array providing a TypeScript-friendly interface

import { random } from "../static/MathUtils";
import { Preserve } from "../decorators";
import type { ModObject } from "./ModObject";
import type { UIWidget } from "../structures";

/**
 * A type-safe wrapper around the mod.Array type, providing familiar array-like operations.
 * Allows iteration, filtering, mapping, and other common array operations on game arrays.
 *
 * @example
 * const players = new GameArray<Player>(mod.AllPlayers());
 * players.forEach(player => console.log(player));
 * const teamAPlayers = players.filter(p => mod.GetTeam(p) === teamA);
 */
const DEBUG_GAME_ARRAY = false;

function debugLog(message: string): void {
    if (DEBUG_GAME_ARRAY) {
        console.log(`[GameArray] ${message}`);
    }
}

/**
 * Supported types for GameArray elements, including mod types and primitive types.
 * This list was tested to ensure compatibility with the mod API.
 * if the type doesn't exist inside this array typically the runtime will throw:
 *     `Exception:TypeError: Cannot convert Object to a MBSupportedType in arg`
 * when trying to add it to a mod.Array.
 */
export type ArraySupportedTypes =
    | ModObject<mod.Object>
    | UIWidget
    // TODO - these objects don't yet have wrapper types
    | mod.Squad
    | mod.DamageType
    | mod.DeathType
    | mod.PortalEnum
    | mod.Message
    | mod.WeaponPackage
    | mod.WeaponUnlock
    | mod.Variable
    | mod.Vector
    | mod.Transform
    // These are the only js primitive types supported
    | string
    | number
    | boolean;

/**
 * A type-safe wrapper around the mod.Array type, providing familiar array-like operations.
 * Allows iteration, filtering, mapping, and other common array operations on game arrays.
 * One limitation of this class is that it enforces a single type T for all elements,
 * so heterogeneous arrays (e.g., containing both Players and Vehicles) are not directly supported.
 * Even though the underlying mod.Array can hold mixed types, this wrapper requires
 * a consistent type T for type safety and ergonomic usage.
 *
 * This also handles transformation of raw mod.Array elements into managed wrapped instances for better usability.
 *
 * @example
 * const players = new GameArray<Player>(mod.AllPlayers());
 * players.forEach(player => console.log(player));
 * const teamAPlayers = players.filter(p => mod.GetTeam(p) === teamA);
 *
 * const newVehicleArray = new GameArray<Vehicle>(); // creates empty array
 *
 * @template T The type of elements in the array, must be one of ArraySupportedTypes.
 *
 */
@Preserve()
export class GameArray<T extends ArraySupportedTypes> {
    private handle: mod.Array;
    private transformer?: (raw: unknown) => T;
    private cache?: T[];

    /**
     * Creates a new GameArray wrapper around a mod.Array handle.
     * @param array The underlying mod.Array to wrap. If not provided, creates an empty array.
     * @param transformer Optional function to transform raw array elements into wrapped instances.
     */
    public constructor(array?: mod.Array, transformer?: (raw: unknown) => T) {
        this.handle = array ?? mod.EmptyArray();
        this.transformer = transformer;
        // Create cache with same length as array if we have a transformer
        if (transformer) {
            const arrayLength = mod.CountOf(this.handle);
            this.cache = new Array(arrayLength);
        } else {
            this.cache = undefined;
        }
        if (DEBUG_GAME_ARRAY) {
            debugLog(
                `Constructed with length: ${mod.CountOf(
                    this.handle
                )}, has transformer: ${!!transformer}`
            );
        }
    }

    /**
     * Gets or creates a transformed element at a specific index, using the cache to avoid redundant transformations.
     * @param index The index in the array
     * @param rawValue The raw value from the mod.Array
     * @returns The transformed value (cached if possible)
     */
    private getOrTransform(index: number, rawValue: unknown): T {
        if (!this.transformer) {
            return rawValue as T;
        }

        // Check cache first
        if (this.cache && this.cache[index] !== undefined) {
            return this.cache[index] as T;
        }

        // Transform and cache
        const transformed = this.transformer(rawValue);
        if (this.cache) {
            this.cache[index] = transformed;
        }
        return transformed;
    }

    /**
     * Gets the underlying mod.Array handle for use with the mod API.
     * @returns The raw mod.Array handle.
     */
    public getHandle(): mod.Array {
        return this.handle;
    }

    /**
     * Makes this GameArray iterable, allowing it to be used in for...of loops.
     * @returns An iterator for this array's elements.
     */
    public [Symbol.iterator](): Iterator<T> {
        let index = 0;
        const length = this.length();
        const handle = this.handle;
        const getOrTransform = (idx: number, raw: T) =>
            this.getOrTransform(idx, raw);

        if (DEBUG_GAME_ARRAY) {
            debugLog(`Iterator created with length: ${length}`);
        }

        return {
            next: (): IteratorResult<T> => {
                if (index < length) {
                    const currentIndex = index;
                    const rawValue = mod.ValueInArray(handle, currentIndex);
                    const value = getOrTransform(currentIndex, rawValue);
                    index = currentIndex + 1;
                    if (DEBUG_GAME_ARRAY) {
                        debugLog(
                            `Yielding index ${currentIndex}, type: ${typeof value}`
                        );
                    }
                    return {
                        value: value,
                        done: false,
                    };
                }
                return {
                    value: undefined as unknown as T,
                    done: true,
                };
            },
        };
    }

    /**
     * Gets the number of elements in this array.
     * @returns The element count.
     */
    public length(): number {
        const count = mod.CountOf(this.handle);
        if (DEBUG_GAME_ARRAY) {
            debugLog(`length() = ${count}`);
        }
        return count;
    }

    /**
     * Checks if this array is empty.
     * @returns True if the array contains no elements.
     */
    public isEmpty(): boolean {
        return this.length() === 0;
    }

    /**
     * Gets the element at a specific index.
     * @param index The index (0-based).
     * @returns The element, or undefined if index is out of bounds.
     */
    public at(index: number): T | undefined {
        if (index < 0 || index >= this.length()) {
            return undefined;
        }
        const rawValue = mod.ValueInArray(this.handle, index);
        return this.getOrTransform(index, rawValue);
    }

    /**
     * Gets the first element in the array.
     * @returns The first element, or undefined if the array is empty.
     */
    public first(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const rawValue = mod.FirstOf(this.handle);
        const value = this.getOrTransform(0, rawValue);
        if (DEBUG_GAME_ARRAY) {
            debugLog(`first() type: ${typeof value}`);
        }
        return value;
    }

    /**
     * Gets the last element in the array.
     * @returns The last element, or undefined if the array is empty.
     */
    public last(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const lastIndex = this.length() - 1;
        const rawValue = mod.LastOf(this.handle);
        return this.getOrTransform(lastIndex, rawValue);
    }

    /**
     * Gets a random element from the array.
     * @returns A random element, or undefined if the array is empty.
     */
    public random(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        // Get a random index first, then use cached transform
        const randomIndex = Math.floor(random(0, this.length() - 1));
        return this.at(randomIndex);
    }

    /**
     * Adds an element to the end of the array.
     * @param value The value to add.
     * @returns This GameArray instance for chaining.
     */
    public push(value: T): GameArray<T> {
        // If the value is a wrapped object with a handle property, unwrap it
        // biome-ignore lint/suspicious/noExplicitAny: Need to check for handle property dynamically
        const rawValue = (value as any)?.handle ?? value;
        this.cache?.push(value);
        this.handle = mod.AppendToArray(this.handle, rawValue);
        return this;
    }

    /**
     * Adds multiple elements to the end of this array.
     * @param values The values to add.
     * @returns This GameArray instance for chaining.
     */
    public pushAll(values: GameArray<T> | T[]): GameArray<T> {
        if (values instanceof GameArray) {
            // Appending a mod.Array will concat the arrays - FIXED: assign result back
            this.handle = mod.AppendToArray(this.handle, values.getHandle());
            this.cache = this.cache?.concat(values.cache ?? []);
        } else {
            for (const value of values) {
                this.push(value);
            }
        }
        return this;
    }

    /**
     * Iterates over all elements in the array, calling a function for each.
     * @param callback Function to call for each element. Receives the element as argument.
     */
    public forEach(callback: (element: T) => void): void {
        const len = this.length();
        for (let i = 0; i < len; i++) {
            const rawValue = mod.ValueInArray(this.handle, i);
            const value = this.getOrTransform(i, rawValue);
            if (DEBUG_GAME_ARRAY) {
                debugLog(`forEach index ${i}, type: ${typeof value}`);
            }
            callback(value);
        }
    }

    /**
     * Returns a new GameArray containing only elements that match the predicate.
     * @param predicate Function that returns true for elements to keep.
     * @returns A new GameArray with filtered elements.
     */
    public filter(predicate: (element: T) => boolean): GameArray<T> {
        const result = new GameArray<T>(undefined, this.transformer);
        const len = this.length();
        for (let i = 0; i < len; i++) {
            const rawValue = mod.ValueInArray(this.handle, i);
            const element = this.getOrTransform(i, rawValue);
            if (predicate(element)) {
                result.push(element);
            }
        }
        return result;
    }

    /**
     * Returns a new GameArray with elements transformed by the callback.
     * @param transform Function that transforms each element.
     * @returns A new GameArray with transformed elements.
     */
    public map<TRtnType extends ArraySupportedTypes>(
        transform: (element: T) => TRtnType
    ): GameArray<TRtnType> {
        const result = new GameArray<TRtnType>();
        const len = this.length();
        for (let i = 0; i < len; i++) {
            const rawValue = mod.ValueInArray(this.handle, i);
            const element = this.getOrTransform(i, rawValue);
            result.push(transform(element));
        }
        return result;
    }

    /**
     * Checks if any element matches the predicate.
     * @param predicate Function to test elements.
     * @returns True if at least one element matches the predicate.
     */
    public any(predicate: (element: T) => boolean): boolean {
        let found = false;
        const len = this.length();
        for (let i = 0; i < len; i++) {
            const rawValue = mod.ValueInArray(this.handle, i);
            const element = this.getOrTransform(i, rawValue);
            if (predicate(element)) {
                found = true;
                break;
            }
        }
        return found;
    }

    /**
     * Checks if all elements match the predicate.
     * @param predicate Function to test elements.
     * @returns True if all elements match the predicate.
     */
    public every(predicate: (element: T) => boolean): boolean {
        let all = true;
        const len = this.length();
        for (let i = 0; i < len; i++) {
            const rawValue = mod.ValueInArray(this.handle, i);
            const element = this.getOrTransform(i, rawValue);
            if (!predicate(element)) {
                all = false;
                break;
            }
        }
        return all;
    }

    /**
     * Finds the first element that matches the predicate.
     * @param predicate Function to test elements.
     * @returns The first matching element, or undefined if none match.
     */
    public find(predicate: (element: T) => boolean): T | undefined {
        const len = this.length();
        for (let i = 0; i < len; i++) {
            const rawValue = mod.ValueInArray(this.handle, i);
            const element = this.getOrTransform(i, rawValue);
            if (predicate(element)) {
                return element;
            }
        }
        return undefined;
    }

    /**
     * Finds the index of the first element that matches the predicate.
     * @param predicate Function to test elements.
     * @returns The index of the first matching element, or -1 if none match.
     */
    public findIndex(predicate: (element: T) => boolean): number {
        const len = this.length();
        for (let i = 0; i < len; i++) {
            const rawValue = mod.ValueInArray(this.handle, i);
            const element = this.getOrTransform(i, rawValue);
            if (predicate(element)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Reduces the array to a single value by applying a function to each element.
     * @param callback Function that accumulates values. Receives accumulator and element.
     * @param initialValue Initial accumulator value.
     * @returns The final accumulated value.
     */
    public reduce<TRtnType>(
        callback: (accumulator: TRtnType, element: T) => TRtnType,
        initialValue: TRtnType
    ): TRtnType {
        let accumulator = initialValue;
        const len = this.length();
        for (let i = 0; i < len; i++) {
            const rawValue = mod.ValueInArray(this.handle, i);
            const element = this.getOrTransform(i, rawValue);
            accumulator = callback(accumulator, element);
        }
        return accumulator;
    }

    /**
     * Converts this GameArray to a regular JavaScript array.
     * @returns A new JavaScript array with the same elements.
     */
    public toArray(): T[] {
        const result: T[] = [];
        const len = this.length();
        for (let i = 0; i < len; i++) {
            const rawValue = mod.ValueInArray(this.handle, i);
            const element = this.getOrTransform(i, rawValue);
            result.push(element);
        }
        return result;
    }

    /**
     * Creates a new GameArray containing elements in a specific range (slice).
     * @param start Start index (inclusive, default 0).
     * @param end End index (exclusive, default length).
     * @returns A new GameArray with the sliced elements.
     */
    public slice(start = 0, end?: number): GameArray<T> {
        const len = this.length();
        const endIdx = end ?? len;

        // Clamp indices to valid range
        const startIdx = Math.max(0, start);
        const finalEndIdx = Math.min(len, endIdx);

        // Use mod.ArraySlice for efficient slicing
        const slicedHandle = mod.ArraySlice(
            this.handle,
            startIdx,
            finalEndIdx - startIdx
        );
        return new GameArray<T>(slicedHandle, this.transformer);
    }

    /**
     * Creates a new GameArray with elements in randomized order.
     * @returns A new GameArray with randomly shuffled elements.
     */
    public asRandomized(): GameArray<T> {
        return new GameArray<T>(
            mod.RandomizedArray(this.handle),
            this.transformer
        );
    }

    /**
     * Creates a new GameArray sorted by a specific index (for structured arrays).
     * @param sortIndex The index to sort by (for compound array types).
     * @returns A new GameArray with sorted elements.
     */
    public asSorted(sortIndex = 0): GameArray<T> {
        return new GameArray<T>(
            mod.SortedArray(this.handle, sortIndex),
            this.transformer
        );
    }

    /**
     * Joins all elements into a string with a separator.
     * @param separator The separator string (default: ",").
     * @returns A string representation of the array elements.
     */
    public join(separator = ","): string {
        return this.toArray()
            .map((elem) => String(elem))
            .join(separator);
    }

    /**
     * Returns a string representation of this array.
     * @returns A string like "[element1, element2, ...]".
     */
    public toString(): string {
        return `[${this.join(", ")}]`;
    }
}
