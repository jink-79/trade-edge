// src/pages/MutualFundPage.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvestments, addInvestment } from "../features/mutualFundSlice";
import type { AppDispatch, RootState } from "../app/store";
import {
  TrendingUp,
  RefreshCw,
  Plus,
  Calendar,
  BarChart2,
  Layers,
  Hash,
  Wallet,
  AlertCircle,
  Loader2,
  PieChart,
  ArrowUpRight,
  X,
  IndianRupee,
} from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type CapCategory = "Smallcap" | "Midcap" | "Largecap" | "Flexicap";

interface FormState {
  date: string;
  fundName: string;
  category: CapCategory | "";
  nav: string;
  units: string;
  amount: string;
}

const EMPTY_FORM: FormState = {
  date: new Date().toISOString().split("T")[0],
  fundName: "",
  category: "",
  nav: "",
  units: "",
  amount: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number, decimals = 2) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const CAP_STYLES: Record<
  CapCategory,
  { bg: string; text: string; dot: string }
> = {
  Smallcap: {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  Midcap: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  Largecap: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Flexicap: {
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            accent ?? "bg-primary/10",
          )}
        >
          <Icon
            className={cn("w-4 h-4", accent ? "text-white" : "text-primary")}
          />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function CapBadge({ category }: { category: string }) {
  const s = CAP_STYLES[category as CapCategory] ?? {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        s.bg,
        s.text,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
      {category}
    </span>
  );
}

function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MutualFundPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { entries, loading, adding, error } = useSelector(
    (s: RootState) => s.mutualFund,
  );

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCap, setFilterCap] = useState<string>("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchInvestments());
  }, [dispatch]);

  // Auto-calculate amount when nav × units change
  useEffect(() => {
    const nav = parseFloat(form.nav);
    const units = parseFloat(form.units);
    if (!isNaN(nav) && !isNaN(units) && nav > 0 && units > 0) {
      setForm((f) => ({ ...f, amount: (nav * units).toFixed(2) }));
    }
  }, [form.nav, form.units]);

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchInvestments());
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.fundName.trim()) return setFormError("Fund name is required.");
    if (!form.category) return setFormError("Please select a category.");
    if (!form.date) return setFormError("Date is required.");
    if (!form.nav || isNaN(+form.nav) || +form.nav <= 0)
      return setFormError("Enter a valid NAV.");
    if (!form.units || isNaN(+form.units) || +form.units <= 0)
      return setFormError("Enter valid units.");

    const result = await dispatch(
      addInvestment({
        date: form.date,
        fundName: form.fundName.trim(),
        category: form.category as CapCategory,
        nav: parseFloat(form.nav),
        units: parseFloat(form.units),
        amount: parseFloat(form.amount),
      }),
    );

    if (addInvestment.fulfilled.match(result)) {
      setForm({ ...EMPTY_FORM, date: form.date });
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalInvested = entries.reduce((s: any, e: any) => s + e.amount, 0);
  const totalUnits = entries.reduce((s: any, e: any) => s + e.units, 0);
  const byCategory = entries.reduce<Record<string, number>>(
    (acc: any, e: any) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    },
    {},
  );

  const topCategory =
    Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const filtered =
    filterCap === "All"
      ? entries
      : entries.filter((e) => e.category === filterCap);

  const PAGE_SIZE = 20;

  // Reset page when filter changes — add this to your setFilterCap calls above
  // already handled via onClick={() => { setFilterCap(cap); setPage(1); }}

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginated = filtered.slice(startIndex, endIndex);

  // Compact page number list: [1, 2, …, 7, 8] style
  function getPageNumbers(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | "…")[] = [1];

    if (current > 3) pages.push("…");

    const rangeStart = Math.max(2, current - 1);
    const rangeEnd = Math.min(total - 1, current + 1);
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

    if (current < total - 2) pages.push("…");

    pages.push(total);
    return pages;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Mutual Funds
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track and manage your mutual fund investments
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="gap-1.5"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", refreshing && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Error banner ── */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Invested"
            value={fmtCurrency(totalInvested)}
            sub={`${entries.length} investment${entries.length !== 1 ? "s" : ""}`}
            icon={IndianRupee}
            accent="bg-primary"
          />
          <SummaryCard
            label="Total Units"
            value={fmt(totalUnits, 3)}
            sub="across all funds"
            icon={Hash}
          />
          <SummaryCard
            label="Top Category"
            value={topCategory}
            sub={
              byCategory[topCategory]
                ? fmtCurrency(byCategory[topCategory])
                : "—"
            }
            icon={Layers}
          />
          <SummaryCard
            label="Funds"
            value={String(new Set(entries.map((e: any) => e.fundName)).size)}
            sub="unique funds"
            icon={BarChart2}
          />
        </div>

        {/* ── Add Entry Form ── */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Form header */}
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                New Entry
              </h2>
              <p className="text-xs text-muted-foreground">
                Add a new mutual fund investment
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {formError && (
              <div className="mb-4 flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {formError}
              </div>
            )}

            {/* Fields grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <FormField label="Date" icon={Calendar}>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="w-full"
                />
              </FormField>

              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <FormField label="Mutual Fund Name" icon={TrendingUp}>
                  <Input
                    placeholder="e.g. Mirae Asset Emerging Bluechip"
                    value={form.fundName}
                    onChange={(e) => set("fundName", e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Category" icon={Layers}>
                <Select
                  value={form.category}
                  onValueChange={(v) => set("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Smallcap">Smallcap</SelectItem>
                    <SelectItem value="Midcap">Midcap</SelectItem>
                    <SelectItem value="Largecap">Largecap</SelectItem>
                    <SelectItem value="Flexicap">Flexicap</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="NAV (₹)" icon={ArrowUpRight}>
                <Input
                  min="0"
                  placeholder="0.00"
                  value={form.nav}
                  onChange={(e) => set("nav", e.target.value)}
                />
              </FormField>

              <FormField label="Units" icon={Hash}>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.000"
                  value={form.units}
                  onChange={(e) => set("units", e.target.value)}
                />
              </FormField>

              <FormField label="Amount (₹)" icon={IndianRupee}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Auto-calculated"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  className="bg-muted/50"
                />
              </FormField>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Amount auto-fills from NAV × Units. You can override it
                manually.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setFormError(null);
                  }}
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Clear
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={adding}
                  className="gap-1.5 min-w-28"
                >
                  {adding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {adding ? "Adding…" : "Add Entry"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* ── Investments Table ── */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2 flex-1">
              <Wallet className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Investment Ledger
              </h2>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {filtered.length}
              </span>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["All", "Largecap", "Midcap", "Smallcap"].map((cap) => (
                <button
                  key={cap}
                  onClick={() => {
                    setFilterCap(cap);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                    filterCap === cap
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading investments…</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <PieChart className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No investments yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the form above to add your first mutual fund entry.
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      {[
                        "Date",
                        "Fund Name",
                        "Category",
                        "NAV (₹)",
                        "Units",
                        "Amount (₹)",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginated.map((entry, idx) => (
                      <tr
                        key={entry._id ?? idx}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap text-xs">
                          {new Date(entry.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-foreground max-w-50">
                          <span className="truncate block">
                            {entry.fundName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <CapBadge category={entry.category} />
                        </td>
                        <td className="px-5 py-3.5 text-foreground font-mono text-xs tabular-nums">
                          ₹{fmt(entry.nav)}
                        </td>
                        <td className="px-5 py-3.5 text-foreground font-mono text-xs tabular-nums">
                          {fmt(entry.units, 3)}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-foreground font-mono text-xs tabular-nums">
                          {fmtCurrency(entry.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Footer totals — always over the full filtered set, not just current page */}
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/50">
                      <td
                        colSpan={4}
                        className="px-5 py-3 text-xs font-semibold text-muted-foreground"
                      >
                        TOTAL ({filtered.length} entries)
                      </td>
                      <td className="px-5 py-3 text-xs font-bold text-foreground font-mono tabular-nums">
                        {fmt(
                          filtered.reduce((s, e) => s + e.units, 0),
                          3,
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs font-bold text-primary font-mono tabular-nums">
                        {fmtCurrency(
                          filtered.reduce((s, e) => s + e.amount, 0),
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pagination footer */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
                  <p className="text-xs text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {startIndex + 1}–{Math.min(endIndex, filtered.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {filtered.length}
                    </span>
                  </p>

                  <div className="flex items-center gap-1">
                    {/* Prev */}
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center justify-center h-7 w-7 rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers(page, totalPages).map((p, i) =>
                      p === "…" ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="w-7 text-center text-xs text-muted-foreground"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(Number(p))}
                          className={cn(
                            "h-7 w-7 rounded-md text-xs font-medium transition-colors border",
                            page === p
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {p}
                        </button>
                      ),
                    )}

                    {/* Next */}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="flex items-center justify-center h-7 w-7 rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Category breakdown ── */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-6">
            {(
              ["Largecap", "Midcap", "Smallcap", "Flexicap"] as CapCategory[]
            ).map((cap) => {
              const amt = byCategory[cap] ?? 0;
              const pct = totalInvested > 0 ? (amt / totalInvested) * 100 : 0;
              const s = CAP_STYLES[cap];
              return (
                <div
                  key={cap}
                  className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <CapBadge category={cap} />
                    <span className="text-xs font-bold text-foreground">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {fmtCurrency(amt)}
                  </p>
                  <div className="w-full bg-border rounded-full h-1.5">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-700",
                        s.dot,
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entries.filter((e) => e.category === cap).length} entries
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
