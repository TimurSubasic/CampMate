import { v } from "convex/values";
import { query } from "./_generated/server";

export const getAllChecklists = query({
  args: {},
  handler: async (ctx) => {
    const checklists = await ctx.db.query("preset_cheklists").collect();
    return checklists;
  },
});

export const getById = query({
  args: {
    id: v.id("preset_cheklists"),
  },
  handler: async (ctx, args) => {
    const checklist = await ctx.db.get(args.id);

    return checklist;
  },
});
