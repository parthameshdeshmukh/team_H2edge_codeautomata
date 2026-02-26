import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingLayout = () => {
    return (
        <div className="relative min-h-screen bg-[#0f0f11] text-white selection:bg-blue-500/30 overflow-x-hidden">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default LandingLayout;
