import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface TradeData {
  stockName: string;
  symbol: string;
  entryDate: string;
  qty: number;
  entryPrice: number;
}

interface NewTradeState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: NewTradeState = {
  loading: false,
  success: false,
  error: null,
};

export const createNewTrade = createAsyncThunk(
  "trade/create",
  async (tradeData: TradeData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/open-positions",
        tradeData,
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create trade",
      );
    }
  },
);

const newTradeSlice = createSlice({
  name: "newTrade",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewTrade.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createNewTrade.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createNewTrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetStatus } = newTradeSlice.actions;
export default newTradeSlice.reducer;
