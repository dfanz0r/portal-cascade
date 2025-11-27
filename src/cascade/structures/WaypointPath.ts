// src/cascade/structures/WaypointPath.ts
// WaypointPath wrapper class that extends ModObject.

import { ModObject } from '../core/ModObject';

/**
 * Wrapper class for WaypointPath objects, providing ergonomic access to waypoint path operations.
 * WaypointPath does not currently have additional functionality through the API.
 * This is here to represent an object which has been created in the spacial editor.
 */
export class WaypointPath extends ModObject<mod.WaypointPath> {}
