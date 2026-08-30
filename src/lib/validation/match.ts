import { z } from "zod";

export const goalInputSchema = z.object({
  playerId: z.string().min(1),
  minute: z.number().int().min(0).max(200).optional().nullable(),
  ownGoal: z.boolean().optional(),
});

export const recordResultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  homePenaltyScore: z.number().int().min(0).optional().nullable(),
  awayPenaltyScore: z.number().int().min(0).optional().nullable(),
  goals: z.array(goalInputSchema).optional(),
});

export const updateMatchSchema = z.object({
  scheduledAt: z.string().datetime().optional().nullable(),
  venue: z.string().trim().max(120).optional().nullable(),
  status: z.enum(["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"]).optional(),
});

export const assignRefereeSchema = z.object({
  refereeId: z.string().min(1),
});
