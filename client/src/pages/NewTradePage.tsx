import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { createNewTrade, resetStatus } from "../features/newTradeSlice";
import type { AppDispatch, RootState } from "../app/store";
import {
  ArrowRight,
  RotateCcw,
  TrendingUp,
  Building2,
  Calendar as CalendarIcon,
  Hash,
  IndianRupee,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const tradeSchema = z.object({
  stockName: z.string().min(2, "Company name is required"),
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  entryDate: z.string().min(1, "Entry date is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
  entryPrice: z.number().min(0.01, "Price must be greater than 0"),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground">
      <Icon size={12} />
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] text-destructive">{message}</p>;
}

export default function NewTradePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector(
    (state: RootState) => state.newTrade,
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      entryDate: new Date().toISOString().split("T")[0],
    },
  });

  const { qty = 0, entryPrice = 0, symbol, stockName } = watch();
  const totalInvestment = (qty || 0) * (entryPrice || 0);

  useEffect(() => {
    if (success) {
      toast.success("Trade added successfully!");
      reset();
      dispatch(resetStatus());
    }
    if (error) toast.error(error);
  }, [success, error, reset, dispatch]);

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              New entry
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Log a new position into your journal
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Reset form"
          >
            <RotateCcw size={14} />
          </button>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px]">
          {/* Main Form */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <TrendingUp size={14} className="text-primary" />
                Trade details
              </h2>
              <span className="text-[11px] text-muted-foreground">
                Step 1 of 1
              </span>
            </div>

            <form
              onSubmit={handleSubmit((data) => dispatch(createNewTrade(data)))}
              className="p-5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Symbol */}
                <div className="space-y-1.5">
                  <FieldLabel icon={TrendingUp}>Symbol</FieldLabel>
                  <input
                    {...register("symbol")}
                    placeholder="RELIANCE"
                    className={cn(
                      "h-9 w-full rounded-lg border bg-muted/30 px-3 font-mono text-sm uppercase tracking-wide text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10",
                      errors.symbol ? "border-destructive" : "border-border",
                    )}
                  />
                  <FieldError message={errors.symbol?.message} />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <FieldLabel icon={Building2}>Company name</FieldLabel>
                  <input
                    {...register("stockName")}
                    placeholder="Reliance Industries Ltd."
                    className={cn(
                      "h-9 w-full rounded-lg border bg-muted/30 px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10",
                      errors.stockName ? "border-destructive" : "border-border",
                    )}
                  />
                  <FieldError message={errors.stockName?.message} />
                </div>

                {/* Entry Date */}
                <div className="space-y-1.5">
                  <FieldLabel icon={CalendarIcon}>Entry date</FieldLabel>
                  <Controller
                    control={control}
                    name="entryDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 w-full justify-start rounded-lg border bg-muted/30 px-3 text-sm font-normal text-foreground hover:bg-muted/50",
                              !field.value && "text-muted-foreground",
                              errors.entryDate && "border-destructive",
                            )}
                          >
                            {field.value
                              ? format(new Date(field.value), "dd MMM yyyy")
                              : "Pick a date"}
                            <CalendarIcon className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(date?.toISOString())
                            }
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  <FieldError message={errors.entryDate?.message} />
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <FieldLabel icon={Hash}>Quantity</FieldLabel>
                  <input
                    type="number"
                    {...register("qty", { valueAsNumber: true })}
                    placeholder="0"
                    className={cn(
                      "h-9 w-full rounded-lg border bg-muted/30 px-3 font-mono text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10",
                      errors.qty ? "border-destructive" : "border-border",
                    )}
                  />
                  <FieldError message={errors.qty?.message} />
                </div>

                {/* Entry Price */}
                <div className="space-y-1.5 md:col-span-2">
                  <FieldLabel icon={IndianRupee}>Entry price</FieldLabel>
                  <input
                    type="number"
                    step="0.01"
                    {...register("entryPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    className={cn(
                      "h-9 w-full rounded-lg border bg-muted/30 px-3 font-mono text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10",
                      errors.entryPrice
                        ? "border-destructive"
                        : "border-border",
                    )}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Price per share at time of entry
                  </p>
                  <FieldError message={errors.entryPrice?.message} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Processing…" : "Execute entry"}
                <ArrowRight size={15} />
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-3">
            {/* Ticker preview */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary">
                {symbol?.charAt(0) || "?"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {symbol || "Symbol"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {stockName || "Company name"}
                </p>
              </div>
            </div>

            {/* Position summary */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <TrendingUp size={13} className="text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Position summary
                </span>
              </div>
              <div className="p-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[11px] text-muted-foreground">
                    Total investment
                  </p>
                  <p className="mt-1 font-mono text-xl font-medium text-foreground">
                    ₹
                    {totalInvestment.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>

                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {[
                    { label: "Qty", value: (qty || 0).toLocaleString("en-IN") },
                    {
                      label: "Price",
                      value: `₹${(entryPrice || 0).toFixed(2)}`,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-[12px]"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono font-medium text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2 rounded-lg bg-primary/5 p-3 text-[11px] leading-relaxed text-primary">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  <span>Monitored via global preferences once saved.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
