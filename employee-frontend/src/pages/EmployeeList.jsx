import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { UserPlus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import EmployeeModal from '../components/EmployeeModal'; // 1. Make sure this is imported

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    
    // 2. This state controls the modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/employees?page=${page}`);
            setEmployees(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("Error fetching employees", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, [page]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Employee Management</h2>
                {/* 3. The button MUST have this onClick */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-shadow shadow-md"
                >
                    <UserPlus size={18} />
                    <span>Add Employee</span>
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Photo</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Position</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Grade</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {employees.length > 0 ? employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <img 
                                        src={emp.photo_url?.startsWith('http') ? emp.photo_url : `http://localhost:5000${emp.photo_url}`} 
                                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                                        alt="Avatar"
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">{emp.first_name} {emp.last_name}</td>
                                <td className="px-6 py-4 text-slate-600">{emp.position}</td>
                                <td className="px-6 py-4 text-slate-600">{emp.department}</td>
                                <td className="px-6 py-4 text-slate-600 capitalize">{emp.grade}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center space-x-2 text-slate-400">
                                        <button className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                                        <button className="p-1 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic">No employees found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500">Page {page} of {totalPages || 1}</p>
                <div className="flex space-x-2">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50"
                    ><ChevronLeft size={20} /></button>
                    <button 
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50"
                    ><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* 4. This component MUST be inside the return div */}
            <EmployeeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                refreshData={fetchEmployees} 
            />
        </div>
    );
};

export default EmployeeList;