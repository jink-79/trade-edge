import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClosedTrades } from "../features/closedTradesSlice";
import type { AppDispatch, RootState } from "@/app/store";
import type { ClosedTrade } from "../features/closedTradesSlice";
import {
  Briefcase,
  TrendingUp,
  IndianRupee,
  Clock,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Loader2,
  BarChart2,
  AlertCircle,
  Shield,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

type Filter = "All" | "Winners" | "Losers";
const FILTERS: Filter[] = ["All", "Winners", "Losers"];
const EXIT_REASON_CONFIG: Record<string, { label: string; className: string }> =
  {
    "Stop Loss Hit": {
      label: "Stop Loss Hit",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    "Trailing Stop Hit": {
      label: "Trailing Stop Hit",
      className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    },
    "Target Reached": {
      label: "Target Reached",
      className: "bg-green-500/10 text-green-700 border-green-500/20",
    },
    "Structure Break": {
      label: "Structure Break",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    "Manual Exit": {
      label: "Manual Exit",
      className: "bg-muted text-muted-foreground border-border",
    },
    "Weekly Close Below SL": {
      label: "Weekly Close Below SL",
      className: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    },
    Other: {
      label: "Other",
      className: "bg-muted text-muted-foreground border-border",
    },
  };
// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return (
    "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })
  );
}

function fmtPrice(n: number) {
  return (
    "₹" +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
        <Icon size={12} />
        {label}
      </p>
      <p
        className={cn(
          "font-mono text-xl font-medium text-foreground",
          valueClass,
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function PnlBadge({
  amount,
  percent,
  hidePercent = false,
}: {
  amount: number;
  percent: number;
  hidePercent?: boolean;
}) {
  const isPos = amount >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        isPos
          ? "bg-green-500/10 text-green-700"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {isPos ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {isPos ? "+" : "−"}
      {fmtCurrency(amount)}
      {!hidePercent && (
        <span className="opacity-70">({Math.abs(percent).toFixed(2)}%)</span>
      )}
    </span>
  );
}

function ExitReasonBadge({ reason }: { reason: string }) {
  const config = EXIT_REASON_CONFIG[reason] ?? {
    label: reason,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

function TrailingBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-px text-[10px] font-medium text-amber-700">
      <Shield size={9} /> TSL
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <BarChart2 className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No closed trades</p>
        <p className="text-xs text-muted-foreground mt-1">
          Trades will appear here once you exit a position.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-destructive" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Failed to load</p>
        <p className="text-xs text-muted-foreground mt-1">{message}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClosedTradesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: trades,
    stats,
    pagination,
    loading,
    error,
  } = useSelector((s: RootState) => s.closedTrades);

  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchClosedTrades({ page, limit: 20 }));
  }, [dispatch, page]);

  // Client-side filter (Winners/Losers) within the current page batch
  const filtered = useMemo<ClosedTrade[]>(() => {
    if (filter === "Winners") return trades.filter((t) => t.pnlAmount >= 0);
    if (filter === "Losers") return trades.filter((t) => t.pnlAmount < 0);
    return trades;
  }, [trades, filter]);

  const totalPnlFiltered = filtered.reduce((s, t) => s + t.pnlAmount, 0);
  const totalExitValueFiltered = filtered.reduce((s, t) => s + t.exitValue, 0);

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── CSV export ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = [
      "Symbol",
      "Stock Name",
      "Entry Date",
      "Exit Date",
      "Qty",
      "Entry Price",
      "Exit Price",
      "Entry Value",
      "Exit Value",
      "P&L (₹)",
      "P&L (%)",
      "Hold (days)",
      "Trailing Active",
      "Trailing Stop Price",
      "Exit Reason",
    ];
    const rows = trades.map((t) => [
      t.symbol,
      t.stockName,
      fmtDate(t.entryDate),
      fmtDate(t.exitDate),
      t.qty,
      t.entryPrice,
      t.exitPrice,
      t.entryValue.toFixed(2),
      t.exitValue.toFixed(2),
      t.pnlAmount.toFixed(2),
      t.pnlPercent.toFixed(4),
      t.holdingDays,
      t.trailingActive,
      t.trailingStopPrice ?? "",
      t.exitReason,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tradeedge_closed_trades.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Closed trades
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Historical record of all exited positions
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={trades.length === 0}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border bg-card text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Stat cards — from server stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={Briefcase}
            label="Total trades"
            value={String(stats?.totalTrades ?? "—")}
            sub="All time"
          />
          <StatCard
            icon={TrendingUp}
            label="Win rate"
            value={stats ? `${stats.winRate.toFixed(1)}%` : "—"}
            sub={
              stats
                ? `${stats.totalWinners} winners · ${stats.totalLosers} losers`
                : "—"
            }
            valueClass={
              stats
                ? stats.winRate >= 50
                  ? "text-green-700"
                  : "text-destructive"
                : undefined
            }
          />
          <StatCard
            icon={IndianRupee}
            label="Net P&L"
            value={
              stats
                ? (stats.totalPnl >= 0 ? "+" : "−") +
                  fmtCurrency(stats.totalPnl)
                : "—"
            }
            sub={
              stats
                ? `Avg ${stats.avgPnlPercent.toFixed(2)}% per trade`
                : "Realised"
            }
            valueClass={
              stats
                ? stats.totalPnl >= 0
                  ? "text-green-700"
                  : "text-destructive"
                : undefined
            }
          />
          <StatCard
            icon={Clock}
            label="Avg hold"
            value={stats ? `${Math.round(stats.avgHoldDays)}d` : "—"}
            sub="Days per trade"
          />
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Card header */}
          <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2">
              <History size={14} className="text-primary" />
              <h2 className="text-[13px] font-medium text-foreground">
                Trade history
              </h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {pagination?.total ?? filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={cn(
                    "h-7 rounded-md border px-3 text-[11px] font-medium transition-colors",
                    filter === f
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading trades…</span>
            </div>
          )}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && filtered.length === 0 && <EmptyState />}

          {/* Table */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse text-left"
                  style={{ minWidth: 900, tableLayout: "fixed" }}
                >
                  <colgroup>
                    <col style={{ width: "14%" }} /> {/* Asset */}
                    <col style={{ width: "11%" }} /> {/* Entry */}
                    <col style={{ width: "11%" }} /> {/* Exit */}
                    <col style={{ width: "6%" }} /> {/* Qty */}
                    <col style={{ width: "11%" }} /> {/* Entry value */}
                    <col style={{ width: "11%" }} /> {/* Exit value */}
                    <col style={{ width: "15%" }} /> {/* P&L */}
                    <col style={{ width: "6%" }} /> {/* Hold */}
                    <col style={{ width: "8%" }} /> {/* Trailing */}
                    <col style={{ width: "14%" }} /> {/* Exit reason */}
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {[
                        "Asset",
                        "Entry",
                        "Exit",
                        "Qty",
                        "Entry value",
                        "Exit value",
                        "P&L",
                        "Hold",
                        "Trailing",
                        "Exit reason",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {filtered.map((trade) => (
                      <tr
                        key={trade._id}
                        className={cn(
                          "transition-colors hover:bg-muted/40",
                          trade.pnlAmount < 0 && "bg-destructive/[0.02]",
                        )}
                      >
                        {/* Asset */}
                        <td className="px-3 py-3 align-top">
                          <p className="text-[13px] font-medium text-foreground leading-none">
                            {trade.symbol}
                          </p>
                          <p className="mt-1 truncate text-[11px] text-muted-foreground">
                            {trade.stockName}
                          </p>
                        </td>

                        {/* Entry */}
                        <td className="px-3 py-3 align-top">
                          <p className="font-mono text-[12px] text-foreground">
                            {fmtPrice(trade.entryPrice)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {fmtDate(trade.entryDate)}
                          </p>
                        </td>

                        {/* Exit */}
                        <td className="px-3 py-3 align-top">
                          <p className="font-mono text-[12px] text-foreground">
                            {fmtPrice(trade.exitPrice)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {fmtDate(trade.exitDate)}
                          </p>
                        </td>

                        {/* Qty */}
                        <td className="px-3 py-3 align-top font-mono text-[12px] text-foreground">
                          {trade.qty}
                        </td>

                        {/* Entry value */}
                        <td className="px-3 py-3 align-top font-mono text-[12px] text-muted-foreground">
                          {fmtCurrency(trade.entryValue)}
                        </td>

                        {/* Exit value */}
                        <td className="px-3 py-3 align-top font-mono text-[12px] text-foreground">
                          {fmtCurrency(trade.exitValue)}
                        </td>

                        {/* P&L */}
                        <td className="px-3 py-3 align-top">
                          <PnlBadge
                            amount={trade.pnlAmount}
                            percent={trade.pnlPercent}
                          />
                        </td>

                        {/* Hold */}
                        <td className="px-3 py-3 align-top font-mono text-[12px] text-muted-foreground">
                          {trade.holdingDays}d
                        </td>

                        {/* Trailing */}
                        <td className="px-3 py-3 align-top">
                          {trade.trailingActive ? (
                            <div className="flex flex-col gap-1">
                              <TrailingBadge />
                              {trade.trailingStopPrice != null && (
                                <span className="font-mono text-[10px] text-amber-700">
                                  {fmtPrice(trade.trailingStopPrice)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </td>

                        {/* Exit reason */}
                        <td className="px-3 py-3 align-top">
                          <ExitReasonBadge reason={trade.exitReason} />
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Footer totals */}
                  <tfoot>
                    <tr className="border-t border-border bg-muted/50">
                      <td
                        colSpan={4}
                        className="px-3 py-2.5 text-[11px] font-medium text-muted-foreground"
                      >
                        Showing {filtered.length} trade
                        {filtered.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">
                        {fmtCurrency(
                          filtered.reduce((s, t) => s + t.entryValue, 0),
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[12px] font-medium text-foreground">
                        {fmtCurrency(totalExitValueFiltered)}
                      </td>
                      <td className="px-3 py-2.5">
                        <PnlBadge
                          amount={totalPnlFiltered}
                          percent={0}
                          hidePercent
                        />
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pagination — server-driven */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                  <p className="text-[11px] text-muted-foreground">
                    Page{" "}
                    <span className="font-medium text-foreground">
                      {pagination.page}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {pagination.totalPages}
                    </span>{" "}
                    ·{" "}
                    <span className="font-medium text-foreground">
                      {pagination.total}
                    </span>{" "}
                    total
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!pagination.hasPrev}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft size={13} />
                    </button>

                    {getPageNumbers(pagination.page, pagination.totalPages).map(
                      (p, i) =>
                        p === "…" ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="w-7 text-center text-[11px] text-muted-foreground"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => handlePageChange(Number(p))}
                            className={cn(
                              "h-7 w-7 rounded-md border text-[11px] font-medium transition-colors",
                              pagination.page === p
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {p}
                          </button>
                        ),
                    )}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!pagination.hasNext}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
