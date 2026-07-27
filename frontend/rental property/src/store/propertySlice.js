import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

const initialState = {
    properties: [],
    selectedProperty: null,
    
    // Split into separate loading flags to prevent UI collisions
    loadingList: false,
    loadingDetails: false,
    loadingCreation: false, // 👈 Added loading state for property creation
    
    errorList: null,
    errorDetails: null,
    errorCreation: null,   // 👈 Added error state for property creation
    successMessage: null,  // 👈 Added success tracker for property creation
};

// 1. Thunk: Fetch All Approved Properties
export const fetchProperties = createAsyncThunk(
    "properties/fetchProperties",
    async (_, thunkApi) => {
        try {
            const res = await api.get("properties/browse");
            return res.data?.properties || res.data?.data || res.data || [];
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

// 2. Thunk: Fetch Single Property Details by ID
export const fetchPropertyById = createAsyncThunk(
    "properties/fetchPropertyById",
    async (propertyId, thunkApi) => {
        try {
            const res = await api.get(`properties/details/${propertyId}`);
            return (
                res.data?.propertyDetails || 
                res.data?.property || 
                res.data?.data || 
                res.data
            );
        } catch (error) {
            console.error("=== PROPERTY DETAILS FETCH ERROR ===", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to load property details.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

// 3. 🏡 Thunk: Create New Property (POST /api/v2/properties/store for Owners)
export const createProperty = createAsyncThunk(
    "properties/createProperty",
    async (formData, thunkApi) => {
        try {
            // Sends FormData containing text fields + array of 'images' (up to 10 files)
            // Matches backend: router.route("/store").post(verifyJwt, authorizeRoles("owner"), uploadfile.array("images", 10), createProperty)
            const res = await api.post("properties/store", formData);

            return res.data?.data || res.data?.property || res.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to publish property listing.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

const propertySlice = createSlice({
    name: "properties",
    initialState,
    reducers: {
        clearSelectedProperty: (state) => {
            state.selectedProperty = null;
            state.errorDetails = null;
            state.loadingDetails = false;
        },
        clearPropertyError: (state) => {
            state.errorList = null;
            state.errorDetails = null;
            state.errorCreation = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // ------------------ MAIN LIST LIFECYCLE ------------------
            .addCase(fetchProperties.pending, (state) => {
                state.loadingList = true;
                state.errorList = null;
            })
            .addCase(fetchProperties.fulfilled, (state, action) => {
                state.loadingList = false;
                state.properties = action.payload;
            })
            .addCase(fetchProperties.rejected, (state, action) => {
                state.loadingList = false;
                state.errorList = action.payload || "Failed to fetch properties.";
            })

            // ------------------ MODAL DETAILS LIFECYCLE ------------------
            .addCase(fetchPropertyById.pending, (state) => {
                state.loadingDetails = true; 
                state.errorDetails = null;
                state.selectedProperty = null;
            })
            .addCase(fetchPropertyById.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.selectedProperty = action.payload;
            })
            .addCase(fetchPropertyById.rejected, (state, action) => {
                state.loadingDetails = false;
                state.errorDetails = action.payload || "Failed to load property details.";
            })

            // ------------------ PROPERTY CREATION LIFECYCLE (OWNER) ------------------
            .addCase(createProperty.pending, (state) => {
                state.loadingCreation = true;
                state.errorCreation = null;
                state.successMessage = null;
            })
            .addCase(createProperty.fulfilled, (state, action) => {
                state.loadingCreation = false;
                state.successMessage = "Property published successfully! 🏡";
                if (action.payload) {
                    state.properties.unshift(action.payload);
                }
            })
            .addCase(createProperty.rejected, (state, action) => {
                state.loadingCreation = false;
                state.errorCreation = action.payload || "Failed to publish property listing.";
            });
    }
});

export const { clearSelectedProperty, clearPropertyError } = propertySlice.actions;
export default propertySlice.reducer;