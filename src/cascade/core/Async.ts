// src/cascade/core/Async.ts
// Async utility functions for asynchronous operations

/**
 * Waits for the specified number of seconds.
 * @param seconds Number of seconds to wait.
 * @returns A promise that resolves after the wait.
 */
export async function wait(seconds: number): Promise<void> {
    await mod.Wait(seconds);
}
