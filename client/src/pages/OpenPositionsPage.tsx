import  { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOpenPositions } from "../features/openPositionsSlice";
import type { RootState, AppDispatch } from "../app/store";
import { RefreshCcw, Search, Filter, AlertCircle } from "lucide-react";
import OpenPositionsSummaryCards from "@/components/common/OpenPositionsSummaryCards";
import OpenPositionsTable from "@/components/common/OpenPositionsTable";

export default function OpenPositionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.openPositions,
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchOpenPositions());
  }, [dispatch]);

  const filteredData = data.filter(
    (trade) =>
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.stockName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10">
        <AlertCircle size={48} className="text-destructive mb-4" />
        <h3 className="text-lg font-bold">Failed to load trades</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => dispatch(fetchOpenPositions())}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold"
        >
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-background min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Open Positions
            </h1>
            <p className="text-muted-foreground">
              Active trades currently being tracked by TradeEdge engine.
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchOpenPositions())}
            disabled={loading}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-md text-sm font-bold hover:bg-muted transition-all"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {/* Summary Statistics */}
        <OpenPositionsSummaryCards data={data} />

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search symbol or company..."
              className="w-full bg-card border border-border pl-10 pr-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Table / Empty State */}
        {loading && data.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredData.length > 0 ? (
          <OpenPositionsTable data={filteredData} />
        ) : (
          <div className="bg-card border border-dashed border-border p-20 rounded-xl text-center">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-muted-foreground" size={24} />
            </div>
            <h3 className="text-lg font-bold">No active trades found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or add a new trade to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
