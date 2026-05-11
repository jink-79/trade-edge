// src/store/mutualFundSlice.ts
import api from "@/services/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MutualFundEntry {
  _id?: string;
  date: string;
  fundName: string;
  category: "Smallcap" | "Midcap" | "Largecap" | "Flexicap";
  nav: number;
  units: number;
  amount: number;
  createdAt?: string;
}

interface MutualFundState {
  entries: MutualFundEntry[];
  loading: boolean;
  adding: boolean;
  error: string | null;
}

const initialState: MutualFundState = {
  entries: [],
  loading: false,
  adding: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// GET /api/mutual-funds
export const fetchInvestments = createAsyncThunk(
  "mutualFund/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/mutual-funds");
      return res.data.data as MutualFundEntry[];
    } catch (err: unknown) {
      return rejectWithValue(
        (err as Error).message ?? "Failed to fetch investments",
      );
    }
  },
);

// POST /api/mutual-funds
export const addInvestment = createAsyncThunk(
  "mutualFund/add",
  async (
    payload: Omit<MutualFundEntry, "_id" | "createdAt">,
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post("/mutual-funds", payload);
      return res.data.data as MutualFundEntry;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as Error).message ?? "Failed to add investment",
      );
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const mutualFundSlice = createSlice({
  name: "mutualFund",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Sort newest first
        state.entries = [...payload].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      })
      .addCase(fetchInvestments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });

    // add
    builder
      .addCase(addInvestment.pending, (state) => {
        state.adding = true;
        state.error = null;
      })
      .addCase(addInvestment.fulfilled, (state, { payload }) => {
        state.adding = false;
        // Prepend new entry (newest first)
        state.entries = [payload, ...state.entries];
      })
      .addCase(addInvestment.rejected, (state, { payload }) => {
        state.adding = false;
        state.error = payload as string;
      });
  },
});

export const { clearError } = mutualFundSlice.actions;
export default mutualFundSlice.reducer;
