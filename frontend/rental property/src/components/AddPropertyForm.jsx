import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProperty, clearPropertyError } from "../store/propertySlice.js";

export default function AddPropertyForm() {
    const dispatch = useDispatch();
    const { loading, error, successMessage } = useSelector((state) => state.properties || {});

    // Form Fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("house");
    const [pricePerNight, setPricePerNight] = useState("");
    const [location, setLocation] = useState("");
    
    // 🛋️ Amenities States
    const predefinedAmenities = ["WiFi", "Pool", "Air Conditioning", "Free Parking", "Kitchen", "Gym", "Smart TV", "Balcony"];
    const [selectedAmenities, setSelectedAmenities] = useState(["WiFi", "Air Conditioning"]);
    const [customAmenityInput, setCustomAmenityInput] = useState("");

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // ⏱️ Auto-dismiss success notification banner after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                dispatch(clearPropertyError());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);

    // Handle multiple image selection (max 10)
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const selectedFiles = files.slice(0, 10); // Limit to 10 files
            setImageFiles(selectedFiles);

            const previews = selectedFiles.map((file) => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    // Toggle Checkbox Amenities
    const toggleAmenity = (amenity) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter((item) => item !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Combine checked amenities and custom typed ones
        const customList = customAmenityInput
            ? customAmenityInput.split(",").map((item) => item.trim()).filter(Boolean)
            : [];
        const combinedAmenities = Array.from(new Set([...selectedAmenities, ...customList]));

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("type", type);
        formData.append("price", pricePerNight); // 👈 Matches backend controller requirement
        formData.append("location", location);
        formData.append("amenities", combinedAmenities.join(", "));

        // Append each image file under the key "images" to match uploadfile.array("images", 10)
        imageFiles.forEach((file) => {
            formData.append("images", file);
        });

        const result = await dispatch(createProperty(formData));
        if (createProperty.fulfilled.match(result)) {
            // Reset form upon success
            setTitle("");
            setDescription("");
            setPricePerNight("");
            setLocation("");
            setCustomAmenityInput("");
            setSelectedAmenities(["WiFi", "Air Conditioning"]);
            setImageFiles([]);
            setImagePreviews([]);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto bg-[#1c1b1b] p-6 sm:p-10 rounded-none border border-[#353535] shadow-2xl space-y-8 text-[#e5e2e1] font-sans antialiased">
            
            {/* Header Section */}
            <div className="border-b border-[#353535] pb-5 space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.25em]">HOST INVENTORY</span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-wider text-[#e5e2e1]">Register New Rental Property</h3>
                <p className="text-xs text-[#c4c7c7] font-sans">Publish verified architectural listings and manage asset details for prospective tenants.</p>
            </div>

            {successMessage && (
                <div className="bg-[#083823]/50 text-[#5ddda1] border border-[#5ddda1] px-4 py-3.5 rounded-none text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                    <span>✓</span> {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-[#1c1b1b] text-[#ffb4ab] border border-[#444748] px-4 py-3.5 rounded-none text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Property Title */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Property Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Modern Sunset Beach Villa"
                        required
                        className="w-full text-xs p-3.5 border border-[#444748] rounded-none font-sans bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] placeholder:text-[#8e9192]"
                    />
                </div>

                {/* Type & Price Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Property Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full text-xs p-3.5 border border-[#444748] rounded-none font-sans bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] cursor-pointer"
                        >
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="villa">Luxury Villa</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Price Per Night ($)</label>
                        <input
                            type="number"
                            min="0"
                            value={pricePerNight}
                            onChange={(e) => setPricePerNight(e.target.value)}
                            placeholder="450"
                            required
                            className="w-full text-xs p-3.5 border border-[#444748] rounded-none font-sans bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] placeholder:text-[#8e9192]"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Location Address</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Malibu, California"
                        required
                        className="w-full text-xs p-3.5 border border-[#444748] rounded-none font-sans bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] placeholder:text-[#8e9192]"
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">Description</label>
                    <textarea
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe features, architectural elements, amenities, and surroundings..."
                        required
                        className="w-full text-xs p-3.5 border border-[#444748] rounded-none font-sans bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] placeholder:text-[#8e9192]"
                    />
                </div>

                {/* 🛋️ AMENITIES SELECTION SECTION */}
                <div className="space-y-3.5 bg-[#0e0e0e] p-5 rounded-none border border-[#353535]">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">
                        Property Amenities <span className="text-[#8e9192] font-normal lowercase">(Select included features)</span>
                    </label>
                    
                    {/* Checkbox Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {predefinedAmenities.map((amenity) => {
                            const isChecked = selectedAmenities.includes(amenity);
                            return (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity)}
                                    className={`px-3.5 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider border transition-all text-left flex items-center justify-between cursor-pointer ${
                                        isChecked 
                                            ? "bg-[#5ddda1] text-[#003823] border-[#5ddda1] shadow-md" 
                                            : "bg-[#1c1b1b] text-[#e5e2e1] border-[#444748] hover:border-[#5ddda1]"
                                    }`}
                                >
                                    <span>{amenity}</span>
                                    <span>{isChecked ? "✓" : "+"}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Amenities Text Input */}
                    <div className="pt-2">
                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8e9192] block mb-1.5">
                            Additional Custom Amenities (Comma separated)
                        </label>
                        <input
                            type="text"
                            value={customAmenityInput}
                            onChange={(e) => setCustomAmenityInput(e.target.value)}
                            placeholder="e.g. Ocean View, Private Jacuzzi, BBQ Grill"
                            className="w-full text-xs p-3 border border-[#444748] rounded-none bg-[#1c1b1b] font-sans text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] placeholder:text-[#8e9192]"
                        />
                    </div>
                </div>

                {/* 📸 MULTIPLE IMAGES UPLOAD FIELD (Up to 10 images) */}
                <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] block">
                        Property Gallery Images <span className="text-[#8e9192] font-normal lowercase">(Max 10 files)</span>
                    </label>
                    <label className="border-2 border-dashed border-[#444748] hover:border-[#5ddda1] rounded-none p-8 flex flex-col items-center justify-center cursor-pointer bg-[#0e0e0e] transition-all group">
                        <span className="text-3xl mb-2 text-[#5ddda1]">📷</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#e5e2e1] group-hover:text-[#5ddda1]">
                            Click to upload property images
                        </span>
                        <span className="text-[9px] text-[#8e9192] mt-1 font-mono uppercase tracking-wider">Supports PNG, JPG, WEBP</span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>

                    {/* Instant Image Grid Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative h-24 rounded-none border border-[#444748] overflow-hidden group bg-[#0e0e0e]">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover filter contrast-110" />
                                    <span className="absolute bottom-1 right-1 bg-[#080808]/90 text-[#5ddda1] text-[9px] font-mono font-bold px-1.5 py-0.5">
                                        #{index + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-xs font-bold uppercase tracking-[0.2em] rounded-none transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2.5 disabled:opacity-40 mt-4"
                >
                    {loading && <div className="w-4 h-4 border-2 border-[#003823] border-t-transparent rounded-none animate-spin"></div>}
                    {loading ? "Publishing Property..." : "Publish Listing to Marketplace ✨"}
                </button>
            </form>
        </div>
    );
}