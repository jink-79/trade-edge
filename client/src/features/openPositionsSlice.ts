import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface OpenPosition {
  _id: string;
  stockName: string;
  symbol: string;
  entryDate: string;
  qty: number;
  entryPrice: number;
  lastClosedWeeklyClose: number;
  lastCandleDate: string;
  pnlPercent: number;
  trailingActive: boolean;
  trailActivatedDate: string | null;
  highestCloseSinceEntry: number;
  trailingStopPrice: number | null;
  structureExitLow: number;
  exitSignal: boolean;
  exitReason: string | null;
  updatedAt: string;
}

interface PositionsState {
  data: OpenPosition[];
  loading: boolean;
  error: string | null;
}

const initialState: PositionsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchOpenPositions = createAsyncThunk(
  "positions/fetch",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/open-positions",
    );
    return response.data.data; // Assuming response follows your previously defined pattern
  },
);

const openPositionsSlice = createSlice({
  name: "openPositions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpenPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchOpenPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch trades";
      });
  },
});

export default openPositionsSlice.reducer;
