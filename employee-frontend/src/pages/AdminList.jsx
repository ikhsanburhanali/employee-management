import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Shield, UserX, Circle } from 'lucide-react';

const AdminList = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAdmins = async () => {
        try {
            const res = await axiosInstance.get('/admins');
            setAdmins(res.data);
        } catch (err) {
            console.error("Failed to fetch admins", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const handleRevoke = async (adminId) => {
        if (!window.confirm("Are you sure you want to revoke access? This will force the user to log out.")) return;
        
        try {
            await axiosInstance.post(`/admins/${adminId}/revoke`);
            alert("Access revoked successfully.");
            fetchAdmins(); // Refresh the list
        } catch (err) {
            alert("Error revoking access.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Administrator Management</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                    <div key={admin.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{admin.username}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Circle size={10} className={admin.is_online ? "fill-green-500 text-green-500" : "fill-slate-300 text-slate-300"} />
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            {admin.is_online ? "Online Now" : "Offline"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleRevoke(admin.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Revoke Access"
                            >
                                <UserX size={20} />
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 text-xs text-slate-400">
                            Role: System Administrator
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminList;