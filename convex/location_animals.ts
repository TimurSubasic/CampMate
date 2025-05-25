import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

// Get all animals for a specific location
export const getAnimalsByLocation = query({
  args: { locationId: v.string() },
  handler: async (ctx, args) => {
    const locationAnimals = await ctx.db
      .query("location_animals")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .first();

    if (!locationAnimals) return [];

    const animals = await Promise.all(
      locationAnimals.animalId.map(async (animalId) => {
        const animal = await ctx.db.get(animalId as Id<"animals">);
        if (!animal) return null;

        // Get the photo URL from storage
        const photoUrl = await ctx.storage.getUrl(
          animal.photo as Id<"_storage">
        );

        return {
          ...animal,
          photo: photoUrl,
        };
      })
    );

    return animals.filter(
      (animal): animal is NonNullable<typeof animal> => animal !== null
    );
  },
});
