import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Activity, Hash, Globe, FileCheck, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { abi } from '../scdata/Cert.json';
import { CertModuleCert } from '../scdata/deployed_addresses.json';

const AdminDashboard = () => {
    const { isAdmin, account } = useOutletContext();

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20">
                    <ShieldAlert className="text-blue-500" size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-3">Administrator Access</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    To view the system dashboard and transaction history, please connect with the authorized Admin Wallet.
                </p>
                <div className="flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5 font-mono text-xs text-blue-400">
                    Current: {account.slice(0, 10)}...{account.slice(-8)}
                </div>
            </div>
        );
    }

    const [stats, setStats] = useState({
        totalCertificates: 'Loading...',
        network: 'Loading...',
        lastTxHash: 'Waiting...',
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        if (!window.ethereum) return;
        setLoading(true);
        try {
            const provider = new BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            const signer = await provider.getSigner();
            const contract = new Contract(CertModuleCert, abi, provider); // Read-only is fine for stats

            // Get Network Name
            const networkName = network.name === 'unknown' ? 'Sepolia' : network.name; // Fallback for some RPCs

            // Query Events
            // Filter "Issued" events from the beginning
            const filter = contract.filters.Issued();
            const events = await contract.queryFilter(filter);

            // Total Certificates
            const total = events.length;

            // Last Transaction Hash & Recent Activity
            let lastHash = 'No transactions yet';
            let recentData = [];

            if (events.length > 0) {
                const adddress = events[events.length - 1]; // Last event
                lastHash = `${adddress.transactionHash.slice(0, 6)}...${adddress.transactionHash.slice(-4)}`;

                // Process last 5 events (reverse order)
                const last5Events = events.slice(-5).reverse();

                // Fetch full details for these certificates from the mapping
                const promises = last5Events.map(async (event) => {
                    const id = event.args[2]; // Index 2 is 'id' based on ABI
                    // event.args: [student, course, id, grade]
                    // But we need name and date from the mapping
                    const certDetails = await contract.Certificates(id);
                    return {
                        id: id.toString(),
                        name: certDetails[0], // name is first returned value
                        course: certDetails[1], // course
                        grade: certDetails[2], // grade
                        date: certDetails[3], // date
                        student: certDetails[4], // student address
                        txHash: event.transactionHash
                    };
                });

                recentData = await Promise.all(promises);
            }

            setStats({
                totalCertificates: total.toString(),
                network: networkName.charAt(0).toUpperCase() + networkName.slice(1),
                lastTxHash: lastHash,
            });
            setRecentActivity(recentData);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setStats(prev => ({ ...prev, totalCertificates: 'Error', network: 'Error' }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const cards = [
        { title: 'Total Certificates Issued', value: stats.totalCertificates, icon: FileCheck, color: 'text-blue-400' },
        { title: 'Network Status', value: stats.network, icon: Globe, color: 'text-green-400' },
        { title: 'Last Transaction Hash', value: stats.lastTxHash, icon: Activity, color: 'text-purple-400' },
        {
            title: 'Smart Contract Address',
            value: `${CertModuleCert.slice(0, 6)}...${CertModuleCert.slice(-4)}`,
            icon: Hash,
            color: 'text-orange-400',
            link: `https://sepolia.etherscan.io/address/${CertModuleCert}`
        },
    ];

    return (
        <div className="w-full h-full text-white">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-4">
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <button
                        onClick={fetchDashboardData}
                        className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''} text-gray-400`} />
                    </button>
                </div>
                <div className="flex items-center space-x-3">

                    <Link
                        to="/issuecertificate"
                        className="flex items-center px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95 font-semibold"
                    >
                        <Plus size={20} className="mr-2" />
                        Issue New Certificate
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 rounded-2xl glass-card transition-all duration-300 ${stat.link ? 'cursor-pointer hover:bg-white/5' : ''
                            }`}
                        onClick={() => stat.link && window.open(stat.link, '_blank')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            {stat.link && <ExternalLink size={16} className="text-gray-500" />}
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-2xl font-bold text-white tracking-wide">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10 rounded-2xl glass-card overflow-hidden"
            >
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xl font-semibold">Recent Activity</h3>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="animate-spin text-primary mb-2" size={32} />
                            <p className="text-gray-400 text-sm">Loading blockchain data...</p>
                        </div>
                    ) : recentActivity.length > 0 ? (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="uppercase tracking-wider border-b border-white/5 bg-white/5">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold text-gray-400">ID</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-gray-400">Recipient</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-gray-400">Course</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-gray-400">Grade</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-gray-400">Date</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-gray-400">Transaction</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-gray-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentActivity.map((item, index) => (
                                    <tr key={index} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-white/80">#{item.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{item.name}</span>
                                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                                                    {item.student?.slice(0, 6)}...{item.student?.slice(-4)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{item.course}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.grade === 'S' || item.grade === 'A' ? 'bg-green-500/20 text-green-400' :
                                                'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {item.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{item.date}</td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:text-blue-400 flex items-center space-x-1"
                                            >
                                                <span className="font-mono">{item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}</span>
                                                <ExternalLink size={12} />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/viewcertificate/${item.id}`}
                                                className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-gray-400 text-center py-12 italic flex flex-col items-center">
                            <Activity className="mb-2 opacity-50" size={32} />
                            No certificates issued yet on this network.
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
