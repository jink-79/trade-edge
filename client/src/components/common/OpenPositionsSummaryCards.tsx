import React from "react";
import type { OpenPosition } from "../../features/openPositionsSlice";
import { Briefcase, Zap, ShieldCheck, TrendingUp } from "lucide-react";

export default function OpenPositionsSummaryCards({
  data,
}: {
  data: OpenPosition[];
}) {
  const totalTrades = data.length;
  const trailingActiveCount = data.filter((t) => t.trailingActive).length;
  const exitSignalsCount = data.filter((t) => t.exitSignal).length;
  const avgPnl =
    data.length > 0
      ? (
          data.reduce((acc, curr) => acc + curr.pnlPercent, 0) / data.length
        ).toFixed(2)
      : "0.00";

  const cards = [
    {
      label: "Total Open Trades",
      value: totalTrades,
      icon: Briefcase,
      color: "text-primary",
    },
    {
      label: "Trailing Active",
      value: trailingActiveCount,
      icon: ShieldCheck,
      color: "text-green-500",
    },
    {
      label: "Exit Signals",
      value: exitSignalsCount,
      icon: Zap,
      color: "text-destructive",
    },
    {
      label: "Average PnL%",
      value: `${avgPnl}%`,
      icon: TrendingUp,
      color: parseFloat(avgPnl) >= 0 ? "text-green-500" : "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-card border border-border p-5 rounded-lg shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {card.label}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {card.value}
              </h3>
            </div>
            <card.icon className={card.color} size={20} />
          </div>
        </div>
      ))}
    </div>
  );
}
