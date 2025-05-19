import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const getFive = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db.query("locations").take(5);

    return locations;
  },
});

export const searchByName = query({
  args: {
    searchText: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchText.trim()) {
      return [];
    }

    // Use the search index for more flexible text search
    const locations = await ctx.db
      .query("locations")
      .withSearchIndex("search_name", (q) => q.search("name", args.searchText))
      .take(5);

    return locations;
  },
});

export const getFiveWithPhoto = query({
  handler: async (ctx) => {
    // Fetch 5 locations from the database
    const locations = await ctx.db.query("locations").take(5);

    // For each location, convert the image storage ID to a URL
    return Promise.all(
      locations.map(async (location) => ({
        ...location,
        // Assuming the storage ID is stored in a field called "imageId"
        imageUrl: await ctx.storage.getUrl(location.photo as Id<"_storage">),
      }))
    );
  },
});

export const searchByNameWithPhoto = query({
  args: {
    searchText: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchText.trim()) {
      return [];
    }

    // Use the search index for more flexible text search
    const locations = await ctx.db
      .query("locations")
      .withSearchIndex("search_name", (q) => q.search("name", args.searchText))
      .take(5);

    return Promise.all(
      locations.map(async (location) => ({
        ...location,
        // Assuming the storage ID is stored in a field called "imageId"
        imageUrl: await ctx.storage.getUrl(location.photo as Id<"_storage">),
      }))
    );
  },
});
