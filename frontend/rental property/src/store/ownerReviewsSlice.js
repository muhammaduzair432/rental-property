import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

// Fetch Owner Reviews Feed
export const fetchOwnerReviewsFeed = createAsyncThunk(
    "ownerReviews/fetchOwnerReviewsFeed",
    async (_, thunkApi) => {
        try {
            const res = await api.get("properties/owner/reviews-feed"); // 👈 Added properties/ prefix
            return res.data?.data || res.data?.reviews || [];
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Reply to a Review
export const replyToReviewAction = createAsyncThunk(
    "ownerReviews/replyToReview",
    async ({ reviewId, replyText }, thunkApi) => {
        try {
            const res = await api.post(`properties/owner/review/reply/${reviewId}`, { replyText }); // 👈 Added properties/ prefix
            return res.data?.data || res.data;
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Update/Edit Owner Reply
export const updateOwnerReplyAction = createAsyncThunk(
    "ownerReviews/updateOwnerReply",
    async ({ reviewId, replyText }, thunkApi) => {
        try {
            const res = await api.put(`properties/owner/review/reply/edit/${reviewId}`, { replyText }); // 👈 Added properties/ prefix
            return res.data?.data || res.data;
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Delete Owner Reply
export const deleteOwnerReplyAction = createAsyncThunk(
    "ownerReviews/deleteOwnerReply",
    async (reviewId, thunkApi) => {
        try {
            await api.delete(`properties/owner/review/reply/delete/${reviewId}`); // 👈 Added properties/ prefix
            return reviewId;
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const ownerReviewsSlice = createSlice({
    name: "ownerReviews",
    initialState: {
        allReviews: [],
        loading: false,
        successMessage: null,
        error: null,
    },
    reducers: {
        clearReviewNotice: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOwnerReviewsFeed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOwnerReviewsFeed.fulfilled, (state, action) => {
                state.loading = false;
                state.allReviews = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchOwnerReviewsFeed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(replyToReviewAction.fulfilled, (state) => {
                state.successMessage = "Host reply posted successfully! 💬";
            })
            .addCase(updateOwnerReplyAction.fulfilled, (state) => {
                state.successMessage = "Host reply modified successfully! ✅";
            })
            .addCase(deleteOwnerReplyAction.fulfilled, (state) => {
                state.successMessage = "Host reply removed completely. 🗑️";
            });
    }
});

export const { clearReviewNotice } = ownerReviewsSlice.actions;
export default ownerReviewsSlice.reducer;