import React from 'react';
import { FilePlus, LayoutDashboard, Wallet, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isAdmin }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-64 h-full bg-[#0f0f11]/40 backdrop-blur-md border-r border-white/5 flex flex-col">
            <nav className="flex-1 px-4 py-8 space-y-2 mt-4">
                {/* Admin Portal - CRITICAL: Locked to Admin Wallet Only */}
                {isAdmin && (
                    <div className="space-y-1 mb-8">
                        <p className="px-4 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">
                            Admin Control
                        </p>
                        <Link
                            to="/dashboard"
                            className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group font-bold text-[14px] ${isActive('/dashboard')
                                ? 'bg-primary text-white shadow-xl shadow-blue-500/30'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <LayoutDashboard size={18} className={`mr-3 ${isActive('/dashboard') ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                            Admin Dashboard
                        </Link>
                        <Link
                            to="/issuecertificate"
                            className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group font-medium text-[14px] ${isActive('/issuecertificate')
                                ? 'bg-primary text-white shadow-lg shadow-blue-500/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <FilePlus size={18} className={`mr-3 ${isActive('/issuecertificate') ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                            Issue Certificate
                        </Link>
                    </div>
                )}

                {/* Student Portal - Public Features */}
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                        Student Access
                    </p>
                    <Link
                        to="/verify"
                        className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group font-medium text-[14px] ${isActive('/verify')
                            ? 'bg-primary text-white shadow-lg shadow-blue-500/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <ShieldCheck size={18} className={`mr-3 ${isActive('/verify') ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                        Verify System
                    </Link>
                </div>
            </nav>


        </aside>
    );
};

export default Sidebar;
