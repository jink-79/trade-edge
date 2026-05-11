// src/store/profileSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ProfileFormData } from "@/pages/MyProfilePage";
import api from "@/services/api";

// ─── State ────────────────────────────────────────────────────────────────────
interface ProfileState {
  data: Partial<ProfileFormData> | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: string | null; // human-readable timestamp
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
  lastSaved: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/my-profile");
      return (await res.data.data) as Partial<ProfileFormData>;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as Error).message ?? "Failed to load profile",
      );
    }
  },
);

export const saveProfile = createAsyncThunk(
  "profile/save",
  async (payload: ProfileFormData, { rejectWithValue }) => {
    try {
      const res = await api.post("/my-profile", payload);
      // const res = await fetch("/api/my-profile", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });
      // if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return (await res.data.data) as Partial<ProfileFormData>;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as Error).message ?? "Failed to save profile",
      );
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetch ──
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload;
      })
      .addCase(fetchProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });

    // ── save ──
    builder
      .addCase(saveProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.data = payload;
        state.lastSaved = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      })
      .addCase(saveProfile.rejected, (state, { payload }) => {
        state.saving = false;
        state.error = payload as string;
      });
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;
