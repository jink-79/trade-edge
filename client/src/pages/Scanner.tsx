// src/pages/Scanner.tsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import {
  fetchWeeklyScannerResults,
  type ScannerStock,
  type WeeklyScannerResult,
} from "../features/scannerSlice";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

import {
  RefreshCw,
  CalendarDays,
  Search,
  TrendingUp,
  Database,
  BarChart2,
  AlertCircle,
  Activity,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Safely convert a week value (possibly null) to a stable string key
const toKey = (week: string | null): string => week ?? "__null__";

function formatWeekLabel(week: string | null): string {
  if (!week) return "Current Week";
  try {
    return new Date(week).toDateString();
  } catch {
    return week;
  }
}

function VolumeRatioBadge({ volume, avg }: { volume: number; avg: number }) {
  if (!avg || avg === 0) return null;
  const ratio = volume / avg;
  const color =
    ratio >= 2
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : ratio >= 1.2
        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
        : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${color}`}
    >
      {ratio.toFixed(1)}x
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Scanner() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, data, latestWeek, message, lastUpdatedAt } =
    useSelector((state: RootState) => state.scanner);

  console.log(data);

  // undefined = nothing selected yet; string = a stable week key is active
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchWeeklyScannerResults());
  }, [dispatch]);

  // Auto-select first week when data loads
  useEffect(() => {
    if (selectedKey === undefined && data.length > 0) {
      setSelectedKey(toKey(data[0].week));
    }
  }, [data, selectedKey]);

  // Reset search when selected week changes
  useEffect(() => {
    setSearch("");
  }, [selectedKey]);

  const selectedWeekData = useMemo<WeeklyScannerResult | null>(() => {
    if (selectedKey === undefined) return null;
    return data.find((w) => toKey(w.week) === selectedKey) ?? null;
  }, [data, selectedKey]);

  const filteredStocks = useMemo<ScannerStock[]>(() => {
    if (!selectedWeekData) return [];
    if (!search.trim()) return selectedWeekData.stocks;
    return selectedWeekData.stocks.filter((s) =>
      s.symbol.toLowerCase().includes(search.toLowerCase()),
    );
  }, [selectedWeekData, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Weekly Scanner
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stocks matching your entry conditions — weekly scan
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdatedAt && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Database className="h-3.5 w-3.5" />
                <span>
                  Updated:{" "}
                  {new Date(lastUpdatedAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <Button
              onClick={() => dispatch(fetchWeeklyScannerResults())}
              disabled={loading}
              size="sm"
              className="gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Message banner ── */}
        {message && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground">
            <TrendingUp className="h-4 w-4 text-primary shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Week sidebar ── */}
          <div className="lg:col-span-3">
            <Card className="rounded-xl shadow-sm sticky top-[73px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Scan Weeks
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select a week to view results
                </p>
              </CardHeader>

              <CardContent className="space-y-1.5 pt-0">
                {/* Loading skeletons */}
                {loading && data.length === 0 && (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-lg" />
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!loading && data.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No scan results yet.
                  </p>
                )}

                {/* Week list */}
                {data.map((week, idx) => {
                  const key = toKey(week.week);
                  const isActive = key === selectedKey;
                  const isLatest = idx === 0;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedKey(key)}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm transition-all duration-150 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-xs">
                            {formatWeekLabel(week.week)}
                          </span>
                          {isLatest && (
                            <span
                              className={`text-[9px] px-1 py-0.5 rounded font-semibold ${
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              NEW
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] ${
                            isActive
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {week.week ?? "Week date unavailable"}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {week.count}
                      </span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* ── Stocks table ── */}
          <div className="lg:col-span-9">
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <BarChart2 className="h-4 w-4 text-primary" />
                      Qualified Stocks
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Week:{" "}
                      <span className="font-medium text-foreground">
                        {selectedWeekData
                          ? formatWeekLabel(selectedWeekData.week)
                          : "—"}
                      </span>
                      {selectedWeekData && (
                        <span className="ml-2 text-muted-foreground">
                          · {filteredStocks.length} of{" "}
                          {selectedWeekData.stocks.length} stocks
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search symbol…"
                      className="pl-8 h-8 text-sm rounded-lg"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Separator className="mb-4" />

                {/* Loading */}
                {loading && (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-10 rounded-lg" />
                    ))}
                  </div>
                )}

                {/* No week selected */}
                {!loading && !selectedWeekData && (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                    <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Select a week from the sidebar to view stocks
                    </p>
                  </div>
                )}

                {/* No results after search */}
                {!loading &&
                  selectedWeekData &&
                  filteredStocks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                      <Search className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        No stocks match &quot;{search}&quot;
                      </p>
                      <button
                        onClick={() => setSearch("")}
                        className="text-xs text-primary underline underline-offset-2"
                      >
                        Clear search
                      </button>
                    </div>
                  )}

                {/* Table */}
                {!loading && filteredStocks.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border">
                          <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            #
                          </th>
                          <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Symbol
                          </th>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Close
                          </th>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Breakout
                          </th>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Volume
                          </th>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Avg Vol (20W)
                          </th>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Vol Ratio
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-border">
                        {filteredStocks.map((stock, idx) => (
                          <tr
                            key={stock.symbol}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-foreground tracking-wide">
                                {stock.symbol}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-foreground">
                              ₹{stock.close?.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-foreground">
                              ₹{stock.breakout_level?.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-foreground">
                              {Math.round(stock.volume).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                              {Math.round(stock.avg_volume_20).toLocaleString(
                                "en-IN",
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex justify-end">
                                <VolumeRatioBadge
                                  volume={stock.volume}
                                  avg={stock.avg_volume_20}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
