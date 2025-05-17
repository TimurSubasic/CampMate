import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.string(),
    photo: v.string(),
    clerkId: v.string(),
    tripId: v.optional(v.string()),
    //notification preferences
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_trip_id", ["tripId"]),

  trips: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    adminId: v.string(),
    locationId: v.optional(v.string()),
    difficulty: v.number(),
    joinCode: v.string(),
  })
    .index("by_admin", ["adminId"])
    .index("by_code", ["joinCode"]),

  past_trips: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    locationId: v.optional(v.string()),
    difficulty: v.number(),
    users: v.array(v.string()),
    photos: v.optional(v.array(v.string())),
  }),

  past_trip_users: defineTable({
    tripId: v.string(),
    userId: v.string(),
  })
    .index("by_trip_and_user", ["tripId", "userId"])
    .index("by_user", ["userId"]),

  locations: defineTable({
    name: v.string(),
    longitude: v.number(),
    latitude: v.number(),
    description: v.string(),
    difficulty: v.number(),
    photos: v.array(v.string()), // URLs
  })
    .index("by_difficulty", ["difficulty"])
    .index("by_name", ["name"]),

  animals: defineTable({
    name: v.string(),
    photo: v.string(),
    description: v.optional(v.string()),
  }),

  plants: defineTable({
    name: v.string(),
    photo: v.string(),
    description: v.optional(v.string()),
  }),

  location_animals: defineTable({
    locationId: v.string(),
    animalId: v.string(),
  }).index("by_location", ["locationId"]),

  location_plants: defineTable({
    locationId: v.string(),
    plantId: v.string(),
  }).index("by_location", ["locationId"]),

  tutorials: defineTable({
    title: v.string(),
    content: v.array(
      v.object({
        isText: v.boolean(), // map them one by one text then image
        value: v.string(),
      })
    ),
  }),

  checklists: defineTable({
    tripId: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        completed: v.boolean(),
      })
    ),
    difficulty: v.optional(v.number()),
  })
    .index("by_trip", ["tripId"])
    .index("by_difficulty", ["difficulty"]),
});
