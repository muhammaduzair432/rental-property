import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // 👈 Imported useNavigate for full-page routing
import { fetchOwnerProperties, deletePropertyListing, updatePropertyDetails, clearPropertyError } from "../store/propertySlice.js";

const predefinedAmenities = ["WiFi", "Pool", "Air Conditioning", "Free Parking", "Kitchen", "Gym", "Smart TV", "Balcony"];

export default function OwnerPropertiesList() {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // 👈 Initialized navigate hook
    const { ownerProperties = [], loadingOwnerList, successMessage } = useSelector((state) => state.properties || {});

    const [editingProperty, setEditingProperty] = useState(null);

    // Edit form states
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    
    // Images management states
    const [currentImages, setCurrentImages] = useState([]); // URLs kept
    const [newImageFiles, setNewImageFiles] = useState([]); // New files to upload
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    // Amenities management states
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [customAmenityInput, setCustomAmenityInput] = useState("");

    useEffect(() => {
        dispatch(fetchOwnerProperties());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => dispatch(clearPropertyError()), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to permanently remove this property listing?")) {
            dispatch(deletePropertyListing(id));
        }
    };

    const startEditing = (e, property) => {
        e.stopPropagation();
        setEditingProperty(property);
        setTitle(property.title || "");
        setPrice(property.pricePerNight || property.price || "");
        setLocation(property.location || "");
        setDescription(property.description || "");
        setCurrentImages(property.images || property.image ? [property.image, ...(property.images || [])].filter(Boolean) : []);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        setSelectedAmenities(property.amenities || []);
        setCustomAmenityInput("");
    };

    const handleRemoveExistingImage = (indexToRemove) => {
        setCurrentImages(currentImages.filter((_, idx) => idx !== indexToRemove));
    };

    const handleNewImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const selectedFiles = files.slice(0, 10);
            setNewImageFiles(selectedFiles);
            setNewImagePreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
        }
    };

    const toggleAmenity = (amenity) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(item => item !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const pId = editingProperty._id || editingProperty.id;

        const customList = customAmenityInput
            ? customAmenityInput.split(",").map((item) => item.trim()).filter(Boolean)
            : [];
        const combinedAmenities = Array.from(new Set([...selectedAmenities, ...customList]));

        const formData = new FormData();
        formData.append("title", title);
        formData.append("price", price);
        formData.append("location", location);
        formData.append("description", description);
        formData.append("existingImages", JSON.stringify(currentImages));
        formData.append("amenities", combinedAmenities.join(", "));

        // Append new files if selected
        if (newImageFiles && newImageFiles.length > 0) {
            newImageFiles.forEach((file) => {
                formData.append("images", file);
            });
        }

        const result = await dispatch(updatePropertyDetails({ propertyId: pId, formData }));
        if (updatePropertyDetails.fulfilled.match(result)) {
            setEditingProperty(null);
            dispatch(fetchOwnerProperties());
        }
    };

    return (
        <div className="space-y-6">

            {/* Edit Modal with Images & Amenities Management */}
            {editingProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <form onSubmit={handleUpdateSubmit} className="bg-white border border-[#e2e8f8] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-[#151c27]">Edit Property Listing, Images & Amenities</h3>
                            <button type="button" onClick={() => setEditingProperty(null)} className="font-bold text-gray-400 hover:text-black cursor-pointer">✕</button>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full text-xs p-2.5 border rounded-lg font-bold text-[#151c27]" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">Price Per Night ($)</label>
                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full text-xs p-2.5 border rounded-lg font-bold text-[#151c27]" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">Location</label>
                                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full text-xs p-2.5 border rounded-lg font-bold text-[#151c27]" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">Description</label>
                            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full text-xs p-2.5 border rounded-lg text-[#151c27]" />
                        </div>

                        {/* 🖼️ Manage Images Section */}
                        <div className="space-y-2 border-t pt-3">
                            <label className="text-[10px] font-bold uppercase text-[#7d8497] block">Manage Current Images (Click 'X' to remove)</label>
                            <div className="grid grid-cols-4 gap-2">
                                {currentImages.map((imgUrl, idx) => (
                                    <div key={idx} className="relative h-20 rounded-lg border overflow-hidden group">
                                        <img src={imgUrl} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(idx)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-700 cursor-pointer"
                                            title="Remove image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <label className="text-[10px] font-bold uppercase text-[#7d8497] block pt-2">Upload New Images</label>
                            <input type="file" accept="image/*" multiple onChange={handleNewImagesChange} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#151c27] file:text-white hover:file:bg-black cursor-pointer" />
                            
                            {newImagePreviews.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 pt-2">
                                    {newImagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative h-20 rounded-lg border overflow-hidden">
                                            <img src={src} alt={`New Preview ${idx}`} className="w-full h-full object-cover" />
                                            <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[8px] px-1 rounded font-bold">NEW</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 🛋️ Amenities Section */}
                        <div className="space-y-2 border-t pt-3">
                            <label className="text-[10px] font-bold uppercase text-[#7d8497] block">Property Amenities</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {predefinedAmenities.map((amenity) => {
                                    const isChecked = selectedAmenities.includes(amenity);
                                    return (
                                        <button
                                            key={amenity}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all text-left flex items-center justify-between cursor-pointer ${
                                                isChecked ? "bg-[#151c27] text-white border-[#151c27]" : "bg-white text-[#151c27] border-[#e2e8f8]"
                                            }`}
                                        >
                                            <span>{amenity}</span>
                                            <span>{isChecked ? "✓" : "+"}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <input
                                type="text"
                                value={customAmenityInput}
                                onChange={(e) => setCustomAmenityInput(e.target.value)}
                                placeholder="Add custom amenities (comma separated)..."
                                className="w-full text-xs p-2 border rounded-lg mt-1 text-[#151c27]"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button type="button" onClick={() => setEditingProperty(null)} className="px-4 py-2 bg-gray-100 text-xs font-bold uppercase rounded-lg cursor-pointer">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-[#151c27] text-white text-xs font-bold uppercase rounded-lg cursor-pointer hover:bg-black">Save Updates</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-2">
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">HOST INVENTORY</span>
                <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">My Published Properties ({ownerProperties.length})</h2>
                <p className="text-xs text-gray-500">Manage your active real estate portfolio listings, update pricing, images, amenities, or remove units.</p>
            </div>

            {successMessage && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                    {successMessage}
                </div>
            )}

            {loadingOwnerList ? (
                <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-[#151c27] border-t-transparent rounded-full animate-spin"></div></div>
            ) : ownerProperties.length === 0 ? (
                <div className="bg-white p-12 border border-dashed border-[#e2e8f8] text-center text-xs font-bold text-gray-400 uppercase rounded-xl tracking-wider">
                    No custom owner properties registered yet. Go to 'Add Property' to create your first listing.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownerProperties.map((item) => {
                        const pId = item._id || item.id;
                        const mainImg = item.image || item.images?.[0];
                        return (
                            <div 
                                key={pId} 
                                onClick={() => navigate(`/property/${pId}`)} // 👈 Instantly navigates to PropertyDetailsPage on click
                                className="bg-white border border-[#e2e8f8] hover:border-[#151c27] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between cursor-pointer group transition-all"
                            >
                                <div className="h-48 bg-[#f9f9ff] relative border-b border-[#e2e8f8]">
                                    {mainImg ? (
                                        <img src={mainImg} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-gray-400 uppercase">No Image</div>
                                    )}
                                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-[#151c27] text-white text-[10px] font-black rounded uppercase">
                                        ${item.pricePerNight || item.price || "0"} / night
                                    </span>
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-[#7d8497]">
                                            <span>{item.type || "Unit"}</span>
                                            <span className={item.isApproved ? "text-emerald-600" : "text-amber-600"}>
                                                {item.isApproved ? "● Verified" : "● Pending Review"}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold uppercase tracking-wide text-[#151c27] group-hover:underline line-clamp-1">{item.title}</h4>
                                        <p className="text-[11px] text-[#45464c] line-clamp-2">{item.description}</p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-[#e2e8f8]">
                                        <button 
                                            onClick={(e) => startEditing(e, item)}
                                            className="flex-1 py-1.5 bg-[#f9f9ff] hover:bg-gray-200 border text-[#151c27] text-[10px] font-bold uppercase rounded cursor-pointer"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(e, pId)}
                                            className="flex-1 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 text-[10px] font-bold uppercase rounded cursor-pointer"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}