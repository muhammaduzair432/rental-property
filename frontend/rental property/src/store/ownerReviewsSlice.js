import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

// Fetch Owner Properties & Reviews Feed
export const fetchOwnerReviewsFeed = createAsyncThunk(
    "ownerReviews/fetchOwnerReviewsFeed",
    async (_, thunkApi) => {
        try {
            const res = await api.get("properties/owner/reviews-feed");
            return res.data?.data || res.data?.properties || res.data || [];
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Reply to a Review
export const replyToReviewAction = createAsyncThunk(
    "ownerReviews/replyToReview",
    async ({ reviewId, comment }, thunkApi) => {
        try {
            const res = await api.post(`properties/owner/review/reply/${reviewId}`, { comment });
            return res.data?.data || res.data?.review || res.data;
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Update/Edit Owner Reply
export const updateOwnerReplyAction = createAsyncThunk(
    "ownerReviews/updateOwnerReply",
    async ({ reviewId, comment }, thunkApi) => {
        try {
            const res = await api.put(`properties/owner/review/reply/edit/${reviewId}`, { comment });
            return res.data?.data || res.data?.review || res.data;
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
            await api.delete(`properties/owner/review/reply/delete/${reviewId}`);
            return reviewId;
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const ownerReviewsSlice = createSlice({
    name: "ownerReviews",
    initialState: {
        propertiesWithReviews: [],
        loading: false,
        actionLoading: false,
        error: null,
        successMessage: null,
    },
    reducers: {
        clearReviewNotice: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Feed
            .addCase(fetchOwnerReviewsFeed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOwnerReviewsFeed.fulfilled, (state, action) => {
                state.loading = false;
                state.propertiesWithReviews = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchOwnerReviewsFeed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reply
            .addCase(replyToReviewAction.fulfilled, (state) => {
                state.successMessage = "Reply posted successfully! 💬";
            })
            // Edit
            .addCase(updateOwnerReplyAction.fulfilled, (state) => {
                state.successMessage = "Reply updated successfully! ✅";
            })
            // Delete
            .addCase(deleteOwnerReplyAction.fulfilled, (state) => {
                state.successMessage = "Reply deleted. 🗑️";
            });
    }
});

export const { clearReviewNotice } = ownerReviewsSlice.actions;
export default ownerReviewsSlice.reducer;