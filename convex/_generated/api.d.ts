/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as checklists from "../checklists.js";
import type * as custom_locations from "../custom_locations.js";
import type * as http from "../http.js";
import type * as location_animals from "../location_animals.js";
import type * as location_ratings from "../location_ratings.js";
import type * as locations from "../locations.js";
import type * as past_trips from "../past_trips.js";
import type * as preset_checklists from "../preset_checklists.js";
import type * as trips from "../trips.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  checklists: typeof checklists;
  custom_locations: typeof custom_locations;
  http: typeof http;
  location_animals: typeof location_animals;
  location_ratings: typeof location_ratings;
  locations: typeof locations;
  past_trips: typeof past_trips;
  preset_checklists: typeof preset_checklists;
  trips: typeof trips;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
