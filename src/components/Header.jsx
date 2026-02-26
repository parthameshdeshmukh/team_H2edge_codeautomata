import React from 'react';
import { Wallet, Bell, Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ isConnected, connectWallet, account }) => {
    return (
        <header className="flex items-center justify-between h-20 px-8 backdrop-blur-md bg-[#0f0f11]/50 border-b border-white/5 w-full">
            <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
                    <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                    CertDapp
                </h1>
            </Link>

            <div className="flex items-center space-x-6">
                {!isConnected ? (
                    <button
                        onClick={connectWallet}
                        className="flex items-center px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 active:scale-95"
                    >
                        <Wallet size={18} className="mr-2" />
                        <span className="font-semibold text-[15px]">Connect Wallet</span>
                    </button>
                ) : (
                    <>
                        <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                {account.slice(2, 4)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-medium">Connected</span>
                                <span className="text-sm font-semibold text-white leading-none">
                                    {account.slice(0, 6)}...{account.slice(-4)}
                                </span>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-white font-medium text-sm transition-colors" onClick={() => window.location.reload()}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
