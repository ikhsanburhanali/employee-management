import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Users, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Employees', path: '/dashboard/employees', icon: <Users size={20} /> },
        { name: 'Administrators', path: '/dashboard/admins', icon: <ShieldCheck size={20} /> },
    ];

    return (
        <div className="flex h-screen w-64 flex-col bg-slate-900 text-white shadow-xl">
            <div className="flex h-20 items-center justify-center border-b border-slate-800">
                <h1 className="text-xl font-bold tracking-tighter text-blue-400">HRIS PRO</h1>
            </div>
            
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                                isActive 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <button 
                onClick={logout}
                className="flex items-center space-x-3 border-t border-slate-800 p-6 text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
    );
};

export default Sidebar;