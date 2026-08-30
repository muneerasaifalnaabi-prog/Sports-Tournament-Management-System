import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(80),
  shortName: z.string().trim().max(10).optional(),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const updateTeamSchema = createTeamSchema.partial();

export const createPlayerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  jerseyNo: z.number().int().min(0).max(999).optional().nullable(),
  position: z.string().trim().max(40).optional().nullable(),
});

export const updatePlayerSchema = createPlayerSchema.partial();
