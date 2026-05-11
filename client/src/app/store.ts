import { configureStore } from "@reduxjs/toolkit";
import preferencesReducer from "../features/preferencesSlice";
import openPositionsReducer from "../features/openPositionsSlice";
import newTradeReducer from "../features/newTradeSlice";
import profileReducer from "../features/profileSlice";
import mutualFundReducer from "../features/mutualFundSlice";
import scannerReducer from "../features/scannerSlice";
import closedTradesReducer from "../features/closedTradesSlice";

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    openPositions: openPositionsReducer,
    newTrade: newTradeReducer,
    profile: profileReducer,
    mutualFund: mutualFundReducer,
    scanner: scannerReducer,
    closedTrades: closedTradesReducer,
  },
});

// These exports are what your components are looking for
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
