/**
 * Cascade Framework - Decorators
 *
 * Provides metadata decorators for mod configuration and build-time processing.
 */

/**
 * A class decorator that marks a Mod to be automatically plugged in
 * when the game starts.
 *
 * @param options - Optional configuration for auto-plugging.
 * @param options.priority - A higher number means it will be plugged in sooner. Defaults to 0.
 *
 * @example
 * ```typescript
 * @AutoPlug({ priority: 10 })
 * class MyHighPriorityMod implements IMod {
 *   // mod implementation
 * }
 * ```
 */
export function AutoPlug(options?: { priority?: number }) {
    return function (target: any, context: any) {
        // noop decorator
        if (options?.priority) {
            // priority is available for processing
        }
    };
}

/**
 * A class decorator that prevents the bundler's tree-shaking from pruning
 * any of this class's instance methods.
 *
 * This is essential for base classes in the framework (like Vector, UIWidget,
 * Player) whose methods are called on instances at runtime in ways the bundler
 * cannot statically analyze.
 *
 * ## Usage
 *
 * ```typescript
 * import { Preserve } from '@cascade/decorators';
 *
 * @Preserve()
 * export class MyVehicleBase extends Mod implements IMod {
 *     // All instance methods are guaranteed to be preserved
 *     public commonVehicleLogic() { }
 * }
 * ```
 *
 * This is particularly useful for:
 * - Framework base classes (Vector, Player, Vehicle, etc.)
 * - User-defined base classes that multiple mods inherit from
 * - Any class whose methods are called dynamically or through reflection
 *
 * ## How It Works
 *
 * The `@Preserve` decorator acts as a marker for the TypeScript bundler.
 * During bundling, the tree-shaking analysis detects this decorator and
 * skips method pruning for the marked class, ensuring all instance methods
 * are included in the final bundle.
 */
export function Preserve() {
    return function (target: any, context: any) {
        // noop decorator
    };
}

/**
 * A function decorator that marks an exported function as a "Mod Factory".
 *
 * The bundler will identify any function with this decorator and treat its
 * return value as a Mod object for registration with the ModRegistry.
 *
 * This eliminates the ambiguity of name-based heuristics. The decorator is the
 * single source of truth - function names no longer matter.
 *
 * ## Key Benefits
 *
 * - **Unambiguous**: The decorator is the single source of truth
 * - **No False Positives**: Helper functions without the decorator are ignored
 * - **No False Negatives**: Oddly-named factories are correctly identified
 * - **Self-Documenting**: Clear intent in the source code
 *
 * ## Usage
 *
 * Apply the decorator to any exported function that returns a Mod object.
 * The function name can be anything - the decorator is what matters.
 */
export function ModFactory() {
    return function (target: any, context: any) {
        // noop decorator
    };
}
