import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

const initialState = {
    favorites: [],
    favoriteIds: [],
    loading: false,
    actionLoadingId: null,
    error: null,
    toastMessage: null, // Stores popup messages e.g. { type: 'add'|'remove', text: string }
};

// 1. 🔄 Toggle Favorite Property (POST /api/v2/properties/favorite/:propertyId)
export const toggleFavoriteProperty = createAsyncThunk(
    "favorite/toggleFavoriteProperty",
    async (propertyId, thunkApi) => {
        try {
            const res = await api.post(`properties/favorite/${propertyId}`);
            return { propertyId, data: res.data };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to update favorite status.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

// 2. 📥 Fetch User's Favorites List (GET /api/v2/properties/favorites/my-list)
export const fetchUserFavorites = createAsyncThunk(
    "favorite/fetchUserFavorites",
    async (_, thunkApi) => {
        try {
            const res = await api.get("properties/favorites/my-list");
            const list = res.data?.data || res.data?.favorites || res.data || [];
            return Array.isArray(list) ? list : [];
        } catch (error) {
            return thunkApi.rejectWithValue(
                error.response?.data?.message || "Failed to fetch favorites."
            );
        }
    }
);

const favoriteSlice = createSlice({
    name: "favorite",
    initialState,
    reducers: {
        clearToastMessage: (state) => {
            state.toastMessage = null;
        },
        clearFavoriteError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Favorites ---
            .addCase(fetchUserFavorites.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserFavorites.fulfilled, (state, action) => {
                state.loading = false;
                state.favorites = action.payload;
                state.favoriteIds = action.payload.map((item) =>
                    String(item._id || item.id || item.property?._id || item.property || item)
                );
            })
            .addCase(fetchUserFavorites.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Toggle Favorite (Optimistic State + Popup Notification) ---
            .addCase(toggleFavoriteProperty.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
                state.error = null;

                const targetId = String(action.meta.arg);
                const wasFavorited = state.favoriteIds.includes(targetId);

                if (wasFavorited) {
                    state.favoriteIds = state.favoriteIds.filter((id) => id !== targetId);
                    state.favorites = state.favorites.filter(
                        (item) => String(item._id || item.id || item.property?._id || item.property || item) !== targetId
                    );
                    state.toastMessage = { type: "remove", text: "Property removed from favorites" };
                } else {
                    state.favoriteIds.push(targetId);
                    state.toastMessage = { type: "add", text: "Property saved to your favorites ❤️" };
                }
            })
            .addCase(toggleFavoriteProperty.fulfilled, (state) => {
                state.actionLoadingId = null;
            })
            .addCase(toggleFavoriteProperty.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;

                // Revert optimistic toggle on failure
                const targetId = String(action.meta.arg);
                if (state.favoriteIds.includes(targetId)) {
                    state.favoriteIds = state.favoriteIds.filter((id) => id !== targetId);
                } else {
                    state.favoriteIds.push(targetId);
                }
            });
    },
});

export const { clearToastMessage, clearFavoriteError } = favoriteSlice.actions;
export default favoriteSlice.reducer;