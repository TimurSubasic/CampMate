import { v } from "convex/values";
import { query } from "./_generated/server";

export const getTripById = query({
  args: {
    id: v.id("past_trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query("past_trips")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .unique();

    return trip;
  },
});
