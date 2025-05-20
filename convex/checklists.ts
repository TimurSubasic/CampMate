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
      return {
        success: false,
        message: "Checklist not found",
      };
    }

    await ctx.db.patch(checklist._id, { items: args.items });
  },
});

export const addItem = mutation({
  args: {
    tripId: v.id("trips"),
    item: v.string(),
  },
  handler: async (ctx, args) => {
    const { tripId, item } = args;

    const checklist = await ctx.db
      .query("checklists")
      .withIndex("by_trip", (q) => q.eq("tripId", tripId))
      .first();

    if (!checklist) {
      return {
        success: false,
        message: "Checklist not found",
      };
    }

    // Check if an item with the same name already exists
    const isDuplicate = checklist.items.some(
      (existingItem) => existingItem.name === item
    );

    if (isDuplicate) {
      return {
        success: false,
        message: "This item is already in the checklist",
      };
    }

    const newItems = [
      ...checklist.items,
      {
        name: item,
        completed: false,
      },
    ];

    await ctx.db.patch(checklist._id, {
      items: newItems,
    });

    return {
      success: true,
      message: "Item added",
    };
  },
});

export const deleteItem = mutation({
  args: {
    tripId: v.id("trips"),
    itemName: v.string(),
  },
  handler: async (ctx, args) => {
    const { tripId, itemName } = args;

    const checklist = await ctx.db
      .query("checklists")
      .withIndex("by_trip", (q) => q.eq("tripId", tripId))
      .first();

    if (!checklist) {
      return {
        success: false,
        message: "Checklist not found",
      };
    }

    // Check if the item exists in the array
    const itemIndex = checklist.items.findIndex(
      (item) => item.name === itemName
    );

    if (itemIndex === -1) {
      return {
        success: false,
        message: "Item not found in the checklist",
      };
    }

    // Create a new array without the item to delete
    const newItems = [
      ...checklist.items.slice(0, itemIndex),
      ...checklist.items.slice(itemIndex + 1),
    ];

    // Update the checklist with the new items array
    await ctx.db.patch(checklist._id, {
      items: newItems,
    });

    return {
      success: true,
      message: "Item deleted successfully",
    };
  },
});
