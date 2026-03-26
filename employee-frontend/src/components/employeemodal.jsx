import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const EmployeeModal = ({ isOpen, onClose, refreshData }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) setPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        const formData = new FormData();
        
        // Append all text fields
        Object.keys(data).forEach(key => {
            if (key !== 'photo') formData.append(key, data[key]);
        });

        // Append the photo file separately
        if (data.photo[0]) {
            formData.append('photo', data.photo[0]);
        }

        try {
            await axiosInstance.post('/employees', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Employee added successfully!');
            reset();
            setPreview(null);
            refreshData(); // Refresh the table
            onClose(); // Close modal
        } catch (error) {
            console.error(error);
            alert('Failed to add employee');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between border-b bg-white px-8 py-4">
                    <h2 className="text-xl font-bold text-slate-800">Add New Employee</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50">
                        {preview ? (
                            <img src={preview} className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg mb-4" />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-4"><Upload /></div>
                        )}
                        <input 
                            type="file" 
                            {...register('photo')} 
                            onChange={handlePhotoChange}
                            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Identity */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-blue-600 border-b pb-2">Personal Information</h3>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">First Name</label>
                                <input type="text" {...register('first_name', { required: true })} className="w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Last Name</label>
                                <input type="text" {...register('last_name', { required: true })} className="w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Birth Date</label>
                                    <input type="date" {...register('birth_date')} className="w-full rounded-lg border p-2 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Birth Place</label>
                                    <input type="text" {...register('birth_place')} className="w-full rounded-lg border p-2 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                                <input type="text" {...register('phone_number')} className="w-full rounded-lg border p-2 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Address</label>
                                <textarea {...register('address')} rows="2" className="w-full rounded-lg border p-2 outline-none"></textarea>
                            </div>
                        </div>

                        {/* Professional */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-blue-600 border-b pb-2">Employment Details</h3>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Education</label>
                                <input type="text" {...register('education')} className="w-full rounded-lg border p-2 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Department</label>
                                <input type="text" {...register('department')} className="w-full rounded-lg border p-2 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Position</label>
                                <input type="text" {...register('position')} className="w-full rounded-lg border p-2 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Grade Level</label>
                                <select {...register('grade')} className="w-full rounded-lg border p-2 outline-none bg-white">
                                    <option value="staff">Staff</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="manager">Manager</option>
                                    <option value="vp">VP</option>
                                    <option value="c_level">C Level</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Joined Date</label>
                                <input type="date" {...register('joined_date')} className="w-full rounded-lg border p-2 outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 border-t pt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg disabled:bg-blue-300"
                        >
                            {isLoading ? 'Saving...' : 'Save Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;