import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

function generateJoinCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const createTrip = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    locationId: v.optional(v.string()),
    isCustom: v.boolean(),
  },
  handler: async (ctx, args) => {
    let joinCode;
    let existing;

    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }
    const subject = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", subject))
      .unique();

    if (!user) {
      return {
        success: false,
        message: "No user",
      };
    }

    // Try max 10 times to find a unique code
    for (let i = 0; i < 10; i++) {
      const code = generateJoinCode().toUpperCase();
      existing = await ctx.db
        .query("trips")
        .filter((q) => q.eq(q.field("joinCode"), code))
        .first();

      if (!existing) {
        joinCode = code;
        break;
      }
    }

    if (!joinCode) {
      return {
        success: false,
        message: "Join code failed to generate",
      };
    }

    //generate trip
    const tripId = await ctx.db.insert("trips", {
      name: args.name,
      description: args?.description,
      adminId: user._id,
      locationId: args?.locationId,
      isCustom: args.isCustom,
      joinCode: joinCode,
    });

    await ctx.db.patch(user._id, {
      tripId: tripId,
    });
  },
});

export const getByCode = query({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query("trips")
      .withIndex("by_code", (q) =>
        q.eq("joinCode", args.joinCode.toUpperCase())
      )
      .first();

    return trip || null;
  },
});

export const getTripById = query({
  args: {
    id: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query("trips")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .unique();

    return trip;
  },
});

export const getTripWithLocation = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    // Get the trip
    const trip = await ctx.db.get(args.tripId);

    if (!trip) {
      return null;
    }

    // Determine which table to query based on isCustom flag
    let location = null;
    if (trip.isCustom) {
      // Query the custom_locations table
      location = await ctx.db.get(trip.locationId as Id<"custom_locations">);
    } else {
      // Query the locations table
      location = await ctx.db.get(trip.locationId as Id<"locations">);
    }

    // Return trip with location data
    return {
      ...trip,
      location,
    };
  },
});

export const completeTrip = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const { tripId } = args;

    // Get the trip
    const trip = await ctx.db.get(tripId);
    if (!trip) {
      return {
        success: false,
        message: "Trip not found",
      };
    }

    // Get all users in this trip
    const tripUsers = await ctx.db
      .query("users")
      .withIndex("by_trip_id", (q) => q.eq("tripId", tripId.toString()))
      .collect();

    // Create a new past trip
    const pastTripId = await ctx.db.insert("past_trips", {
      name: trip.name,
      description: trip.description,
      locationId: trip.locationId,
      isCustom: trip.isCustom,
      photos: [], // Initially no photos
    });

    // Create entries in past_trip_users for each user
    for (const user of tripUsers) {
      await ctx.db.insert("past_trip_users", {
        tripId: pastTripId.toString(),
        userId: user._id.toString(),
      });

      // Update user to remove tripId
      await ctx.db.patch(user._id, { tripId: undefined });
    }

    // Delete the original trip
    await ctx.db.delete(tripId);

    return { success: true, pastTripId };
  },
});
