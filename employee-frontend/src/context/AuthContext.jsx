// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check local storage for an existing session on app load
        const storedAdmin = localStorage.getItem('admin');
        const token = localStorage.getItem('token');
        
        if (storedAdmin && token) {
            setAdmin(JSON.parse(storedAdmin));
        }
        setLoading(false);

        // --- THE "REVOKE ACCESS" LISTENER ---
        // Intercept responses to catch 401 Unauthorized errors globally
        const interceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    // If the backend rejects the token (e.g., access revoked), force logout
                    logout();
                    alert("Your session has expired or your access was revoked.");
                }
                return Promise.reject(error);
            }
        );

        return () => axiosInstance.interceptors.response.eject(interceptor);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('admin', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setAdmin(userData);
        navigate('/dashboard');
    };

    const logout = async () => {
        try {
            // Tell the backend we are logging out (sets is_online to false)
            if (admin) {
                await axiosInstance.post('/auth/logout', { adminId: admin.id });
            }
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            localStorage.removeItem('admin');
            localStorage.removeItem('token');
            setAdmin(null);
            navigate('/login');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <AuthContext.Provider value={{ admin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};