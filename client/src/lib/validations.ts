import * as z from "zod";

export const preferencesSchema = z.object({
  totalCapital: z.number().min(0),
  riskPerTradePercent: z.number().min(0).max(100),
  maxOpenTrades: z.number().min(1),
  maxCapitalPerTrade: z.number().min(0),
  timeframe: z.enum(["weekly", "daily"]),
  breakoutLookbackWeeks: z.number().min(1),
  exitLookbackWeeks: z.number().min(1),
  trailTriggerPercent: z.number().min(0),
  trailOffsetPercent: z.number().min(0),
  requireCloseAboveEMA20: z.boolean(),
  emaPeriod: z.number().min(1),
  requireVolumeBreakout: z.boolean(),
  positionSizingType: z.enum(["fixedCapital", "percentCapital", "atrBased"]),
});

export type PreferencesFormValues = z.infer<typeof preferencesSchema>;
