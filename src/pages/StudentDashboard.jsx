import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserProvider, Contract } from 'ethers';
import { abi } from '../scdata/Cert.json';
import { CertModuleCert } from '../scdata/deployed_addresses.json';
import { Award, ShieldCheck, ExternalLink, Eye, LayoutGrid, List, Wallet, Loader2, Search, Filter } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

const StudentDashboard = () => {
    const { account, isConnected, isAdmin, connectWallet } = useOutletContext();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCertificates = async (userAddress) => {
        try {
            setLoading(true);
            const provider = new BrowserProvider(window.ethereum);
            const contract = new Contract(CertModuleCert, abi, provider);

            // Get all certificate IDs for this address
            const certIds = await contract.getCertificatesByAddress(userAddress);

            // Fetch details for each ID
            const certPromises = certIds.map(async (id) => {
                const details = await contract.Certificates(id);
                return {
                    id: id.toString(),
                    name: details[0],
                    course: details[1],
                    grade: details[2],
                    date: details[3],
                    student: details[4]
                };
            });

            const results = await Promise.all(certPromises);
            setCertificates(results.reverse()); // Show newest first
        } catch (error) {
            console.error("Error fetching certificates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (account) {
            fetchCertificates(account);
        } else {
            setCertificates([]);
        }
    }, [account]);

    const filteredCertificates = certificates.filter(cert =>
        cert.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.id.includes(searchTerm)
    );

    return (
        <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold tracking-tight mb-2"
                    >
                        Student Dashboard
                    </motion.h1>
                    <p className="text-gray-400">Manage and view all your blockchain-verified credentials in one portal.</p>
                </div>

                {!account ? (
                    <button
                        onClick={connectWallet}
                        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Wallet className="mr-2" size={18} />
                        Connect Wallet
                    </button>
                ) : (
                    <div className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse" />
                        <span className="text-xs font-mono text-gray-300">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                    </div>
                )}
            </div>

            {account ? (
                <>
                    {/* Stats & Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-4 text-blue-400">
                                <Award size={24} />
                                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/10 px-2 py-1 rounded">Total</span>
                            </div>
                            <div className="text-3xl font-bold">{certificates.length}</div>
                            <div className="text-gray-500 text-sm">Certificates Earned</div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-4 text-green-400">
                                <ShieldCheck size={24} />
                                <span className="text-[10px] uppercase font-bold tracking-widest bg-green-500/10 px-2 py-1 rounded">Security</span>
                            </div>
                            <div className="text-3xl font-bold">100%</div>
                            <div className="text-gray-500 text-sm">Blockchain Verified</div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
                            <Link to="/verify" className="flex items-center justify-between text-gray-300 hover:text-white transition-colors group">
                                <span className="font-semibold">Verify External ID</span>
                                <Search size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by ID or Course..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-blue-500/50 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Certificates Data */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                            <p className="text-gray-400">Scanning Blockchain for your records...</p>
                        </div>
                    ) : filteredCertificates.length > 0 ? (
                        <AnimatePresence mode="wait">
                            {viewMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {filteredCertificates.map((cert) => (
                                        <motion.div
                                            key={cert.id}
                                            whileHover={{ y: -5 }}
                                            className="glass-card rounded-2xl border border-white/10 overflow-hidden group"
                                        >
                                            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">#{cert.id}</span>
                                                    <span className="text-xs font-bold text-green-400 border border-green-400/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified</span>
                                                </div>
                                                <h3 className="text-lg font-bold mb-1 truncate">{cert.course}</h3>
                                                <p className="text-gray-400 text-sm mb-4">Issued: {cert.date}</p>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/viewcertificate/${cert.id}`}
                                                        className="flex-1 flex items-center justify-center py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all border border-white/5"
                                                    >
                                                        <Eye size={16} className="mr-2" />
                                                        View
                                                    </Link>
                                                    <a
                                                        href={`https://sepolia.etherscan.io/address/${CertModuleCert}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-gray-400 hover:text-white"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-card rounded-2xl border border-white/5 overflow-hidden"
                                >
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-white/5 border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">ID</th>
                                                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Course</th>
                                                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Grade</th>
                                                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Date</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredCertificates.map((cert) => (
                                                <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4 font-mono text-gray-400">#{cert.id}</td>
                                                    <td className="px-6 py-4 font-bold text-white">{cert.course}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md font-bold">{cert.grade}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400">{cert.date}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link to={`/viewcertificate/${cert.id}`} className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center">
                                                            Details <ExternalLink size={14} className="ml-1" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        <div className="glass-card rounded-[2rem] p-16 text-center border border-white/5 bg-white/[0.01]">
                            <Award className="mx-auto text-gray-600 mb-6 opacity-40" size={60} />
                            <h3 className="text-2xl font-bold mb-2">No Certificates Found</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mb-8">We couldn't find any certificates linked to this wallet address on the Sepolia network.</p>
                            <button className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm border border-white/10 transition-all">
                                Refresh Registry
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-500/20">
                        <Wallet className="text-blue-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Connection Required</h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-10">To view your personalized certificate collection, please connect your Web3 wallet (MetaMask).</p>
                    <button
                        onClick={connectWallet}
                        className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/40 transition-all active:scale-95"
                    >
                        Select Provider
                    </button>
                </div>
            )}
        </>
    );
};

export default StudentDashboard;
