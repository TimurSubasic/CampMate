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
    isCustom: v.boolean(),
    joinCode: v.string(),
  })
    .index("by_admin", ["adminId"])
    .index("by_code", ["joinCode"]),

  past_trips: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    locationId: v.optional(v.string()),
    isCustom: v.boolean(),
    photos: v.optional(v.array(v.string())),
  }),

  past_trip_users: defineTable({
    tripId: v.string(),
    userId: v.string(),
  })
    .index("by_trip", ["tripId"])
    .index("by_user", ["userId"])
    .index("by_trip_and_user", ["tripId", "userId"]),

  locations: defineTable({
    name: v.string(),
    longitude: v.number(),
    latitude: v.number(),
    description: v.string(),
    photo: v.string(), // URL
  })
    .index("by_name", ["name"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  custom_locations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }),

  animals: defineTable({
    name: v.string(),
    photo: v.string(),
    description: v.string(),
  }),

  plants: defineTable({
    name: v.string(),
    photo: v.string(),
    description: v.string(),
  }),

  location_animals: defineTable({
    locationId: v.string(),
    animalId: v.array(v.string()),
  }).index("by_location", ["locationId"]),

  location_plants: defineTable({
    locationId: v.string(),
    plantId: v.array(v.string()),
  }).index("by_location", ["locationId"]),

  tutorials: defineTable({
    title: v.string(),
    type: v.string(),
    content: v.array(
      v.object({
        text: v.string(), // map them one by one text then image
        photo: v.string(),
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
  }).index("by_trip", ["tripId"]),

  preset_cheklists: defineTable({
    name: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        completed: v.boolean(),
      })
    ),
  }),
});
