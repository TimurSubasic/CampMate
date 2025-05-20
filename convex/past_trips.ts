import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

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

export const getTripsByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get all past_trip_users entries for this user
    const pastTripUserEntries = await ctx.db
      .query("past_trip_users")
      .withIndex("by_user", (q) => q.eq("userId", userId.toString()))
      .collect();

    // Extract the tripIds
    const pastTripIds = pastTripUserEntries.map((entry) => entry.tripId);

    // Get all the past trips data
    const pastTrips = await Promise.all(
      pastTripIds.map(async (tripId) => {
        // Since tripId is stored as a string, we need to query by field
        return await ctx.db
          .query("past_trips")
          .filter((q) => q.eq(q.field("_id"), tripId))
          .unique();
      })
    );

    // Filter out any null values (in case a trip was deleted)
    return pastTrips.filter((trip) => trip !== null);
  },
});

export const getTripWithLocation = query({
  args: {
    tripId: v.id("past_trips"),
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

export const getPastTripPhotos = query({
  args: {
    pastTripId: v.id("past_trips"),
  },
  handler: async (ctx, args) => {
    // Get the past trip
    const pastTrip = await ctx.db.get(args.pastTripId);
    if (!pastTrip) {
      return null;
    }

    // If no photos, return empty array
    if (!pastTrip.photos || pastTrip.photos.length === 0) {
      return [];
    }

    // Get URLs for all photos
    const photoUrls = await Promise.all(
      pastTrip.photos.map(async (photoId) => {
        // Cast the storage ID to the proper type
        const storageId = photoId as Id<"_storage">;
        try {
          const url = await ctx.storage.getUrl(storageId);
          return {
            storageId: photoId,
            url,
          };
        } catch (error) {
          // Handle case where photo might not exist
          console.error(`Error getting URL for photo ${photoId}:`, error);
          return null;
        }
      })
    );

    // Filter out any null values (in case of errors)
    return photoUrls.filter((photo) => photo !== null);
  },
});

export const addPhoto = mutation({
  args: {
    pastTripId: v.id("past_trips"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const { pastTripId, storageId } = args;

    // Get the past trip
    const pastTrip = await ctx.db.get(pastTripId);
    if (!pastTrip) {
      return {
        success: false,
        message: "No trip found",
      };
    }

    // Get current photos array or initialize empty array if it doesn't exist
    const currentPhotos = pastTrip.photos || [];

    // Add the new photo ID to the array
    const updatedPhotos = [...currentPhotos, storageId.toString()];

    // Update the past trip with the new photos array
    await ctx.db.patch(pastTripId, {
      photos: updatedPhotos,
    });

    return { success: true };
  },
});

export const deletePhoto = mutation({
  args: {
    storageId: v.id("_storage"),
    pastTripId: v.id("past_trips"),
  },
  handler: async (ctx, args) => {
    try {
      // Delete the file from storage
      await ctx.storage.delete(args.storageId);

      // Get the past trip
      const pastTrip = await ctx.db.get(args.pastTripId);
      if (!pastTrip || !pastTrip.photos) {
        return {
          success: false,
          error: "Past trip not found or has no photos",
        };
      }

      // Remove the storage ID from the photos array
      const updatedPhotos = pastTrip.photos.filter(
        (photoId) => photoId !== args.storageId.toString()
      );

      // Update the past trip with the new photos array
      await ctx.db.patch(args.pastTripId, {
        photos: updatedPhotos,
      });

      return { success: true };
    } catch (error) {
      console.log("Error deleting file:", error);
      return { success: false, error: String(error) };
    }
  },
});

export const leaveTrip = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("past_trips"),
  },
  handler: async (ctx, args) => {
    const { tripId, userId } = args;
    const pastTripUser = await ctx.db
      .query("past_trip_users")
      .withIndex("by_trip_and_user", (q) =>
        q.eq("tripId", tripId).eq("userId", userId)
      )
      .first();

    if (!pastTripUser) {
      return {
        success: false,
        message: "No trip and user found",
      };
    }

    await ctx.db.delete(pastTripUser._id);

    const trip = await ctx.db
      .query("past_trip_users")
      .withIndex("by_trip", (q) => q.eq("tripId", tripId))
      .first();

    if (!trip) {
      // there is no more users with this tripId

      // delete the past_trip with this tripId
      const pastTrip = await ctx.db.get(tripId);

      // delete all photos from the file storage
      if (pastTrip?.photos) {
        for (const photoId of pastTrip.photos) {
          await ctx.storage.delete(photoId as Id<"_storage">);
        }
      }

      // Finally delete the trip itself
      await ctx.db.delete(tripId);
    }

    return {
      success: true,
      message: "Trip association removed successfully",
    };
  },
});
