import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

// Location queries
export const getLocationByDifficulty = query({
  args: { difficulty: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
  },
});

export const getLocationById = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getLocationByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .collect();
  },
});

// Animal and Plant queries
export const getAnimalById = query({
  args: { id: v.id("animals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPlantById = query({
  args: { id: v.id("plants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Location relationships queries
export const getAnimalsByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const relations = await ctx.db
      .query("location_animals")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .collect();

    const animals = await Promise.all(
      relations.map((relation) =>
        ctx.db.get(relation.animalId as Id<"animals">)
      )
    );

    return animals.filter(
      (animal): animal is NonNullable<typeof animal> => animal !== null
    );
  },
});

export const getPlantsByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const relations = await ctx.db
      .query("location_plants")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .collect();

    const plants = await Promise.all(
      relations.map((relation) => ctx.db.get(relation.plantId as Id<"plants">))
    );

    return plants.filter(
      (plant): plant is NonNullable<typeof plant> => plant !== null
    );
  },
});
