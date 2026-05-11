import type { OpenPosition } from "../../features/openPositionsSlice";
import {
  MoreHorizontal,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Calendar,
  Clock,
  TrendingUp,
  Minus,
  Check,
  //   Candlestick,
} from "lucide-react";

export default function OpenPositionsTable({ data }: { data: OpenPosition[] }) {
  console.log(data);
  return (
    <div className="overflow-x-auto border border-border rounded-xl bg-card">
      <table
        className="w-full border-collapse text-left"
        style={{ minWidth: 720, tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: "16%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {[
              "Asset & qty",
              "Entry",
              "Price performance",
              "PnL %",
              "Stop loss",
              "Status",
              "Activity",
            ].map((h, i) => (
              <th
                key={h}
                className={`px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground ${i === 3 ? "text-center" : i === 6 ? "text-right" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((trade) => (
            <tr
              key={trade._id}
              className={`transition-colors hover:bg-muted/40 ${trade.exitSignal ? "bg-destructive/4" : ""}`}
            >
              {/* 1. Asset & qty */}
              <td className="px-4 py-3 align-top">
                <div className="text-sm font-medium text-foreground">
                  {trade.symbol}
                </div>
                <div
                  className="mt-0.5 truncate text-[11px] text-muted-foreground"
                  title={trade.stockName}
                >
                  {trade.stockName}
                </div>
                <span className="mt-1.5 inline-block rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
                  QTY {trade.qty}
                </span>
              </td>

              {/* 2. Entry */}
              <td className="px-4 py-3 align-top">
                <div className="text-sm font-medium text-foreground">
                  @ ₹{trade.entryPrice.toLocaleString()}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar size={11} aria-hidden />
                  {new Date(trade.entryDate).toLocaleDateString("en-GB")}
                </div>
              </td>

              {/* 3. Price performance */}
              <td className="px-4 py-3 align-top">
                <div className="text-sm font-medium text-foreground">
                  LTP ₹{trade.lastClosedWeeklyClose.toLocaleString()}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <TrendingUp
                    size={11}
                    className="text-green-600"
                    aria-hidden
                  />
                  Highest Close since entry:{" "}
                  <span className="font-medium text-green-600">
                    ₹{trade.highestCloseSinceEntry}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock size={11} aria-hidden />
                  Last candle:{" "}
                  {new Date(trade.lastCandleDate).toLocaleDateString("en-GB")}
                </div>
              </td>

              {/* 4. PnL % */}
              <td className="px-4 py-3 align-top">
                <div className="flex justify-center pt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      trade.pnlPercent >= 0
                        ? "bg-green-500/10 text-green-700"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {trade.pnlPercent >= 0 ? (
                      <ArrowUpRight size={12} aria-hidden />
                    ) : (
                      <ArrowDownRight size={12} aria-hidden />
                    )}
                    {trade.pnlPercent.toFixed(2)}%
                  </span>
                </div>
              </td>

              {/* 5. Stop loss */}
              <td className="px-4 py-3 align-top">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Structure low</span>
                  <span className="font-medium text-foreground">
                    ₹{trade.structureExitLow}
                  </span>
                </div>
                <div className="my-1.5 border-t border-border/60" />
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">TSL</span>
                  <span
                    className={`font-medium ${
                      trade.trailingActive
                        ? "text-amber-600"
                        : "text-muted-foreground/40"
                    }`}
                  >
                    {trade.trailingActive
                      ? `₹${trade.trailingStopPrice}`
                      : "--"}
                  </span>
                </div>
              </td>

              {/* 6. Status */}
              <td className="px-4 py-3 align-top">
                <div className="flex flex-col gap-1.5">
                  {trade.trailingActive ? (
                    <span className="inline-flex w-fit items-center gap-1 rounded border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      <Shield size={10} aria-hidden /> Trailing
                    </span>
                  ) : (
                    <span className="inline-flex w-fit items-center gap-1 rounded border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Minus size={10} aria-hidden /> Stationary
                    </span>
                  )}

                  {trade.exitSignal ? (
                    <span className="inline-flex w-fit items-center gap-1 rounded border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      <AlertTriangle size={10} aria-hidden /> Exit:{" "}
                      {trade.exitReason || "signal"}
                    </span>
                  ) : (
                    <span className="inline-flex w-fit items-center gap-1 rounded border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-700">
                      <Check size={10} aria-hidden /> Hold
                    </span>
                  )}
                </div>
              </td>

              {/* 7. Activity */}
              <td className="px-4 py-3 align-top text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                  <Clock size={10} aria-hidden />
                  {new Date(trade.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="mt-1 flex justify-end">
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="More options"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
