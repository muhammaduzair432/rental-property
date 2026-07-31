import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersDirectory, updateUserRole, purgeUserAccount } from "../../store/adminSlice.js";

export default function AdminUsersDirectory() {
    const dispatch = useDispatch();
    const { usersList = [] } = useSelector((state) => state.admin || {});
    const [selectedRoleChanges, setSelectedRoleChanges] = useState({});

    useEffect(() => {
        dispatch(fetchUsersDirectory());
    }, [dispatch]);

    const handleRoleChangeSubmit = (userId) => {
        const targetRole = selectedRoleChanges[userId];
        if (!targetRole) return;
        dispatch(updateUserRole({ userId, targetRole }));
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
            {/* Hero Banner with Themed Visual & Dark Vignette Filter */}
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
                        Platform Users Directory ({usersList.length})
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        Manage account access levels (User, Owner, Admin) or permanently purge fraudulent accounts from the system.
                    </p>
                </div>
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
                            {usersList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-xs font-bold text-[#8e9192] uppercase tracking-widest">
                                        No registered user accounts found in the directory.
                                    </td>
                                </tr>
                            ) : (
                                usersList.map((u) => (
                                    <tr key={u._id} className="hover:bg-[#0e0e0e] transition-colors">
                                        <td className="py-4 px-5 flex items-center gap-3.5">
                                            {/* Render Actual User Avatar or Fallback Initial */}
                                            {u.avatar ? (
                                                <img 
                                                    src={u.avatar} 
                                                    alt="" 
                                                    className="w-9 h-9 rounded-none object-cover border border-[#444748] shrink-0" 
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-none bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] font-bold flex items-center justify-center text-xs uppercase shrink-0">
                                                    {(u.fullname || u.username || "U").charAt(0)}
                                                </div>
                                            )}
                                            <span className="font-serif font-bold uppercase tracking-wide text-[#e5e2e1]">{u.fullname || u.username}</span>
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
                                        <td className="py-4 px-5 text-right">
                                            <button 
                                                onClick={() => { if(window.confirm("Are you sure you want to permanently purge this account?")) dispatch(purgeUserAccount(u._id)); }} 
                                                className="px-4 py-2.5 bg-[#1c1b1b] hover:bg-[#ffb4ab] text-[#ffb4ab] hover:text-[#380007] border border-[#444748] hover:border-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-md transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}