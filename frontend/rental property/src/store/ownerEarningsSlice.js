import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

// Fetch Owner Earnings Overview
export const fetchOwnerEarnings = createAsyncThunk(
    "ownerEarnings/fetchOwnerEarnings",
    async (_, thunkApi) => {
        try {
            const res = await api.get("properties/owner/earnings-overview");
            return res.data?.data || res.data?.earnings || res.data || {};
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const ownerEarningsSlice = createSlice({
    name: "ownerEarnings",
    initialState: {
        overview: {
            totalEarnings: 0,
            pendingPayout: 0,
            confirmedBookingsCount: 0,
            earningsHistory: []
        },
        loading: false,
        error: null,
    },
    reducers: {
        clearEarningsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOwnerEarnings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOwnerEarnings.fulfilled, (state, action) => {
                state.loading = false;
                state.overview = action.payload;
            })
            .addCase(fetchOwnerEarnings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearEarningsError } = ownerEarningsSlice.actions;
export default ownerEarningsSlice.reducer;