import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
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

export const changeTripId = mutation({
  args: {
    id: v.id("users"),
    tripId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      tripId: args.tripId,
    });
  },
});

export const leaveTrip = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const { userId, tripId } = args;

    // Get the trip
    const trip = await ctx.db.get(tripId);
    if (!trip) {
      return {
        success: false,
        message: "Trip not Found",
      };
    }

    // Get the user
    const user = await ctx.db.get(userId);
    if (!user) {
      return {
        success: false,
        message: "User not Found",
      };
    }

    // Check if user is in this trip
    if (user.tripId !== tripId.toString()) {
      return {
        success: false,
        message: "User not in this Trip",
      };
    }

    // Check if user is the admin
    const isAdmin = trip.adminId === userId.toString();

    if (!isAdmin) {
      // Regular user leaving - just remove their tripId
      await ctx.db.patch(userId, { tripId: undefined });
      return { success: true };
    } else {
      // Admin is leaving - need to find a new admin or delete the trip

      // Get all users in this trip
      const tripUsers = await ctx.db
        .query("users")
        .withIndex("by_trip_id", (q) => q.eq("tripId", tripId.toString()))
        .collect();

      // Filter out the current admin
      const otherUsers = tripUsers.filter(
        (u) => u._id.toString() !== userId.toString()
      );

      if (otherUsers.length === 0) {
        // No other users - delete the trip
        await ctx.db.delete(tripId);
        // Remove tripId from the admin
        await ctx.db.patch(userId, { tripId: undefined });
        return { success: true, tripDeleted: true };
      } else {
        // Assign the first other user as the new admin
        const newAdmin = otherUsers[0];
        await ctx.db.patch(tripId, { adminId: newAdmin._id.toString() });
        // Remove tripId from the leaving admin
        await ctx.db.patch(userId, { tripId: undefined });
        return { success: true, newAdminId: newAdmin._id };
      }
    }
  },
});

export const getImageUrl = query({
  args: { storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    if (!args.storageId) {
      return "kg2f6gfmq2vvdbehah7bg1eh497g036z";
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

export const getUsersByTrip = query({
  args: {
    tripId: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_trip_id", (q) => q.eq("tripId", args.tripId))
      .collect();

    return users;
  },
});

export const getUsersWithPhotosByTripId = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_trip_id", (q) => q.eq("tripId", args.tripId))
      .collect();

    const usersWithPhotos = await Promise.all(
      users.map(async (user) => {
        // Cast the storage ID to the proper type
        const photoId = (user.photo as Id<"_storage">) || null;
        let photoUrl = null;

        if (photoId) {
          photoUrl = await ctx.storage.getUrl(photoId);
        } else {
          // For default photo, also use proper typing
          const defaultPhotoId =
            "kg2f6gfmq2vvdbehah7bg1eh497g036z" as Id<"_storage">;
          photoUrl = await ctx.storage.getUrl(defaultPhotoId);
        }

        return {
          ...user,
          photoUrl,
        };
      })
    );

    return usersWithPhotos;
  },
});

export const getUsersWithPhotosByPastTripId = query({
  args: { pastTripId: v.id("past_trips") },
  handler: async (ctx, args) => {
    // Get all user IDs for this past trip from past_trip_users table
    const pastTripUserEntries = await ctx.db
      .query("past_trip_users")
      .withIndex("by_trip_and_user", (q) =>
        q.eq("tripId", args.pastTripId.toString())
      )
      .collect();

    // Extract the userIds
    const userIds = pastTripUserEntries.map((entry) => entry.userId);

    // Get all the user data
    const users = await Promise.all(
      userIds.map(async (userId) => {
        // Since userId is stored as a string, we need to query by field or convert to ID
        return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), userId))
          .unique();
      })
    );

    // Filter out any null values and add photo URLs
    const usersWithPhotos = await Promise.all(
      users
        .filter((user) => user !== null)
        .map(async (user) => {
          // Cast the storage ID to the proper type
          const photoId = (user.photo as Id<"_storage">) || null;
          let photoUrl = null;

          if (photoId) {
            photoUrl = await ctx.storage.getUrl(photoId);
          } else {
            // For default photo, also use proper typing
            const defaultPhotoId =
              "kg2f6gfmq2vvdbehah7bg1eh497g036z" as Id<"_storage">;
            photoUrl = await ctx.storage.getUrl(defaultPhotoId);
          }

          return {
            ...user,
            photoUrl,
          };
        })
    );

    return usersWithPhotos;
  },
});
