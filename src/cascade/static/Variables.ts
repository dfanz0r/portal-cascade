// src/cascade/static/Variables.ts
// Static utility namespace for variable and state management

/**
 * Static utility namespace for managing game variables and state.
 */
export namespace Variables {
    /**
     * Gets the value of a variable.
     * @param variable The variable.
     * @returns The variable's value.
     */
    export function get(variable: mod.Variable): mod.Any {
        return mod.GetVariable(variable);
    }

    /**
     * Sets the value of a variable.
     * @param variable The variable.
     * @param value The new value.
     */
    export function set(variable: mod.Variable, value: mod.Any): void {
        mod.SetVariable(variable, value);
    }

    /**
     * Gets a global variable by index.
     * @param index The variable index.
     * @returns The variable reference.
     */
    export function getGlobal(index: number): mod.Variable {
        return mod.GlobalVariable(index);
    }

    /**
     * Gets an object variable by index.
     * @param obj The object.
     * @param index The variable index.
     * @returns The variable reference.
     */
    export function getObjectVariable(
        obj: mod.Object,
        index: number
    ): mod.Variable {
        return mod.ObjectVariable(obj, index);
    }

    /**
     * Gets a value from an array variable at an index.
     * @param arrayVariable The array variable.
     * @param index The array index.
     * @returns The value at the index.
     */
    export function getArrayValue(
        arrayVariable: mod.Variable,
        index: number
    ): mod.Any {
        return mod.ValueInArray(mod.GetVariable(arrayVariable), index);
    }

    /**
     * Sets a value in an array variable at an index.
     * @param arrayVariable The array variable.
     * @param index The array index.
     * @param value The new value.
     */
    export function setArrayValue(
        arrayVariable: mod.Variable,
        index: number,
        value: mod.Any
    ): void {
        mod.SetVariableAtIndex(arrayVariable, index, value);
    }

    /**
     * Gradually modifies a variable at a specified rate.
     * @param variable The variable.
     * @param limit The target value.
     * @param deltaPerSecond The change per second.
     */
    export function chaseAtRate(
        variable: mod.Variable,
        limit: number,
        deltaPerSecond: number
    ): void {
        mod.ChaseVariableAtRate(variable, limit, deltaPerSecond);
    }

    /**
     * Gradually modifies a variable over time.
     * @param variable The variable.
     * @param limit The target value.
     * @param durationSeconds The duration in seconds.
     */
    export function chaseOverTime(
        variable: mod.Variable,
        limit: number,
        durationSeconds: number
    ): void {
        mod.ChaseVariableOverTime(variable, limit, durationSeconds);
    }

    /**
     * Stops chasing a variable.
     * @param variable The variable.
     */
    export function stopChasing(variable: mod.Variable): void {
        mod.StopChasingVariable(variable);
    }
}
