import api from "@/services/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type ScannerStock = {
  symbol: string;
  close: number;
  breakout_level: number;
  volume: number;
  avg_volume_20: number;
};

export type WeeklyScannerResult = {
  week: string;
  count: number;
  stocks: ScannerStock[];
};

type ScannerState = {
  loading: boolean;
  error: string | null;
  latestWeek: string | null;
  message: string | null;
  data: WeeklyScannerResult[];
  lastUpdatedAt: string | null;
};

const initialState: ScannerState = {
  loading: false,
  error: null,
  latestWeek: null,
  message: null,
  data: [],
  lastUpdatedAt: null,
};

export const fetchWeeklyScannerResults = createAsyncThunk(
  "scanner/fetchWeeklyScannerResults",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/scanner/weekly-scanner");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch scanner results.",
      );
    }
  },
);

const scannerSlice = createSlice({
  name: "scanner",
  initialState,
  reducers: {
    clearScannerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeeklyScannerResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyScannerResults.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.latestWeek = action.payload?.latestWeek || null;
        state.message = action.payload?.message || null;
        state.data = action.payload?.data || [];
        state.lastUpdatedAt = new Date().toISOString();
      })
      .addCase(fetchWeeklyScannerResults.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Something went wrong.";
      });
  },
});

export const { clearScannerError } = scannerSlice.actions;
export default scannerSlice.reducer;
