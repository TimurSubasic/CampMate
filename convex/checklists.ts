import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByTrip = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const checkilst = await ctx.db
      .query("checklists")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .first();

    if (!checkilst) {
      return null;
    }

    return checkilst.items;
  },
});

export const updateChecklistItems = mutation({
  args: {
    tripId: v.id("trips"),
    items: v.array(
      v.object({
        name: v.string(),
        completed: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const checklist = await ctx.db
      .query("checklists")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .first();

    if (!checklist) {
      throw new Error("Checklist not found");
    }

    await ctx.db.patch(checklist._id, { items: args.items });
  },
});
