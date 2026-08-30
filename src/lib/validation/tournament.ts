import { z } from "zod";

export const createTournamentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  format: z.enum(["LEAGUE", "KNOCKOUT"]),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  pointsWin: z.number().int().min(0).max(10).optional(),
  pointsDraw: z.number().int().min(0).max(10).optional(),
  pointsLoss: z.number().int().min(0).max(10).optional(),
});

export const updateTournamentSchema = createTournamentSchema.partial().extend({
  status: z.enum(["DRAFT", "ONGOING", "COMPLETED"]).optional(),
});

export const registerTeamSchema = z.object({
  teamId: z.string().min(1),
  seed: z.number().int().min(1).optional(),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
