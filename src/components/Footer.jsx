import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full py-8 border-t border-white/5 backdrop-blur-md bg-[#0f0f11]/80">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>© 2026 CertDapp. All rights reserved.</p>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <div className="w-2 h-2 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                    <span>Built on Ethereum</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
