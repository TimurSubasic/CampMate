import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// Get all ratings for a location
export const getRatingsByLocation = query({
  args: { locationId: v.string() },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("location_ratings")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .collect();

    // Get user details for each rating
    const ratingsWithUsers = await Promise.all(
      ratings.map(async (rating) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", rating.userId))
          .first();
        return {
          ...rating,
          username: user?.username || "Anonymous",
          userPhoto: user?.photo,
        };
      })
    );

    return ratingsWithUsers;
  },
});

// Add or update a rating
export const rateLocation = mutation({
  args: {
    locationId: v.string(),
    userId: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user has already rated this location
    const existingRating = await ctx.db
      .query("location_ratings")
      .withIndex("by_location_and_user", (q) =>
        q.eq("locationId", args.locationId).eq("userId", args.userId)
      )
      .first();

    if (existingRating) {
      // Update existing rating
      await ctx.db.patch(existingRating._id, {
        rating: args.rating,
        comment: args.comment,
      });
    } else {
      // Create new rating
      await ctx.db.insert("location_ratings", {
        locationId: args.locationId,
        userId: args.userId,
        rating: args.rating,
        comment: args.comment,
      });
    }

    // Update location's average rating
    const allRatings = await ctx.db
      .query("location_ratings")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .collect();

    const totalRatings = allRatings.length;
    const averageRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await ctx.db.patch(args.locationId as Id<"locations">, {
      averageRating,
      totalRatings,
    });

    return { success: true };
  },
});

// Get user's rating for a location
export const getUserRating = query({
  args: {
    locationId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const rating = await ctx.db
      .query("location_ratings")
      .withIndex("by_location_and_user", (q) =>
        q.eq("locationId", args.locationId).eq("userId", args.userId)
      )
      .first();

    return rating;
  },
});

// Delete a rating
export const deleteRating = mutation({
  args: {
    ratingId: v.string(),
  },
  handler: async (ctx, args) => {
    const rating = await ctx.db.get(args.ratingId as Id<"location_ratings">);
    if (!rating) return;

    // Delete the rating
    await ctx.db.delete(args.ratingId as Id<"location_ratings">);

    // Update location's average rating
    const allRatings = await ctx.db
      .query("location_ratings")
      .withIndex("by_location", (q) => q.eq("locationId", rating.locationId))
      .collect();

    const totalRatings = allRatings.length;
    const averageRating =
      totalRatings > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    await ctx.db.patch(rating.locationId as Id<"locations">, {
      averageRating,
      totalRatings,
    });

    return { success: true };
  },
});
