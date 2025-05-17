import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Trip mutations and queries
export const createTrip = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    adminId: v.string(),
    locationId: v.optional(v.string()),
    difficulty: v.number(),
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trips", args);
  },
});

export const getTripByJoinCode = query({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trips")
      .withIndex("by_code", (q) => q.eq("joinCode", args.joinCode))
      .unique();
  },
});

export const getTripById = query({
  args: { id: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTripByAdmin = query({
  args: { adminId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trips")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .collect();
  },
});

// Past trips mutations and queries
export const createPastTrip = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    locationId: v.optional(v.string()),
    difficulty: v.number(),
    users: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const tripId = await ctx.db.insert("past_trips", {
      ...args,
      photos: [],
    });

    // Create relations in past_trip_users
    for (const userId of args.users) {
      await ctx.db.insert("past_trip_users", {
        tripId,
        userId,
      });
    }

    return tripId;
  },
});

export const addPhotoToPastTrip = mutation({
  args: {
    tripId: v.id("past_trips"),
    photoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");

    const photos = trip.photos || [];
    await ctx.db.patch(args.tripId, {
      photos: [...photos, args.photoUrl],
    });
  },
});

export const getPastTripById = query({
  args: { id: v.id("past_trips") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPastTripUsers = query({
  args: { tripId: v.id("past_trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    return trip?.users || [];
  },
});

export const deletePastTrip = mutation({
  args: {
    tripId: v.id("past_trips"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");

    // Remove user from trip's users array
    const updatedUsers = trip.users.filter((id) => id !== args.userId);
    await ctx.db.patch(args.tripId, { users: updatedUsers });

    // Delete relation from past_trip_users
    const relation = await ctx.db
      .query("past_trip_users")
      .withIndex("by_trip_and_user", (q) =>
        q.eq("tripId", args.tripId).eq("userId", args.userId)
      )
      .unique();

    if (relation) {
      await ctx.db.delete(relation._id);
    }
  },
});

// Past trip users queries
export const getUserPastTrips = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const relations = await ctx.db
      .query("past_trip_users")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return relations.map((relation) => relation.tripId);
  },
});
