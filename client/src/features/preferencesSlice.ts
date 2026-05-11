import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export interface Preferences {
  totalCapital: number;
  riskPerTradePercent: number;
  maxOpenTrades: number;
  maxCapitalPerTrade: number;
  timeframe: "weekly" | "daily";
  breakoutLookbackWeeks: number;
  exitLookbackWeeks: number;
  trailTriggerPercent: number;
  trailOffsetPercent: number;
  requireCloseAboveEMA20: boolean;
  emaPeriod: number;
  requireVolumeBreakout: boolean;
  positionSizingType: "fixedCapital" | "percentCapital" | "atrBased";
  updatedAt?: string;
}

interface PreferenceState {
  data: Preferences | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PreferenceState = {
  data: null,
  loading: false,
  error: null,
  success: false,
};

export const fetchPreferences = createAsyncThunk(
  "preferences/fetch",
  async () => {
    const response = await api.get("/preferences");
    return response.data.data;
  },
);

export const updatePreferences = createAsyncThunk(
  "preferences/update",
  async (payload: Preferences) => {
    const response = await api.post("/preferences", payload);
    return response.data.data;
  },
);

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(updatePreferences.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to update preferences";
      });
  },
});

export const { resetStatus } = preferencesSlice.actions;
export default preferencesSlice.reducer;
