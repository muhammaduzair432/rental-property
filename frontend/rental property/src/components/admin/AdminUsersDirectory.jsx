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
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-2">
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">USER ACCOUNT MANAGEMENT</span>
                <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">Platform Users Directory ({usersList.length})</h2>
                <p className="text-xs text-gray-500">Manage account roles (User, Owner, Admin) or permanently purge accounts.</p>
            </div>

            <div className="bg-white rounded-xl border border-[#e2e8f8] overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-[#e2e8f8] text-[#7d8497] uppercase font-bold text-[9px]">
                            <th className="py-3 px-4">Account</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Current Role</th>
                            <th className="py-3 px-4">Change Role</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f8] font-medium text-[#151c27]">
                        {usersList.map((u) => (
                            <tr key={u._id} className="hover:bg-[#f9f9ff]">
                                <td className="py-3 px-4 flex items-center gap-3">
                                    {/* 👤 Render Actual User Avatar or Fallback Initial */}
                                    {u.avatar ? (
                                        <img 
                                            src={u.avatar} 
                                            alt="" 
                                            className="w-8 h-8 rounded-full object-cover border border-[#e2e8f8] shrink-0" 
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[#151c27] text-white font-bold flex items-center justify-center text-xs uppercase shrink-0">
                                            {(u.fullname || u.username || "U").charAt(0)}
                                        </div>
                                    )}
                                    <span className="font-bold">{u.fullname || u.username}</span>
                                </td>
                                <td className="py-3 px-4 text-gray-500">{u.email}</td>
                                <td className="py-3 px-4"><span className="px-2 py-0.5 bg-gray-100 rounded font-bold uppercase text-[9px]">{u.role}</span></td>
                                <td className="py-3 px-4 flex items-center gap-2">
                                    <select 
                                        defaultValue={u.role}
                                        onChange={(e) => setSelectedRoleChanges({ ...selectedRoleChanges, [u._id]: e.target.value })}
                                        className="border p-1 rounded text-xs font-bold bg-white"
                                    >
                                        <option value="user">User</option>
                                        <option value="owner">Owner</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button onClick={() => handleRoleChangeSubmit(u._id)} className="px-3 py-1 bg-[#151c27] text-white text-[10px] font-bold uppercase rounded cursor-pointer hover:bg-black">Save</button>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button onClick={() => { if(window.confirm("Purge account?")) dispatch(purgeUserAccount(u._id)); }} className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase rounded cursor-pointer hover:bg-red-600 hover:text-white">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}