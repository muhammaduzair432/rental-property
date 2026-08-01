import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchOwnerProperties, deletePropertyListing, updatePropertyDetails, clearPropertyError } from "../store/propertySlice.js";

const predefinedAmenities = ["WiFi", "Pool", "Air Conditioning", "Free Parking", "Kitchen", "Gym", "Smart TV", "Balcony"];

export default function OwnerPropertiesList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // ⚡ FIXED: Read `loadingAction` to track update/delete loading states precisely
    const { ownerProperties = [], loadingOwnerList, loadingAction, successMessage } = useSelector((state) => state.properties || {});

    const [editingProperty, setEditingProperty] = useState(null);

    // Edit form states
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    
    // Images management states
    const [currentImages, setCurrentImages] = useState([]); // Existing URLs kept
    const [newImageFiles, setNewImageFiles] = useState([]); // New File objects to upload
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
        if (loadingAction) return;
        if (window.confirm("Are you sure you want to permanently remove this property listing? This action cannot be undone.")) {
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
        
        // Normalize existing images from property object safely
        const rawImages = property.images || [];
        const singleImage = property.image ? [property.image] : [];
        const combinedExisting = Array.from(new Set([...singleImage, ...rawImages])).filter(Boolean);
        
        setCurrentImages(combinedExisting);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        setSelectedAmenities(property.amenities || []);
        setCustomAmenityInput("");
    };

    const handleRemoveExistingImage = (indexToRemove) => {
        if (loadingAction) return;
        setCurrentImages(currentImages.filter((_, idx) => idx !== indexToRemove));
    };

    // 📸 Robust accumulative new image selection handler for editing
    const handleNewImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const combinedFiles = [...newImageFiles, ...files].slice(0, 10);
            setNewImageFiles(combinedFiles);
            setNewImagePreviews(combinedFiles.map((file) => URL.createObjectURL(file)));
        }
    };

    const handleRemoveNewPreview = (indexToRemove) => {
        if (loadingAction) return;
        const updatedFiles = newImageFiles.filter((_, idx) => idx !== indexToRemove);
        const updatedPreviews = newImagePreviews.filter((_, idx) => idx !== indexToRemove);
        setNewImageFiles(updatedFiles);
        setNewImagePreviews(updatedPreviews);
    };

    const toggleAmenity = (amenity) => {
        if (loadingAction) return;
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(item => item !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingProperty || loadingAction) return;
        
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

        // 📸 Append each staged file under the exact key "images" expected by backend upload middleware
        if (newImageFiles && newImageFiles.length > 0) {
            newImageFiles.forEach((file) => {
                formData.append("images", file);
            });
        }

        const result = await dispatch(updatePropertyDetails({ propertyId: pId, formData }));
        if (updatePropertyDetails.fulfilled.match(result)) {
            setEditingProperty(null);
            // ⚡ Instantly re-fetch inventory to synchronize newly uploaded image paths from DB
            dispatch(fetchOwnerProperties());
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">

            {/* Header Section */}
            <div className="bg-[#1c1b1b] p-6 sm:p-8 rounded-none border border-[#353535] shadow-2xl space-y-2">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.25em]">HOST INVENTORY</span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-wider text-[#e5e2e1]">
                    My Published Properties ({ownerProperties.length})
                </h2>
                <p className="text-xs text-[#c4c7c7] font-sans max-w-3xl">
                    Manage your active real estate portfolio listings. Click on a card to view details, or use the actions below to update pricing, images, amenities, or remove units.
                </p>
            </div>

            {successMessage && (
                <div className="bg-[#083823]/50 text-[#5ddda1] border border-[#5ddda1] px-4 py-3.5 rounded-none text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                    <span>✓</span> {successMessage}
                </div>
            )}

            {/* 🏡 Property Grid Section */}
            {loadingOwnerList ? (
                <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[#1c1b1b] border border-[#353535]">
                    <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
                    <div className="text-[10px] font-bold tracking-[0.25em] text-[#8e9192] uppercase font-mono">
                        Loading Portfolio...
                    </div>
                </div>
            ) : ownerProperties.length === 0 ? (
                <div className="bg-[#1c1b1b] p-12 border border-dashed border-[#444748] text-center text-xs font-bold text-[#8e9192] uppercase rounded-none tracking-widest shadow-2xl">
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
                                onClick={() => navigate(`/property/${pId}`)}
                                className="bg-[#1c1b1b] border border-[#353535] hover:border-[#5ddda1] rounded-none overflow-hidden shadow-2xl flex flex-col cursor-pointer group transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {/* Image Container */}
                                <div className="h-52 bg-[#0e0e0e] relative border-b border-[#353535] overflow-hidden">
                                    {mainImg ? (
                                        <img 
                                            src={mainImg} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#8e9192] uppercase tracking-wider">
                                            No Asset Image
                                        </div>
                                    )}
                                    {/* Price Tag */}
                                    <span className="absolute bottom-3 left-3 px-3 py-1.5 bg-[#080808]/90 text-[#5ddda1] text-[10px] font-black rounded-none uppercase tracking-wider border border-[#5ddda1]">
                                        ${item.pricePerNight || item.price || "0"} / night
                                    </span>
                                    {/* Ref ID */}
                                    <span className="absolute top-2 right-2 bg-[#080808]/90 text-[#8e9192] text-[8px] font-mono px-2 py-0.5 uppercase tracking-wider border border-[#444748]">
                                        REF: {pId.slice(-6)}
                                    </span>
                                </div>

                                {/* Content Body */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                                    <div className="space-y-2">
                                        {/* Type & Status Header */}
                                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                                            <span className="text-[#5ddda1] bg-[#083823] px-2 py-0.5 border border-[#5ddda1]">
                                                {item.type || "Rental Unit"}
                                            </span>
                                            <span className={item.isApproved ? "text-[#5ddda1]" : "text-[#ffdf9e]"}>
                                                ● {item.isApproved ? "Verified" : "Pending Review"}
                                            </span>
                                        </div>
                                        {/* Title & Description */}
                                        <h4 className="text-sm font-serif font-bold uppercase text-[#e5e2e1] group-hover:text-[#5ddda1] transition-colors line-clamp-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-[#c4c7c7] font-sans line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-[#353535]">
                                        <button 
                                            onClick={(e) => startEditing(e, item)}
                                            className="flex-1 py-2.5 bg-[#1c1b1b] hover:bg-[#353535] border border-[#444748] text-[#e5e2e1] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer transition-all shadow-md"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(e, pId)}
                                            className="flex-1 py-2.5 bg-[#1c1b1b] hover:bg-[#ffb4ab] text-[#ffb4ab] hover:text-[#380007] border border-[#444748] hover:border-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer transition-all shadow-md"
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

            {/* ✏️ EDIT MODAL SECTION ✏️ */}
            {editingProperty && (
                <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-[#080808]/90 backdrop-blur-md p-4 overflow-y-auto">
                    <form onSubmit={handleUpdateSubmit} className="bg-[#1c1b1b] border border-[#353535] w-full max-w-3xl rounded-none shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] relative">
                        
                        {/* ⚡ THEMED LOADING PROGRESS BAR ANIMATION */}
                        {loadingAction && (
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0e0e0e] overflow-hidden z-50">
                                <div className="w-full h-full bg-[#5ddda1] animate-[pulse_1s_infinite] shadow-[0_0_12px_#5ddda1]"></div>
                            </div>
                        )}

                        {/* Modal Header */}
                        <div className="bg-[#0e0e0e] border-b border-[#353535] px-6 py-5 flex items-center justify-between sticky top-0 z-10">
                            <h3 className="text-xs font-bold uppercase text-[#e5e2e1] tracking-widest">
                                Edit Listing: <span className="text-[#5ddda1] font-mono">{editingProperty.title}</span>
                            </h3>
                            <button 
                                type="button" 
                                disabled={loadingAction}
                                onClick={() => setEditingProperty(null)} 
                                className="font-bold text-[#8e9192] hover:text-[#5ddda1] cursor-pointer px-2 py-1 text-sm transition-colors disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scrollable Modal Body */}
                        <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
                            
                            {/* Basic Info Fields */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Title</label>
                                    <input type="text" value={title} disabled={loadingAction} onChange={(e) => setTitle(e.target.value)} required className="w-full text-xs p-3.5 border border-[#444748] rounded-none font-sans bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] disabled:opacity-50" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Price Per Night ($)</label>
                                        <input type="number" value={price} disabled={loadingAction} onChange={(e) => setPrice(e.target.value)} required className="w-full text-xs p-3.5 border border-[#444748] rounded-none font-sans bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] disabled:opacity-50" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Location</label>
                                        <input type="text" value={location} disabled={loadingAction} onChange={(e) => setLocation(e.target.value)} required className="w-full text-xs p-3.5 border border-[#444748] rounded-none font-sans bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] disabled:opacity-50" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Description</label>
                                    <textarea rows="4" value={description} disabled={loadingAction} onChange={(e) => setDescription(e.target.value)} required className="w-full text-xs p-3.5 border border-[#444748] rounded-none font-sans bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] resize-none disabled:opacity-50" />
                                </div>
                            </div>

                            {/* 🖼️ Manage Images Section */}
                            <div className="space-y-3.5 border-t border-[#353535] pt-5">
                                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">
                                    Manage Existing Images <span className="text-[#8e9192] font-normal lowercase">(Click '✕' to stage for removal)</span>
                                </label>
                                
                                {/* Existing Images Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {currentImages.map((imgUrl, idx) => (
                                        <div key={idx} className="relative h-24 rounded-none border border-[#444748] overflow-hidden group bg-[#0e0e0e]">
                                            <img src={imgUrl} alt={`Existing ${idx}`} className="w-full h-full object-cover filter contrast-110" />
                                            {!loadingAction && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(idx)}
                                                    className="absolute top-1 right-1 bg-[#ffb4ab] text-[#380007] rounded-none w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow hover:bg-white cursor-pointer transition-colors"
                                                    title="Remove image"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block pt-3">Upload New Images</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    disabled={loadingAction}
                                    onChange={handleNewImagesChange} 
                                    className="w-full text-xs text-[#c4c7c7] file:mr-4 file:py-2.5 file:px-4 file:rounded-none file:border-0 file:text-[9px] file:font-bold file:uppercase file:bg-[#5ddda1] file:text-[#003823] file:cursor-pointer hover:file:bg-[#08a56e] bg-[#0e0e0e] border border-[#444748] disabled:opacity-50" 
                                />
                                
                                {/* Newly Selected Image Previews Grid */}
                                {newImagePreviews.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8e9192] block">Staged New Uploads:</span>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {newImagePreviews.map((src, idx) => (
                                                <div key={idx} className="relative h-24 rounded-none border border-[#5ddda1] overflow-hidden bg-[#0e0e0e]">
                                                    <img src={src} alt={`New Preview ${idx}`} className="w-full h-full object-cover filter contrast-110" />
                                                    <span className="absolute bottom-1 left-1 bg-[#5ddda1] text-[#003823] text-[8px] px-1.5 py-0.5 font-bold uppercase">NEW</span>
                                                    {!loadingAction && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveNewPreview(idx)}
                                                            className="absolute top-1 right-1 bg-[#ffb4ab] text-[#380007] rounded-none w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow hover:bg-white cursor-pointer transition-colors"
                                                            title="Remove new preview"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 🛋️ Amenities Section */}
                            <div className="space-y-3.5 border-t border-[#353535] pt-5">
                                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Property Amenities</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {predefinedAmenities.map((amenity) => {
                                        const isChecked = selectedAmenities.includes(amenity);
                                        return (
                                            <button
                                                key={amenity}
                                                type="button"
                                                disabled={loadingAction}
                                                onClick={() => toggleAmenity(amenity)}
                                                className={`px-3.5 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider border transition-all text-left flex items-center justify-between cursor-pointer disabled:opacity-50 ${
                                                    isChecked 
                                                        ? "bg-[#5ddda1] text-[#003823] border-[#5ddda1] shadow-md" 
                                                        : "bg-[#0e0e0e] text-[#e5e2e1] border-[#444748] hover:border-[#5ddda1]"
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
                                    disabled={loadingAction}
                                    onChange={(e) => setCustomAmenityInput(e.target.value)}
                                    placeholder="Add custom amenities (comma separated)..."
                                    className="w-full text-xs p-3.5 border border-[#444748] rounded-none bg-[#0e0e0e] font-sans text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-[#0e0e0e] border-t border-[#353535] px-6 py-4 flex justify-end gap-3 sticky bottom-0 z-10">
                            <button 
                                type="button" 
                                disabled={loadingAction}
                                onClick={() => setEditingProperty(null)} 
                                className="px-5 py-2.5 bg-[#1c1b1b] hover:bg-[#353535] text-[#c4c7c7] border border-[#444748] text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loadingAction}
                                className="px-6 py-2.5 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer transition-all shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {loadingAction && <div className="w-3.5 h-3.5 border-2 border-[#003823] border-t-transparent rounded-none animate-spin"></div>}
                                {loadingAction ? "Saving Updates..." : "Save Updates"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}