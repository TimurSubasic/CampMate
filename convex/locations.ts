import { v } from "convex/values";
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
