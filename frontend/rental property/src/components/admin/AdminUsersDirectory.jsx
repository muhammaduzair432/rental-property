import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersDirectory, updateUserRole, suspendUserAccount, fetchTargetUserDetails } from "../../store/adminSlice.js";

export default function AdminUsersDirectory() {
    const dispatch = useDispatch();
    const { usersList = [], selectedUserDossier } = useSelector((state) => state.admin || {});
    const [selectedRoleChanges, setSelectedRoleChanges] = useState({});

    // Target User Modal Drawer States
    const [activeTargetUser, setActiveTargetUser] = useState(null);
    const [loadingDossier, setLoadingDossier] = useState(false);

    // Filter states
    const [userTimeRange, setUserTimeRange] = useState("latest"); 
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [selectedUserYear, setSelectedUserYear] = useState("2026");
    const [selectedUserMonth, setSelectedUserMonth] = useState("8");

    const [dossierTimeRange, setDossierTimeRange] = useState("latest");
    const [dossierYear, setDossierYear] = useState("2026");
    const [dossierMonth, setDossierMonth] = useState("8");
    const [dossierSearch, setDossierSearch] = useState("");

    useEffect(() => {
        dispatch(fetchUsersDirectory());
    }, [dispatch]);

    const handleOpenDossier = async (user) => {
        setActiveTargetUser(user);
        setLoadingDossier(true);
        await dispatch(fetchTargetUserDetails(user._id));
        setLoadingDossier(false);
    };

    const handleRoleChangeSubmit = (userId) => {
        const targetRole = selectedRoleChanges[userId];
        if (!targetRole) return;
        dispatch(updateUserRole({ userId, targetRole }));
    };

    const handleSuspendToggle = (u) => {
        const nextState = !u.isSuspended;
        const actionLabel = nextState ? "suspend and lock" : "unsuspend and unlock";
        if (window.confirm(`Are you sure you want to ${actionLabel} account [${u.username}]?`)) {
            dispatch(suspendUserAccount({ userId: u._id, suspend: nextState }));
        }
    };

    // 🕒 Time-Range Filtering Logic for Users Directory
    const filterUsersByTime = (list) => {
        if (!Array.isArray(list)) return [];
        const sortedList = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (userTimeRange === "latest") return sortedList.slice(0, 10);

        const now = new Date();
        return sortedList.filter((u) => {
            const uDate = new Date(u.createdAt);
            if (isNaN(uDate.getTime())) return true; 

            if (userTimeRange === "daily") return (now - uDate) / (1000 * 60 * 60) <= 24;
            if (userTimeRange === "weekly") return (now - uDate) / (1000 * 60 * 60 * 24) <= 7;
            if (userTimeRange === "monthly") return uDate.getMonth() + 1 === parseInt(selectedUserMonth) && uDate.getFullYear().toString() === selectedUserYear;
            if (userTimeRange === "yearly") return uDate.getFullYear().toString() === selectedUserYear;
            return true;
        });
    };

    // 🕒 Time-Range Filtering Logic for Dossier Items
    const filterDossierItemsByTime = (itemList) => {
        if (!Array.isArray(itemList)) return [];
        const sortedList = [...itemList].sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));

        if (dossierTimeRange === "latest") return sortedList.slice(0, 10);

        const now = new Date();
        return sortedList.filter((item) => {
            const itemDate = new Date(item.createdAt || item.startDate);
            if (isNaN(itemDate.getTime())) return true; 

            if (dossierTimeRange === "daily") return (now - itemDate) / (1000 * 60 * 60) <= 24;
            if (dossierTimeRange === "weekly") return (now - itemDate) / (1000 * 60 * 60 * 24) <= 7;
            if (dossierTimeRange === "monthly") return itemDate.getMonth() + 1 === parseInt(dossierMonth) && itemDate.getFullYear().toString() === dossierYear;
            if (dossierTimeRange === "yearly") return itemDate.getFullYear().toString() === dossierYear;
            return true;
        });
    };

    const filteredUsersList = filterUsersByTime(usersList).filter((u) => {
        const fullname = u.fullname || "";
        const username = u.username || "";
        const email = u.email || "";
        const query = userSearchQuery.toLowerCase();

        return fullname.toLowerCase().includes(query) || 
               username.toLowerCase().includes(query) || 
               email.toLowerCase().includes(query);
    });

    const bookings = selectedUserDossier?.bookings || [];
    const properties = selectedUserDossier?.properties || [];
    const earningsSummary = selectedUserDossier?.earningsSummary || {};
    const isOwner = activeTargetUser?.role === "owner";

    const filteredBookings = filterDossierItemsByTime(bookings).filter((b) => {
        const title = b.property?.title || "";
        const status = b.status || "";
        return title.toLowerCase().includes(dossierSearch.toLowerCase()) || status.toLowerCase().includes(dossierSearch.toLowerCase());
    });

    const filteredProperties = filterDossierItemsByTime(properties).filter((p) => {
        return p.title?.toLowerCase().includes(dossierSearch.toLowerCase()) || p.location?.toLowerCase().includes(dossierSearch.toLowerCase());
    });

    const availableYears = ["2026", "2025", "2024", "2023", "2022"];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
            {/* Hero Banner */}
            <div className="relative w-full h-64 sm:h-80 bg-[#0e0e0e] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-end p-6 sm:p-10">
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=90')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30"></div>

                <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        USER ACCOUNT MANAGEMENT
                    </span>
                    <h2 className="text-xl sm:text-3xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">
                        {userTimeRange === "latest" ? "Latest Platform Users (Top 10)" : `Platform Users Directory (${filteredUsersList.length})`}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        {userTimeRange === "latest"
                            ? "Displaying recent registrations. Select 'All' or filter by time range / search by name, username, or email."
                            : "Manage account access levels or click any user to inspect their comprehensive operational ledger."
                        }
                    </p>
                </div>
            </div>

            {/* Time Matrix Filter Bar */}
            <div className="bg-[#1c1b1b] p-4 sm:p-5 border border-[#353535] shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-wrap gap-1.5 bg-[#0e0e0e] p-1.5 border border-[#353535]">
                    {["latest", "all", "daily", "weekly", "monthly", "yearly"].map((range) => (
                        <button
                            key={range}
                            onClick={() => setUserTimeRange(range)}
                            className={`px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none ${
                                userTimeRange === range
                                    ? "bg-[#5ddda1] text-[#003823] shadow-md"
                                    : "text-[#8e9192] hover:text-[#e5e2e1] bg-[#1c1b1b]"
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">📅 Calendar:</span>
                    
                    <select
                        value={selectedUserYear}
                        onChange={(e) => {
                            setSelectedUserYear(e.target.value);
                            setUserTimeRange("yearly");
                        }}
                        className="text-xs bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] px-3 py-2 rounded-none focus:outline-none focus:border-[#5ddda1] font-mono cursor-pointer"
                    >
                        {availableYears.map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                        ))}
                    </select>

                    <select
                        value={selectedUserMonth}
                        onChange={(e) => {
                            setSelectedUserMonth(e.target.value);
                            setUserTimeRange("monthly");
                        }}
                        className="text-xs bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] px-3 py-2 rounded-none focus:outline-none focus:border-[#5ddda1] font-mono cursor-pointer"
                    >
                        {[
                            {val: "1", name: "January"}, {val: "2", name: "February"}, {val: "3", name: "March"},
                            {val: "4", name: "April"}, {val: "5", name: "May"}, {val: "6", name: "June"},
                            {val: "7", name: "July"}, {val: "8", name: "August"}, {val: "9", name: "September"},
                            {val: "10", name: "October"}, {val: "11", name: "November"}, {val: "12", name: "December"}
                        ].map(m => (
                            <option key={m.val} value={m.val}>{m.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-[#1c1b1b] p-4 sm:p-5 border border-[#353535] shadow-xl">
                <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by user name, username, or email address..."
                    className="w-full text-xs p-3.5 border border-[#444748] rounded-none bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] placeholder:text-[#8e9192]"
                />
            </div>

            {/* Users Directory Table Card */}
            <div className="bg-[#1c1b1b] rounded-none border border-[#353535] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#353535] bg-[#0e0e0e] text-[#8e9192] uppercase font-bold text-[9px] tracking-[0.2em]">
                                <th className="py-4 px-5">Account</th>
                                <th className="py-4 px-5">Email</th>
                                <th className="py-4 px-5">Current Role</th>
                                <th className="py-4 px-5">Change Role</th>
                                <th className="py-4 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#353535] font-medium text-[#e5e2e1]">
                            {filteredUsersList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-xs font-bold text-[#8e9192] uppercase tracking-widest">
                                        No registered user accounts found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsersList.map((u) => (
                                    <tr key={u._id} className={`hover:bg-[#0e0e0e] transition-colors ${u.isSuspended ? "bg-[#2a1215]/30" : ""}`}>
                                        <td className="py-4 px-5 flex items-center gap-3.5">
                                            {u.avatar ? (
                                                <img 
                                                    src={u.avatar} 
                                                    alt="" 
                                                    className="w-9 h-9 rounded-none object-cover border border-[#444748] shrink-0 cursor-pointer" 
                                                    onClick={() => handleOpenDossier(u)}
                                                />
                                            ) : (
                                                <div 
                                                    className="w-9 h-9 rounded-none bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] font-bold flex items-center justify-center text-xs uppercase shrink-0 cursor-pointer"
                                                    onClick={() => handleOpenDossier(u)}
                                                >
                                                    {(u.fullname || u.username || "U").charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span 
                                                        onClick={() => handleOpenDossier(u)}
                                                        className="font-serif font-bold uppercase tracking-wide text-[#e5e2e1] cursor-pointer hover:text-[#5ddda1] transition-colors block"
                                                    >
                                                        {u.fullname || u.username}
                                                    </span>
                                                    {u.isSuspended && (
                                                        <span className="px-1.5 py-0.2 bg-[#2a1215] text-[#ffb4ab] border border-[#ffb4ab]/50 text-[8px] font-bold uppercase tracking-widest">
                                                            Suspended
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-[#8e9192] font-mono">@{u.username || "handle"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 text-[#c4c7c7] font-mono">{u.email}</td>
                                        <td className="py-4 px-5">
                                            <span className="px-2.5 py-1 bg-[#0e0e0e] text-[#5ddda1] border border-[#353535] rounded-none font-bold uppercase text-[9px] tracking-widest">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 flex items-center gap-2.5">
                                            <select 
                                                defaultValue={u.role}
                                                onChange={(e) => setSelectedRoleChanges({ ...selectedRoleChanges, [u._id]: e.target.value })}
                                                className="border border-[#444748] p-2.5 rounded-none text-xs font-bold bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] cursor-pointer"
                                            >
                                                <option value="user">User</option>
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button 
                                                onClick={() => handleRoleChangeSubmit(u._id)} 
                                                className="px-4 py-2.5 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-md transition-all shrink-0"
                                            >
                                                Save
                                            </button>
                                        </td>
                                        <td className="py-4 px-5 text-right space-x-2">
                                            <button 
                                                onClick={() => handleOpenDossier(u)} 
                                                className="px-3.5 py-2.5 bg-[#083823] hover:bg-[#5ddda1] text-[#5ddda1] hover:text-[#003823] border border-[#5ddda1] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-md transition-all"
                                            >
                                                Inspect
                                            </button>
                                            <button 
                                                onClick={() => handleSuspendToggle(u)} 
                                                className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-md transition-all border ${
                                                    u.isSuspended 
                                                        ? "bg-[#083823] text-[#5ddda1] border-[#5ddda1] hover:bg-[#5ddda1] hover:text-[#003823]" 
                                                        : "bg-[#1c1b1b] text-[#ffb4ab] border-[#444748] hover:bg-[#ffb4ab] hover:text-[#380007]"
                                                }`}
                                            >
                                                {u.isSuspended ? "Unsuspend" : "Suspend"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 📋 TARGETED USER DOSSIER MODAL DRAWER */}
            {activeTargetUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
                    <div className="w-full max-w-4xl bg-[#131313] border-l border-[#353535] h-full overflow-y-auto p-6 sm:p-10 space-y-8 shadow-2xl">
                        
                        <div className="flex justify-between items-start border-b border-[#353535] pb-6">
                            <div className="flex items-center gap-4">
                                {activeTargetUser.avatar ? (
                                    <img src={activeTargetUser.avatar} alt="" className="w-16 h-16 object-cover border border-[#5ddda1]" />
                                ) : (
                                    <div className="w-16 h-16 bg-[#1c1b1b] text-[#5ddda1] border border-[#5ddda1] font-bold flex items-center justify-center text-2xl uppercase">
                                        {(activeTargetUser.fullname || "U").charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <span className="text-[9px] font-bold text-[#5ddda1] uppercase tracking-[0.2em]">
                                        {activeTargetUser.role} Dossier Audit
                                    </span>
                                    <h3 className="text-xl font-serif font-bold uppercase text-[#e5e2e1]">
                                        {activeTargetUser.fullname || activeTargetUser.username}
                                    </h3>
                                    <p className="text-xs text-[#8e9192] font-mono">{activeTargetUser.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTargetUser(null)}
                                className="px-4 py-2 bg-[#1c1b1b] hover:bg-[#ffb4ab] text-[#ffb4ab] hover:text-[#380007] border border-[#444748] text-xs font-bold uppercase tracking-widest cursor-pointer"
                            >
                                Close ✕
                            </button>
                        </div>

                        {loadingDossier ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-3">
                                <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent animate-spin"></div>
                                <div className="text-[10px] font-bold tracking-[0.25em] text-[#8e9192] uppercase font-mono">
                                    Compiling Target Ledger...
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                
                                {isOwner && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-[#1c1b1b] p-5 border border-[#353535] shadow-xl space-y-1">
                                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">Overall Gross Earnings</span>
                                            <h4 className="text-xl font-serif font-bold text-[#5ddda1]">${Number(earningsSummary.grossEarnings || 0).toLocaleString()}</h4>
                                        </div>
                                        <div className="bg-[#1c1b1b] p-5 border border-[#353535] shadow-xl space-y-1">
                                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">Approved Properties</span>
                                            <h4 className="text-xl font-serif font-bold text-[#e5e2e1]">{properties.length} <span className="text-xs font-sans uppercase text-[#8e9192]">Units</span></h4>
                                        </div>
                                        <div className="bg-[#1c1b1b] p-5 border border-[#353535] shadow-xl space-y-1">
                                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">Confirmed Bookings</span>
                                            <h4 className="text-xl font-serif font-bold text-[#5ddda1]">{bookings.filter(b => b.status === "confirmed").length}</h4>
                                        </div>
                                        <div className="bg-[#1c1b1b] p-5 border border-[#353535] shadow-xl space-y-1">
                                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">Rejected / Cancelled</span>
                                            <h4 className="text-xl font-serif font-bold text-[#ffb4ab]">{bookings.filter(b => b.status === "cancelled" || b.status === "rejected").length}</h4>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-[#1c1b1b] p-4 border border-[#353535] space-y-4">
                                    <div className="flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex flex-wrap gap-1 bg-[#0e0e0e] p-1 border border-[#353535]">
                                            {["latest", "all", "daily", "weekly", "monthly", "yearly"].map((range) => (
                                                <button
                                                    key={range}
                                                    onClick={() => setDossierTimeRange(range)}
                                                    className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none ${
                                                        dossierTimeRange === range ? "bg-[#5ddda1] text-[#003823]" : "text-[#8e9192] hover:text-[#e5e2e1]"
                                                    }`}
                                                >
                                                    {range}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={dossierSearch}
                                        onChange={(e) => setDossierSearch(e.target.value)}
                                        placeholder="Search dossier items..."
                                        className="w-full text-xs p-3 border border-[#444748] bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1]"
                                    />
                                </div>

                                {!isOwner && (
                                    <div className="bg-[#1c1b1b] p-6 border border-[#353535] space-y-4">
                                        <h4 className="text-sm font-serif font-bold uppercase text-[#e5e2e1]">Booking & Cancellation History ({filteredBookings.length})</h4>
                                        <div className="overflow-x-auto border border-[#353535]">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-[#353535] bg-[#0e0e0e] text-[#8e9192] uppercase font-bold text-[9px] tracking-[0.2em]">
                                                        <th className="py-3 px-4">Property Unit</th>
                                                        <th className="py-3 px-4">Dates</th>
                                                        <th className="py-3 px-4">Status</th>
                                                        <th className="py-3 px-4 text-right">Cost</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#353535]">
                                                    {filteredBookings.length === 0 ? (
                                                        <tr><td colSpan="4" className="py-8 text-center text-xs text-[#8e9192] uppercase">No records found.</td></tr>
                                                    ) : (
                                                        filteredBookings.map((b) => (
                                                            <tr key={b._id}>
                                                                <td className="py-3 px-4 font-bold uppercase">{b.property?.title || "Property"}</td>
                                                                <td className="py-3 px-4 font-mono">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</td>
                                                                <td className="py-3 px-4 uppercase font-bold text-[9px]">
                                                                    <span className={`px-2 py-0.5 border ${b.status === "confirmed" ? "bg-[#083823] text-[#5ddda1]" : "bg-[#2a1215] text-[#ffb4ab]"}`}>{b.status}</span>
                                                                </td>
                                                                <td className="py-3 px-4 text-right font-mono font-bold text-[#5ddda1]">${b.totalPrice}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {isOwner && (
                                    <div className="bg-[#1c1b1b] p-6 border border-[#353535] space-y-4">
                                        <h4 className="text-sm font-serif font-bold uppercase text-[#e5e2e1]">Approved Properties Portfolio ({filteredProperties.length})</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredProperties.length === 0 ? (
                                                <div className="col-span-full py-8 text-center text-xs text-[#8e9192] uppercase">No approved properties.</div>
                                            ) : (
                                                filteredProperties.map((prop) => {
                                                    const propBookings = bookings.filter(b => String(b.property?._id || b.property) === String(prop._id) && b.status === "confirmed");
                                                    const propEarnings = propBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

                                                    return (
                                                        <div key={prop._id} className="bg-[#0e0e0e] border border-[#353535] p-4 space-y-2">
                                                            <h5 className="font-bold text-xs uppercase text-[#e5e2e1]">{prop.title}</h5>
                                                            <p className="text-[10px] text-[#8e9192] font-mono">{prop.location}</p>
                                                            <div className="flex justify-between items-center pt-2 border-t border-[#353535] text-xs">
                                                                <span className="text-[#8e9192] font-mono text-[9px]">Rate: ${prop.price}/night</span>
                                                                <span className="text-[#5ddda1] font-mono font-bold">Revenue: ${propEarnings.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}

                                {isOwner && (
                                    <div className="bg-[#1c1b1b] p-6 border border-[#353535] space-y-4">
                                        <h4 className="text-sm font-serif font-bold uppercase text-[#e5e2e1]">Confirmed & Rejected Bookings History ({filteredBookings.length})</h4>
                                        <div className="overflow-x-auto border border-[#353535]">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-[#353535] bg-[#0e0e0e] text-[#8e9192] uppercase font-bold text-[9px] tracking-[0.2em]">
                                                        <th className="py-3 px-4">Property Unit</th>
                                                        <th className="py-3 px-4">Tenant</th>
                                                        <th className="py-3 px-4">Dates</th>
                                                        <th className="py-3 px-4">Status</th>
                                                        <th className="py-3 px-4 text-right">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#353535]">
                                                    {filteredBookings.length === 0 ? (
                                                        <tr><td colSpan="5" className="py-8 text-center text-xs text-[#8e9192] uppercase">No booking records found.</td></tr>
                                                    ) : (
                                                        filteredBookings.map((b) => (
                                                            <tr key={b._id}>
                                                                <td className="py-3 px-4 font-bold uppercase">{b.property?.title || "Property"}</td>
                                                                <td className="py-3 px-4">{b.user?.fullname || b.user?.username || "Tenant"}</td>
                                                                <td className="py-3 px-4 font-mono">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</td>
                                                                <td className="py-3 px-4 uppercase font-bold text-[9px]">
                                                                    <span className={`px-2 py-0.5 border ${b.status === "confirmed" ? "bg-[#083823] text-[#5ddda1]" : "bg-[#2a1215] text-[#ffb4ab]"}`}>{b.status}</span>
                                                                </td>
                                                                <td className="py-3 px-4 text-right font-mono font-bold text-[#5ddda1]">${b.totalPrice}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}