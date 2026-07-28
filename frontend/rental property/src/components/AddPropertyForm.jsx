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
        formData.append("amenities", combinedAmenities.join(", ")); // Sent as comma-separated string or array

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
        <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-6">
            <div>
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">HOST INVENTORY</span>
                <h3 className="text-base font-bold uppercase tracking-wider text-[#151c27]">Register New Rental Property</h3>
            </div>

            {successMessage && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all">
                    <span>✅</span> {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">Property Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Modern Sunset Beach Villa"
                        required
                        className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">Property Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] bg-white focus:outline-none focus:border-[#151c27]"
                        >
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="villa">Luxury Villa</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">Price Per Night ($)</label>
                        <input
                            type="number"
                            min="0"
                            value={pricePerNight}
                            onChange={(e) => setPricePerNight(e.target.value)}
                            placeholder="450"
                            required
                            className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">Location Address</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Malibu, California"
                        required
                        className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">Description</label>
                    <textarea
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe features, amenities, and surroundings..."
                        required
                        className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                    />
                </div>

                {/* 🛋️ AMENITIES SELECTION SECTION */}
                <div className="space-y-2.5 bg-[#f9f9ff] p-4 rounded-xl border border-[#e2e8f8]">
                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block">
                        Property Amenities <span className="text-gray-400 font-normal">(Select features)</span>
                    </label>
                    
                    {/* Checkbox Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {predefinedAmenities.map((amenity) => {
                            const isChecked = selectedAmenities.includes(amenity);
                            return (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity)}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all text-left flex items-center justify-between cursor-pointer ${
                                        isChecked 
                                            ? "bg-[#151c27] text-white border-[#151c27]" 
                                            : "bg-white text-[#151c27] border-[#e2e8f8] hover:border-gray-400"
                                    }`}
                                >
                                    <span>{amenity}</span>
                                    <span>{isChecked ? "✓" : "+"}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Amenities Text Input */}
                    <div className="pt-1">
                        <label className="text-[9px] font-bold uppercase text-gray-400 block mb-1">
                            Additional Custom Amenities (Comma separated)
                        </label>
                        <input
                            type="text"
                            value={customAmenityInput}
                            onChange={(e) => setCustomAmenityInput(e.target.value)}
                            placeholder="e.g. Ocean View, Private Jacuzzi, BBQ Grill"
                            className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg bg-white font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                        />
                    </div>
                </div>

                {/* 📸 MULTIPLE IMAGES UPLOAD FIELD (Up to 10 images) */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block">
                        Property Gallery Images <span className="text-gray-400 font-normal">(Max 10 files)</span>
                    </label>
                    <label className="border-2 border-dashed border-[#e2e8f8] hover:border-[#151c27] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#f9f9ff] transition-all group">
                        <span className="text-2xl mb-1">📷</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#151c27] group-hover:underline">
                            Click to upload property images
                        </span>
                        <span className="text-[9px] text-[#7d8497] mt-0.5">Supports PNG, JPG, WEBP</span>
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
                        <div className="grid grid-cols-5 gap-2 pt-2">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative h-20 rounded-lg border border-[#e2e8f8] overflow-hidden group">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-black px-1 rounded">
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
                    className="w-full py-3 bg-[#151c27] hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {loading ? "Publishing Property..." : "Publish Listing to Marketplace ✨"}
                </button>
            </form>
        </div>
    );
}