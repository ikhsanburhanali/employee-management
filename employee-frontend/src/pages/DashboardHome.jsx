import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Users, ShieldCheck, Briefcase, Clock } from 'lucide-react';

const DashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosInstance.get('/admins/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-slate-500">Loading Overview...</div>;

    const statCards = [
        { label: 'Total Employees', value: stats?.totalEmployees, icon: <Users />, color: 'bg-blue-500' },
        { label: 'Admins Online', value: stats?.onlineAdmins, icon: <ShieldCheck />, color: 'bg-green-500' },
        { label: 'Departments', value: stats?.departments.length, icon: <Briefcase />, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-800">System Overview</h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className="flex items-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className={`p-4 rounded-xl text-white mr-4 ${card.color}`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{card.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recently Added Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center">
                            <Clock size={18} className="mr-2 text-blue-500" /> Recently Added
                        </h3>
                    </div>
                    <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-slate-100">
                            {stats?.recentEmployees.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-700">{emp.first_name} {emp.last_name}</td>
                                    <td className="px-6 py-4 text-slate-500">{emp.position}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-blue-600 uppercase">{emp.department}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Dept Distribution */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Department Breakdown</h3>
                    <div className="space-y-4">
                        {stats?.departments.map((dept, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 font-medium">{dept.department || 'Unassigned'}</span>
                                    <span className="text-slate-400">{dept.count} members</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-blue-500 h-full rounded-full" 
                                        style={{ width: `${(dept.count / stats.totalEmployees) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;