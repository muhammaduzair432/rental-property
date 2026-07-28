import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

const initialState = {
    properties: [],          // General marketplace / browse list
    ownerProperties: [],     // 👈 Dedicated state slot for owner's personal inventory
    selectedProperty: null,
    
    // Separate loading flags to prevent UI collisions
    loadingList: false,
    loadingOwnerList: false, // 👈 Loading state for owner inventory
    loadingDetails: false,
    loadingCreation: false, 
    loadingAction: false,    // 👈 Loading state for updates/deletions
    
    errorList: null,
    errorOwnerList: null,
    errorDetails: null,
    errorCreation: null,   
    errorAction: null,
    successMessage: null,  
};

// 1. Thunk: Fetch All Approved Properties (Marketplace Browse)
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

// 3. Thunk: Create New Property (POST /api/v2/properties/store for Owners)
export const createProperty = createAsyncThunk(
    "properties/createProperty",
    async (formData, thunkApi) => {
        try {
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

// 4. 🏢 Thunk: Fetch Owner's Personal Inventory List (GET /api/v2/properties/my-inventory)
export const fetchOwnerProperties = createAsyncThunk(
    "properties/fetchOwnerProperties",
    async (_, thunkApi) => {
        try {
            const res = await api.get("properties/my-inventory");
            return res.data?.data || res.data?.properties || res.data || [];
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch your property inventory.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

// 5. ✏️ Thunk: Update Property Details (PUT /api/v2/properties/update/:propertyId)
export const updatePropertyDetails = createAsyncThunk(
    "properties/updatePropertyDetails",
    async ({ propertyId, formData }, thunkApi) => {
        try {
            const res = await api.put(`properties/update/${propertyId}`, formData);
            return res.data?.data || res.data?.property || res.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to update property details.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

// 6. 🗑️ Thunk: Permanently Remove Property Listing (DELETE /api/v2/properties/delete/:propertyId)
export const deletePropertyListing = createAsyncThunk(
    "properties/deletePropertyListing",
    async (propertyId, thunkApi) => {
        try {
            await api.delete(`properties/delete/${propertyId}`);
            return propertyId;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete property listing.";
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
            state.errorOwnerList = null;
            state.errorDetails = null;
            state.errorCreation = null;
            state.errorAction = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // ------------------ MAIN BROWSE LIST ------------------
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

            // ------------------ MODAL DETAILS ------------------
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

            // ------------------ PROPERTY CREATION (OWNER) ------------------
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
                    state.ownerProperties.unshift(action.payload);
                }
            })
            .addCase(createProperty.rejected, (state, action) => {
                state.loadingCreation = false;
                state.errorCreation = action.payload || "Failed to publish property listing.";
            })

            // ------------------ FETCH OWNER INVENTORY (/my-inventory) ------------------
            .addCase(fetchOwnerProperties.pending, (state) => {
                state.loadingOwnerList = true;
                state.errorOwnerList = null;
            })
            .addCase(fetchOwnerProperties.fulfilled, (state, action) => {
                state.loadingOwnerList = false;
                state.ownerProperties = action.payload;
            })
            .addCase(fetchOwnerProperties.rejected, (state, action) => {
                state.loadingOwnerList = false;
                state.errorOwnerList = action.payload || "Failed to load your inventory.";
            })

            // ------------------ UPDATE PROPERTY DETAILS (/update/:id) ------------------
            .addCase(updatePropertyDetails.pending, (state) => {
                state.loadingAction = true;
                state.errorAction = null;
            })
            .addCase(updatePropertyDetails.fulfilled, (state, action) => {
                state.loadingAction = false;
                state.successMessage = "Property updated successfully! ✅";
                const updated = action.payload;
                const targetId = updated._id || updated.id;
                
                // Update in owner properties inventory
                state.ownerProperties = state.ownerProperties.map(p => 
                    (p._id || p.id) === targetId ? updated : p
                );
                // Update in general browse list if present
                state.properties = state.properties.map(p => 
                    (p._id || p.id) === targetId ? updated : p
                );
            })
            .addCase(updatePropertyDetails.rejected, (state, action) => {
                state.loadingAction = false;
                state.errorAction = action.payload || "Failed to update property.";
            })

            // ------------------ DELETE PROPERTY LISTING (/delete/:id) ------------------
            .addCase(deletePropertyListing.pending, (state) => {
                state.loadingAction = true;
                state.errorAction = null;
            })
            .addCase(deletePropertyListing.fulfilled, (state, action) => {
                state.loadingAction = false;
                const deletedId = action.payload;
                state.successMessage = "Property listing removed permanently. 🗑️";
                
                // Remove from owner inventory and general list
                state.ownerProperties = state.ownerProperties.filter(p => (p._id || p.id) !== deletedId);
                state.properties = state.properties.filter(p => (p._id || p.id) !== deletedId);
            })
            .addCase(deletePropertyListing.rejected, (state, action) => {
                state.loadingAction = false;
                state.errorAction = action.payload || "Failed to delete property.";
            });
    }
});

export const { clearSelectedProperty, clearPropertyError } = propertySlice.actions;
export default propertySlice.reducer;