import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import {
  Save,
  RotateCcw,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
} from "lucide-react";
import {
  fetchPreferences,
  updatePreferences,
  resetStatus,
  type Preferences,
} from "../features/preferencesSlice";

// Schema remains the same for logic integrity
const schema = z.object({
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

export default function TradingPreferencesPage() {
  const dispatch = useDispatch<any>();
  const { data, loading, success } = useSelector(
    (state: any) => state.preferences,
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Preferences>({
    resolver: zodResolver(schema),
    defaultValues: data || {},
  });

  const requireEMA = watch("requireCloseAboveEMA20");

  useEffect(() => {
    dispatch(fetchPreferences());
  }, [dispatch]);
  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const onSubmit = (values: Preferences) => dispatch(updatePreferences(values));

  // Consistent input styling using your theme variables
  const inputClass =
    "w-full bg-background border border-input text-foreground rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none transition-all";
  const labelClass = "block text-sm font-medium text-muted-foreground mb-1.5";

  if (loading && !data)
    return (
      <div className="p-10 text-center text-primary animate-pulse font-sans">
        Loading preferences...
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Trading Preferences
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure your risk parameters and Pulse Breaker strategy.
            </p>
          </div>
          {data?.updatedAt && (
            <div className="px-3 py-1 bg-muted rounded-full text-[10px] text-muted-foreground uppercase tracking-wider font-bold border border-border self-start md:self-center">
              Last Synced: {new Date(data.updatedAt).toLocaleTimeString()}
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Capital & Risk (uses var(--card)) */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <ShieldCheck className="text-primary" size={20} />
              <h2 className="font-semibold text-lg">
                Capital & Risk Management
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>Total Capital</label>
                <input
                  type="number"
                  {...register("totalCapital", { valueAsNumber: true })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Risk Per Trade (%)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register("riskPerTradePercent", { valueAsNumber: true })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Open Trades</label>
                <input
                  type="number"
                  {...register("maxOpenTrades", { valueAsNumber: true })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Cap. Per Trade</label>
                <input
                  type="number"
                  {...register("maxCapitalPerTrade", { valueAsNumber: true })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Strategy Rules */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Zap className="text-primary" size={20} />
              <h2 className="font-semibold text-lg">Pulse Breaker Strategy</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className={labelClass}>Timeframe</label>
                <select {...register("timeframe")} className={inputClass}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Breakout Lookback (Wks)</label>
                <input
                  type="number"
                  {...register("breakoutLookbackWeeks", {
                    valueAsNumber: true,
                  })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Trail Trigger (%)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register("trailTriggerPercent", { valueAsNumber: true })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Filters & Position Sizing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="text-primary" size={20} />
                <h2 className="font-semibold text-lg">Technical Filters</h2>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg">
                  <span className="text-sm font-medium">
                    Require EMA20 Close
                  </span>
                  <input
                    type="checkbox"
                    {...register("requireCloseAboveEMA20")}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </div>

                <div>
                  <label className={labelClass}>EMA Period</label>
                  <input
                    type="number"
                    disabled={!requireEMA}
                    {...register("emaPeriod", { valueAsNumber: true })}
                    className={`${inputClass} ${!requireEMA ? "opacity-50 cursor-not-allowed bg-muted" : ""}`}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg">
                  <span className="text-sm font-medium">
                    Volume Breakout Filter
                  </span>
                  <input
                    type="checkbox"
                    {...register("requireVolumeBreakout")}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border p-6 flex flex-col">
              <h2 className="font-semibold text-lg mb-6">Position Sizing</h2>
              <div className="flex-1">
                <label className={labelClass}>Sizing Model</label>
                <select
                  {...register("positionSizingType")}
                  className={inputClass}
                >
                  <option value="fixedCapital">Fixed Capital</option>
                  <option value="percentCapital">Percent of Capital</option>
                  <option value="atrBased">ATR Based</option>
                </select>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  Choose how the system calculates your quantity per trade.
                  <b> ATR Based</b> is recommended for high volatility stocks.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-8 py-3 rounded-md font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Processing..." : "Save Settings"}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-muted px-8 py-3 rounded-md font-bold border border-border transition-all"
            >
              <RotateCcw size={18} />
              Reset Changes
            </button>

            {success && (
              <span className="text-green-500 font-medium text-sm flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                Settings saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
