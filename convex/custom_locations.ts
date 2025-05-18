import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createCustomLocation = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customLocationId = await ctx.db.insert("custom_locations", {
      name: args.name,
      description: args?.description,
    });

    return customLocationId.toString();
  },
});
