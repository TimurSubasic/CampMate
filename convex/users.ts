import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return await ctx.storage.generateUploadUrl();
});

export const createUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    photo: v.string(),
    clerkId: v.string(),
    tripId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userExisted = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (userExisted) {
      return;
    }

    await ctx.db.insert("users", {
      username: args.username,
      email: args.email,
      photo: args.photo,
      clerkId: args.clerkId,
      tripId: args.tripId,
    });
  },
});

export const getUserByClerk = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return user;
    }

    return user;
  },
});

export const getUserById = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .first();

    if (!user) {
      return user;
    }

    return user;
  },
});

export const changeUsername = mutation({
  args: {
    id: v.id("users"),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      username: args.username,
    });
  },
});

export const changePhoto = mutation({
  args: {
    id: v.id("users"),
    photo: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      photo: args.photo,
    });
  },
});

export const addTrip = mutation({
  args: {
    id: v.id("users"),
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    // querry trips table by join code check if it exists
    // if !trip return
    await ctx.db.patch(args.id, {
      tripId: "", // add the real trip id from queryed trip
    });
  },
});

export const leaveTrip = mutation({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      tripId: "",
    });
  },
});

export const getImageUrl = query({
  args: { storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    if (!args.storageId) {
      return "kg2f6gfmq2vvdbehah7bg1eh497g036z"; // Or a default image URL
    }
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const deletePreviusPhoto = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.storage.delete(args.storageId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      return { success: false, error: String(error) };
    }
  },
});
