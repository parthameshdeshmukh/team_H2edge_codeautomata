import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { BrowserProvider } from 'ethers';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

const MainLayout = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');

  const adminAddress = '0x400dfd17d59f569ae1D790c1610aF773cA5F9c55';

  const checkAdmin = (address) => {
    if (address.toLowerCase() === adminAddress.toLowerCase()) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const signerAddress = await signer.getAddress();
            setAccount(signerAddress);
            setIsConnected(true);
            checkAdmin(signerAddress);
          }
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
        }
      }
    };

    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setAccount(signerAddress);
        setIsConnected(true);
        checkAdmin(signerAddress);
      } catch (error) {
        console.error('User rejected the request or another error occurred:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app.');
    }
  };

  return (
    <div className="flex min-h-screen bg-app-bg font-sans text-white selection:bg-primary selection:text-white overflow-hidden relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header (Top Bar) */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header
          isConnected={isConnected}
          connectWallet={connectWallet}
          account={account}
        />
      </div>

      {/* Sidebar */}
      <div className="fixed top-20 left-0 h-[calc(100vh-80px)] z-40">
        <Sidebar isAdmin={isAdmin} />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 mt-20 flex flex-col relative z-10 w-full min-h-[calc(100vh-80px)]">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 p-8 md:p-12 overflow-y-auto w-full"
        >
          <Outlet context={{ account, isConnected, isAdmin, connectWallet }} />
        </motion.main>
      </div>

      <ToastContainer
        theme="dark"
        position="bottom-right"
        toastClassName="!bg-glass-surface !backdrop-blur-xl !border !border-white/10 !rounded-xl !text-white !font-sans !shadow-lg"
      />
    </div>
  );
};

export default MainLayout;