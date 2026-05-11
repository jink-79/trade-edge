// src/store/openPositionsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/services/api";

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

export interface ExitPayload {
  tradeId: string;
  exitPrice: number;
  exitDate: string;
  exitReason: string;
}

interface OpenPositionsState {
  data: OpenTrade[];
  loading: boolean;
  error: string | null;
  exiting: boolean;
  exitError: string | null;
}

const initialState: OpenPositionsState = {
  data: [],
  loading: false,
  error: null,
  exiting: false,
  exitError: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// GET /api/trades/open
export const fetchOpenPositions = createAsyncThunk(
  "openPositions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/open-positions");
      return res.data.data as OpenTrade[];
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ?? "Failed to fetch open positions.",
      );
    }
  },
);

// POST /api/trades/:id/exit
export const exitPosition = createAsyncThunk(
  "openPositions/exit",
  async (payload: ExitPayload, { rejectWithValue }) => {
    try {
      const { tradeId, ...body } = payload;
      const res = await api.post(`/trades/${tradeId}/exit`, body);
      return tradeId; // return id to remove from state
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ?? "Failed to close position.",
      );
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const openPositionsSlice = createSlice({
  name: "openPositions",
  initialState,
  reducers: {
    clearExitError(state) {
      state.exitError = null;
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchOpenPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpenPositions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload;
      })
      .addCase(fetchOpenPositions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });

    // exit
    builder
      .addCase(exitPosition.pending, (state) => {
        state.exiting = true;
        state.exitError = null;
      })
      .addCase(exitPosition.fulfilled, (state, { payload: tradeId }) => {
        state.exiting = false;
        // Remove closed trade from open positions immediately
        state.data = state.data.filter((t) => t._id !== tradeId);
      })
      .addCase(exitPosition.rejected, (state, { payload }) => {
        state.exiting = false;
        state.exitError = payload as string;
      });
  },
});

export const { clearExitError } = openPositionsSlice.actions;
export default openPositionsSlice.reducer;
