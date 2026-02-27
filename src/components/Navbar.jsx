import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-[#0f0f11]/50 border-b border-white/5"
    >
      <Link to="/" className="flex items-center space-x-2 group">
        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
          <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">CertDapp</span>
      </Link>

      <div className="flex items-center space-x-6">


        <Link
          to="/verify"
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Verify
        </Link>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Admin Login
        </motion.button>

      </div>
    </motion.nav>
  );
};

export default Navbar;
