import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/services/api";

export interface ClosedTrade {
  _id: string;
  originalTradeId: string;
  symbol: string;
  stockName: string;
  qty: number;
  entryPrice: number;
  entryDate: string;
  exitPrice: number;
  exitDate: string;
  exitReason: string;
  pnlAmount: number;
  pnlPercent: number;
  exitValue: number;
  entryValue: number;
  holdingDays: number;
  trailingActive: boolean;
  trailingStopPrice: number | null;
  trailActivatedDate: string | null;
  highestCloseSinceEntry?: number;
  lastClosedWeeklyClose?: number;
  structureExitLow?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TradeStats {
  totalTrades: number;
  totalPnl: number;
  totalWinners: number;
  totalLosers: number;
  winRate: number;
  avgHoldDays: number;
  avgPnlPercent: number;
  totalExitValue: number;
  totalEntryValue: number;
}

export interface TradePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ClosedTradesState {
  data: ClosedTrade[];
  stats: TradeStats | null;
  pagination: TradePagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClosedTradesState = {
  data: [],
  stats: null,
  pagination: null,
  loading: false,
  error: null,
};

export const fetchClosedTrades = createAsyncThunk(
  "closedTrades/fetch",
  async (
    params: { page?: number; limit?: number; filter?: string } = {},
    { rejectWithValue },
  ) => {
    try {
      const { page = 1, limit = 20 } = params;
      const res = await api.get("/trades/closed", { params: { page, limit } });
      return res.data as {
        data: ClosedTrade[];
        stats: TradeStats;
        pagination: TradePagination;
      };
    } catch (err: unknown) {
      return rejectWithValue(
        (err as Error).message ?? "Failed to load closed trades",
      );
    }
  },
);

const closedTradesSlice = createSlice({
  name: "closedTrades",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClosedTrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClosedTrades.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.data;
        state.stats = payload.stats;
        state.pagination = payload.pagination;
      })
      .addCase(fetchClosedTrades.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  },
});

export default closedTradesSlice.reducer;
