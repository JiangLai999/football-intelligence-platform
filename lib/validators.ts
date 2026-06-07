import { z } from "zod";

export const competitionSchema = z.object({
  name: z.string().min(1),
  country: z.string().nullable().optional(),
  type: z.enum(["LEAGUE", "CUP", "INTERNATIONAL", "FRIENDLY"])
});

export const matchPredictionSchema = z.object({
  matchId: z.string().min(1),
  homeWinProbability: z.number().min(0).max(1),
  drawProbability: z.number().min(0).max(1),
  awayWinProbability: z.number().min(0).max(1),
  recommendedScoreline: z.string().min(3),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(10)
});
