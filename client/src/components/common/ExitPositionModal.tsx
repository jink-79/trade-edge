// src/components/ExitPositionModal.tsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../app/store";
import { exitPosition } from "../../features/openPositionsSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Hash,
  IndianRupee,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OpenTrade {
  _id: string;
  stockName: string;
  symbol: string;
  entryDate: string;
  qty: number;
  entryPrice: number;
  pnlPercent: number;
  highestCloseSinceEntry: number;
  lastClosedWeeklyClose: number;
  lastCandleDate: string;
  structureExitLow: number;
  trailingActive: boolean;
  trailingStopPrice: number | null;
  trailActivatedDate: string | null;
  exitSignal: boolean;
  exitReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  trade: OpenTrade | null;
  open: boolean;
  onClose: () => void;
}

const EXIT_REASONS = [
  "Stop Loss Hit",
  "Trailing Stop Hit",
  "Target Reached",
  "Structure Break",
  "Manual Exit",
  "Weekly Close Below SL",
  "Other",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

function InfoRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-xs font-medium text-foreground", valueClass)}>
        {value}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExitPositionModal({ trade, open, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { exiting, exitError } = useSelector((s: RootState) => s.openPositions);

  const today = new Date().toISOString().split("T")[0];
  const [exitPrice, setExitPrice] = useState("");
  const [exitDate, setExitDate] = useState(today);
  const [exitReason, setExitReason] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  if (!trade) return null;

  // ── Live P&L preview ──────────────────────────────────────────────────────
  const parsedExitPrice = parseFloat(exitPrice);
  const hasValidPrice = !isNaN(parsedExitPrice) && parsedExitPrice > 0;
  const pnlAmount = hasValidPrice
    ? (parsedExitPrice - trade.entryPrice) * trade.qty
    : null;
  const pnlPct = hasValidPrice
    ? ((parsedExitPrice - trade.entryPrice) / trade.entryPrice) * 100
    : null;
  const isProfit = pnlAmount !== null && pnlAmount >= 0;

  const handleClose = () => {
    setExitPrice("");
    setExitDate(today);
    setExitReason("");
    setFieldError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    if (!exitPrice || isNaN(parsedExitPrice) || parsedExitPrice <= 0)
      return setFieldError("Please enter a valid exit price.");
    if (!exitDate) return setFieldError("Exit date is required.");
    if (!exitReason) return setFieldError("Please select an exit reason.");

    const result = await dispatch(
      exitPosition({
        tradeId: trade._id,
        exitPrice: parsedExitPrice,
        exitDate,
        exitReason,
      }),
    );

    if (exitPosition.fulfilled.match(result)) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-xl">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="text-lg">📤</span> Close Position
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-muted-foreground">
                  Fill in exit details to close this trade and move it to closed
                  positions.
                </DialogDescription>
              </div>
              {/* Exit signal warning */}
              {trade.exitSignal && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                  <AlertTriangle size={10} />
                  Exit Signal
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        <Separator />

        <div className="px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* ── Trade summary card ── */}
          <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 space-y-0.5">
            {/* Stock header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {trade.symbol}
                </p>
                <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                  {trade.stockName}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  trade.pnlPercent >= 0
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {trade.pnlPercent >= 0 ? (
                  <ArrowUpRight size={11} />
                ) : (
                  <ArrowDownRight size={11} />
                )}
                {trade.pnlPercent.toFixed(2)}%
              </span>
            </div>

            <Separator className="my-2" />

            <InfoRow label="Entry Price" value={`₹${fmt(trade.entryPrice)}`} />
            <InfoRow
              label="Entry Date"
              value={new Date(trade.entryDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
            <InfoRow
              label="Quantity"
              value={
                <span className="flex items-center gap-1">
                  <Hash size={10} />
                  {trade.qty}
                </span>
              }
            />
            <InfoRow
              label="Invested"
              value={fmtCurrency(trade.entryPrice * trade.qty)}
            />

            <Separator className="my-2" />

            <InfoRow
              label="LTP (Last Weekly Close)"
              value={`₹${fmt(trade.lastClosedWeeklyClose)}`}
            />
            <InfoRow
              label="Highest Close Since Entry"
              value={`₹${fmt(trade.highestCloseSinceEntry)}`}
              valueClass="text-emerald-600"
            />
            <InfoRow
              label="Structure Stop Low"
              value={`₹${fmt(trade.structureExitLow)}`}
              valueClass="text-destructive"
            />
            {trade.trailingActive && trade.trailingStopPrice && (
              <InfoRow
                label="Trailing Stop"
                value={
                  <span className="flex items-center gap-1 text-amber-600">
                    <Shield size={10} />₹{fmt(trade.trailingStopPrice)}
                  </span>
                }
              />
            )}
            <InfoRow
              label="Last Candle Date"
              value={new Date(trade.lastCandleDate).toLocaleDateString(
                "en-GB",
                { day: "2-digit", month: "short", year: "numeric" },
              )}
            />
          </div>

          {/* ── Exit fields ── */}
          <form id="exit-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Exit Price */}
            <div className="space-y-1.5">
              <Label
                htmlFor="exitPrice"
                className="text-xs font-medium flex items-center gap-1.5"
              >
                <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
                Exit Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder={`e.g. ${fmt(trade.lastClosedWeeklyClose)}`}
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="h-9"
                autoFocus
              />
            </div>

            {/* Exit Date */}
            <div className="space-y-1.5">
              <Label
                htmlFor="exitDate"
                className="text-xs font-medium flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Exit Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exitDate"
                type="date"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Exit Reason */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                Exit Reason <span className="text-destructive">*</span>
              </Label>
              <Select value={exitReason} onValueChange={setExitReason}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select reason…" />
                </SelectTrigger>
                <SelectContent>
                  {EXIT_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Live P&L preview ── */}
            {hasValidPrice && pnlAmount !== null && pnlPct !== null && (
              <div
                className={cn(
                  "rounded-lg border px-4 py-3 space-y-1",
                  isProfit
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-destructive/5 border-destructive/20",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  P&L Preview
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    P&L Amount
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold flex items-center gap-1",
                      isProfit ? "text-emerald-600" : "text-destructive",
                    )}
                  >
                    {isProfit ? (
                      <TrendingUp size={13} />
                    ) : (
                      <TrendingDown size={13} />
                    )}
                    {isProfit ? "+" : ""}
                    {fmtCurrency(pnlAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">P&L %</span>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isProfit ? "text-emerald-600" : "text-destructive",
                    )}
                  >
                    {isProfit ? "+" : ""}
                    {pnlPct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Exit Value
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {fmtCurrency(parsedExitPrice * trade.qty)}
                  </span>
                </div>
              </div>
            )}

            {/* Field error */}
            {(fieldError || exitError) && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                <AlertTriangle size={12} className="shrink-0" />
                {fieldError ?? exitError}
              </div>
            )}
          </form>
        </div>

        <Separator />

        {/* ── Footer ── */}
        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <p className="text-[10px] text-muted-foreground">
            This will move the trade to Closed Positions.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={exiting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="exit-form"
              size="sm"
              disabled={exiting}
              className={cn(
                "min-w-28 gap-1.5",
                hasValidPrice && pnlAmount !== null
                  ? isProfit
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-destructive hover:bg-destructive/90 text-white"
                  : "",
              )}
            >
              {exiting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isProfit && hasValidPrice ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : hasValidPrice ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : null}
              {exiting ? "Closing…" : "Close Position"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
