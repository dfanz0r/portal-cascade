/**
 * Runtime validation utilities for mod data
 *
 * Provides validation functions and error handling for mod.Message and mod.strings
 * to give developers actionable feedback when data is malformed.
 */

/**
 * Custom error class for validation failures
 * Provides clear, actionable error messages for mod developers
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

/**
 * Validates mod.Message data structure
 *
 * @param data The data to validate
 * @param context Optional context string for error messages (e.g., "mod.Message")
 * @throws ValidationError if data is invalid
 */
export function validateMessageData(
    data: unknown,
    context = "mod.Message"
): void {
    if (data === null || data === undefined) {
        throw new ValidationError(
            `${context} is null or undefined. Expected an object.`
        );
    }

    if (typeof data !== "object") {
        throw new ValidationError(
            `${context} must be an object, got ${typeof data}.`
        );
    }

    const messageObj = data as Record<string, unknown>;

    // Check required fields
    if (typeof messageObj.id !== "string" || messageObj.id.length === 0) {
        throw new ValidationError(
            `${context}.id must be a non-empty string, got ${typeof messageObj.id}.`
        );
    }

    // Icon should be a string or number if present
    if (
        messageObj.icon !== undefined &&
        typeof messageObj.icon !== "string" &&
        typeof messageObj.icon !== "number"
    ) {
        throw new ValidationError(
            `${context}.icon must be a string or number if provided, got ${typeof messageObj.icon}.`
        );
    }

    // Text should be a string if present
    if (messageObj.text !== undefined && typeof messageObj.text !== "string") {
        throw new ValidationError(
            `${context}.text must be a string if provided, got ${typeof messageObj.text}.`
        );
    }
}

/**
 * Validates mod.strings data structure
 *
 * @param data The data to validate
 * @param context Optional context string for error messages (e.g., "mod.strings")
 * @throws ValidationError if data is invalid
 */
export function validateStringsData(
    data: unknown,
    context = "mod.strings"
): void {
    if (data === null || data === undefined) {
        throw new ValidationError(
            `${context} is null or undefined. Expected an object.`
        );
    }

    if (typeof data !== "object") {
        throw new ValidationError(
            `${context} must be an object, got ${typeof data}.`
        );
    }

    const stringsObj = data as Record<string, unknown>;
    let keyCount = 0;

    for (const [key, value] of Object.entries(stringsObj)) {
        keyCount++;

        // Keys should be non-empty strings (this is enforced by JS object keys)
        if (typeof key !== "string" || key.length === 0) {
            throw new ValidationError(
                `${context} key must be a non-empty string, got '${key}'.`
            );
        }

        // Values must be strings
        if (typeof value !== "string") {
            throw new ValidationError(
                `${context}['${key}'] must be a string, got ${typeof value}. Value: ${String(
                    value
                )}`
            );
        }

        // String values should not be empty (warning level, but we'll enforce)
        if (value.length === 0) {
            throw new ValidationError(
                `${context}['${key}'] is an empty string. Expected a non-empty string.`
            );
        }
    }

    // If data is an object but has no keys, it might be intentional but suspicious
    if (keyCount === 0) {
        console.warn(`[Validation] ${context} is an empty object.`);
    }
}

/**
 * Batch validate all mod data
 *
 * @param mod The mod instance to validate
 * @param modName The name of the mod for error messages
 * @throws ValidationError if any data is invalid
 */
export function validateModData(mod: unknown, modName: string): void {
    if (!mod || typeof mod !== "object") {
        throw new ValidationError(
            `Mod '${modName}' is not a valid object. Got ${typeof mod}.`
        );
    }

    const modObj = mod as Record<string, unknown>;

    // Validate mod.Message if present
    if (modObj.Message !== undefined) {
        try {
            validateMessageData(modObj.Message, `Mod '${modName}'.Message`);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError(
                `Unexpected error validating '${modName}'.Message: ${String(
                    error
                )}`
            );
        }
    }

    // Validate mod.strings if present
    if (modObj.strings !== undefined) {
        try {
            validateStringsData(modObj.strings, `Mod '${modName}'.strings`);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError(
                `Unexpected error validating '${modName}'.strings: ${String(
                    error
                )}`
            );
        }
    }
}
