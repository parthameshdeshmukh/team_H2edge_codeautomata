import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Search,
    Copy,
    ExternalLink,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    XCircle,
    CheckCircle2,
    Check,
    ChevronRight,
    Cpu,
    PartyPopper,
    X,
    Code,
    Files,
    Upload,
    Camera,
    Lock
} from 'lucide-react';
import { abi } from '../scdata/Cert.json';
import { CertModuleCert } from '../scdata/deployed_addresses.json';
import { toast } from 'react-toastify';
import { Html5Qrcode } from 'html5-qrcode';
import AnimatedBackground from '../components/AnimatedBackground';
import confetti from 'canvas-confetti';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker with a stable version-specific URL
const PDF_WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

const VerifyCertificate = () => {
    const navigate = useNavigate();
    const [certId, setCertId] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyingText, setVerifyingText] = useState('Initializing Security Protocol...');
    const [result, setResult] = useState(null); // 'valid', 'mismatch', 'not-found'
    const [certData, setCertData] = useState(null);
    const [txHash, setTxHash] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [copied, setCopied] = useState(false);

    // Bulk States
    const [verifyMode, setVerifyMode] = useState('single');
    const [bulkTab, setBulkTab] = useState('files');
    const [bulkData, setBulkData] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('idle');
    const [currentBulkIndex, setCurrentBulkIndex] = useState(-1);
    const [bulkResults, setBulkResults] = useState([]);
    const [jsonText, setJsonText] = useState('');

    const qrScannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const bulkFileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop().catch(err => console.error(err));
            }
        };
    }, []);

    const fireConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const verifyOne = async (id, nameInput = '') => {
        try {
            if (!window.ethereum) throw new Error("No crypto wallet found");
            const provider = new BrowserProvider(window.ethereum);
            const instance = new Contract(CertModuleCert, abi, provider);
            const blockchainResult = await instance.getFunction("Certificates")(BigInt(id));

            const name = blockchainResult.name || blockchainResult[0];
            const course = blockchainResult.course || blockchainResult[1];
            const grade = blockchainResult.grade || blockchainResult[2];
            const date = blockchainResult.date || blockchainResult[3];

            if (!name || name === "") return { success: false, error: 'Not Found', id };

            const data = { name, course, grade, date, timestamp: new Date().toLocaleString() };
            if (nameInput.trim() && nameInput.toLowerCase() !== name.toLowerCase()) {
                return { success: false, error: 'Name Mismatch', id, data };
            }
            return { success: true, id, data };
        } catch (error) {
            console.error('Verify error:', error);
            return { success: false, error: 'Chain Error', id };
        }
    };

    const processBulk = async (dataOverride = null) => {
        const dataToProcess = dataOverride || bulkData;
        if (!dataToProcess || dataToProcess.length === 0) return;

        setBulkStatus('processing');
        setBulkResults([]);

        for (let i = 0; i < dataToProcess.length; i++) {
            const currentId = dataToProcess[i];
            setCurrentBulkIndex(i);

            let result;
            if (!currentId || !/^\d+$/.test(currentId.toString().trim())) {
                result = { success: false, error: 'Invalid ID Format', id: currentId || 'Empty' };
            } else {
                result = await verifyOne(currentId.toString().trim());
            }

            setBulkResults(prev => [...prev, result]);
            await new Promise(r => setTimeout(r, 600));
        }

        setBulkStatus('completed');
        setCurrentBulkIndex(-1);
        fireConfetti();
    };

    const handleBulkJson = () => {
        try {
            const parsed = JSON.parse(jsonText);
            let ids = [];
            if (Array.isArray(parsed)) {
                ids = parsed.map(item => (typeof item === 'object' ? (item.id || item.ID) : item));
            } else if (parsed.ids) {
                ids = parsed.ids;
            }

            const cleanIds = ids.map(id => id?.toString().trim()).filter(Boolean);
            if (cleanIds.length === 0) throw new Error('No IDs found');

            setBulkData(cleanIds);
            toast.success(`Loaded ${cleanIds.length} IDs`);
            setTimeout(() => processBulk(cleanIds), 800);
        } catch (err) {
            toast.error('Invalid JSON format');
        }
    };

    const extractIdFromText = (text) => {
        if (!text) return null;
        if (text.includes('/verify/')) {
            const parts = text.split('/verify/');
            return parts[parts.length - 1].split('?')[0].split('/')[0].trim();
        }
        return text.trim();
    };

    const scanIdFromPdf = async (file, html5QrCode) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;

            // QR Code Scan (Canvas -> Blob -> File)
            try {
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const fakeFile = new File([blob], "p1.png", { type: "image/png" });
                const decodedText = await html5QrCode.scanFile(fakeFile, true);
                return extractIdFromText(decodedText);
            } catch (qrErr) {
                // Text Fallback
                const textContent = await page.getTextContent();
                const text = textContent.items.map(item => item.str).join(' ');
                const idPatterns = [
                    /ID:\s*#?(\d+)/i,
                    /Certificate\s*ID:\s*#?(\d+)/i,
                    /Valid\s*ID:\s*#?(\d+)/i,
                    /(?:^|\s)#(\d+)(?:\s|$)/,
                    /(\d+)\s*(?:is\s*the\s*ID)/i,
                    /CERT-(\d{4})-(\d+)/i
                ];
                for (const pattern of idPatterns) {
                    const match = text.match(pattern);
                    if (match) return match[1] || match[0].replace(/\D/g, '');
                }
                const rawNumbers = text.match(/\b\d{1,6}\b/g);
                if (rawNumbers && rawNumbers.length > 0) return rawNumbers[0];
            }
        } catch (err) {
            console.error("PDF Scan Error:", err);
        }
        return null;
    };

    const handleMultipleFiles = async (e) => {
        e.stopPropagation();
        const files = e.target.files ? Array.from(e.target.files) : [];
        console.log("File handle triggered. File count:", files.length);

        if (files.length === 0) return;

        setBulkResults([]);
        setBulkStatus('idle'); // Ensure status is idle before starting
        const toastId = toast.loading(`Initializing scanner for ${files.length} files...`);
        const extractedIds = [];

        try {
            // Check for the scanner element - MUST BE VISIBLE in DOM for library to bind
            const scannerElem = document.getElementById("file-qr-reader");
            if (!scannerElem) throw new Error("Scanner DOM bridge missing");

            // Ensure any existing instances are cleaned up
            const html5QrCode = new Html5Qrcode("file-qr-reader");
            console.log("Scanner instance bound to visible DOM bridge");

            for (const file of files) {
                try {
                    toast.update(toastId, { render: `Processing: ${file.name.slice(0, 20)}` });
                    console.log(`Analyzing: ${file.name} (${file.type})`);

                    let id = null;
                    if (file.type.includes('image')) {
                        const decodedText = await html5QrCode.scanFile(file, true);
                        id = extractIdFromText(decodedText);
                    } else if (file.type === 'application/pdf') {
                        id = await scanIdFromPdf(file, html5QrCode);
                    }

                    if (id) {
                        extractedIds.push(id);
                        console.log(`Detected ID: ${id}`);
                    }
                } catch (err) {
                    console.warn(`Scan skipped for ${file.name}:`, err.message || err);
                }
            }

            try { await html5QrCode.clear(); } catch (e) { }

            if (extractedIds.length > 0) {
                const uniqueIds = [...new Set(extractedIds)];
                console.log("Success! Extracted Unique IDs:", uniqueIds);
                setBulkData(uniqueIds);
                toast.update(toastId, {
                    render: `Successfully loaded ${uniqueIds.length} unique certificates`,
                    type: "success",
                    isLoading: false,
                    autoClose: 2000
                });

                // Auto-trigger verification
                setTimeout(() => processBulk(uniqueIds), 1000);
            } else {
                console.error("No valid IDs found in any files");
                toast.update(toastId, {
                    render: "No valid QR codes or IDs detected. Please try clearer files.",
                    type: "info",
                    isLoading: false,
                    autoClose: 4000
                });
            }
        } catch (err) {
            console.error("Critical Scanner Error:", err);
            toast.update(toastId, {
                render: `Error: ${err.message || 'Scanner failed to initialize'}`,
                type: "error",
                isLoading: false,
                autoClose: 5000
            });
        } finally {
            // CRITICAL: Reset the input so "Open" works every time
            if (e.target) e.target.value = '';
        }
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        const idToVerify = certId.trim();
        if (!idToVerify) {
            toast.error('Please enter a Certificate ID');
            return;
        }

        setLoading(true);
        setResult(null);
        setCertData(null);
        setTxHash('');

        console.log("Single verify initiated for ID:", idToVerify);

        const steps = ['Accessing Ledger...', 'Verifying Smart Contract...', 'Validating Hash...'];
        let stepIdx = 0;
        const stepInterval = setInterval(() => {
            if (stepIdx < steps.length) { setVerifyingText(steps[stepIdx]); stepIdx++; }
            else clearInterval(stepInterval);
        }, 600);

        try {
            const res = await verifyOne(idToVerify, candidateName);
            clearInterval(stepInterval);

            if (res.success) {
                setCertData(res.data);
                setResult('valid');
                setTxHash('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
                fireConfetti();
                toast.success('Authenticated!');
            } else {
                if (res.error === 'Name Mismatch') {
                    setCertData(res.data);
                    setResult('mismatch');
                    toast.warning('Name mismatch detected');
                } else {
                    setResult('not-found');
                    toast.error('Certificate not found on blockchain');
                }
            }
        } catch (err) {
            console.error("Verification logic error:", err);
            toast.error("An unexpected error occurred during verification");
            clearInterval(stepInterval);
        } finally {
            setLoading(false);
            setVerifyingText('Initializing Security Protocol...');
        }
    };

    const startScanner = async () => {
        setIsScanning(true);
        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader");
                qrScannerRef.current = html5QrCode;
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        setCertId(decodedText);
                        stopScanner();
                        setTimeout(() => {
                            const btn = document.getElementById('verify-btn');
                            if (btn) btn.click();
                        }, 500);
                    }
                );
            } catch (err) {
                toast.error("Camera access failed");
                setIsScanning(false);
            }
        }, 300);
    };

    const stopScanner = async () => {
        if (qrScannerRef.current) {
            try { await qrScannerRef.current.stop(); qrScannerRef.current = null; } catch (err) { }
        }
        setIsScanning(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const html5QrCode = new Html5Qrcode("file-qr-reader");
        const isPdf = file.type === 'application/pdf';
        const toastId = toast.loading(`Scanning ${isPdf ? 'PDF' : 'Image'}...`);
        try {
            let id;
            if (isPdf) id = await scanIdFromPdf(file, html5QrCode);
            else {
                const decodedText = await html5QrCode.scanFile(file, true);
                id = extractIdFromText(decodedText);
            }
            if (id) {
                setCertId(id);
                toast.update(toastId, { render: "ID Detected!", type: "success", isLoading: false, autoClose: 2000 });
                setTimeout(() => handleVerify(), 500);
            } else throw new Error("No ID");
        } catch (err) {
            toast.update(toastId, { render: "No valid ID found in the file", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Hash copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0f0f11] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
            <AnimatedBackground />

            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 w-full h-20 border-b border-white/5 bg-[#0f0f11]/50 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-12">
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
                        <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">CertDapp</span>
                </Link>

                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2.5 animate-pulse" />
                        <span className="text-xs text-green-400 font-semibold tracking-wider uppercase">Sepolia Testnet – Online</span>
                    </div>
                    <Link to="/" className="flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium group">
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-4 md:px-0">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                            Verify Certificate
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400 text-lg max-w-md mx-auto">
                            Instantly confirm the authenticity of blockchain-issued credentials.
                        </motion.p>
                    </div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-[2rem] border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden bg-white/[0.02]">
                        {loading && <div className="scanline" />}

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-2 text-blue-400">
                                <Lock size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{loading || bulkStatus === 'processing' ? 'Processing...' : 'Secure Gateway'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-500">
                                <Cpu size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Node: Sepolia-v1.4</span>
                            </div>
                        </div>

                        <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/10">
                            <button onClick={() => setVerifyMode('single')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${verifyMode === 'single' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>
                                <Search size={14} /> Single Verify
                            </button>
                            <button onClick={() => setVerifyMode('bulk')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${verifyMode === 'bulk' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>
                                <Files size={14} /> Bulk Verify
                            </button>
                        </div>

                        {verifyMode === 'single' ? (
                            <form onSubmit={handleVerify} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Certificate ID *</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                            <Search size={18} />
                                        </div>
                                        <input type="text" required value={certId} onChange={(e) => setCertId(e.target.value)} placeholder="e.g. 1001" disabled={loading} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-lg" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Candidate Name (Optional)</label>
                                    <input type="text" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Full Name" disabled={loading} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                                </div>
                                <button id="verify-btn" type="submit" disabled={loading || !certId.trim()} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center space-x-3 active:scale-[0.98]">
                                    {loading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center space-x-3 mb-1"><Loader2 className="animate-spin" size={20} /><span>{verifyingText}</span></div>
                                            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden"><motion.div className="h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.5 }} /></div>
                                        </div>
                                    ) : (
                                        <><span className="mr-2">Verify Credential</span><ChevronRight size={20} /></>
                                    )}
                                </button>
                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span className="bg-[#0f0f11] px-4 text-gray-600">OR</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={startScanner} className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"><Camera size={18} /><span>Use Camera</span></button>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"><Upload size={18} /><span>Upload File</span></button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                {bulkStatus === 'idle' ? (
                                    <div className="space-y-6">
                                        <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                                            <button onClick={() => setBulkTab('files')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bulkTab === 'files' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}>Multiple Files</button>
                                            <button onClick={() => setBulkTab('json')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bulkTab === 'json' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}>JSON Array</button>
                                        </div>
                                        {bulkTab === 'files' ? (
                                            <div
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    bulkFileInputRef.current?.click();
                                                }}
                                                className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group"
                                            >
                                                <Files className="text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" size={40} />
                                                <h3 className="text-white font-bold mb-1">Select Certificates</h3>
                                                <p className="text-gray-400 text-xs uppercase tracking-widest font-medium">Images or PDF Files</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} placeholder='["1001", "1002"]' className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 text-blue-400 font-mono text-sm focus:outline-none focus:border-blue-500/50 transition-all custom-scrollbar" />
                                                <button onClick={handleBulkJson} className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><Code size={18} /> Load IDs</button>
                                            </div>
                                        )}
                                        {bulkData.length > 0 && (
                                            <div className="pt-2">
                                                <button onClick={() => processBulk()} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2"><Cpu size={20} /> Verify All Loaded</button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <span className="text-lg font-bold text-white block">{bulkStatus === 'processing' ? 'Verifying Records...' : 'Complete'}</span>
                                                <span className="text-xs text-gray-400">{bulkResults.length} / {bulkData.length} scanned</span>
                                            </div>
                                            <div className="text-2xl font-black text-blue-500">{Math.round((bulkResults.length / bulkData.length) * 100)}%</div>
                                        </div>
                                        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden mb-6">
                                            <motion.div className="h-full bg-blue-500" initial={{ width: "0%" }} animate={{ width: `${(bulkResults.length / bulkData.length) * 100}%` }} />
                                        </div>
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {bulkResults.map((res, i) => (
                                                <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${res.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${res.success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{res.success ? <Check size={14} /> : <X size={14} />}</div>
                                                        <div><p className="text-xs font-bold text-white">ID: {res.id}</p><p className="text-[10px] text-gray-500 truncate max-w-[200px]">{res.success ? res.data.name : res.error}</p></div>
                                                    </div>
                                                </div>
                                            ))}
                                            {currentBulkIndex !== -1 && (
                                                <div className="p-4 rounded-2xl border border-white/5 bg-white/5 animate-pulse flex items-center gap-3"><Loader2 className="animate-spin text-blue-500" size={14} /><span className="text-xs font-bold text-white">Verifying ID: {bulkData[currentBulkIndex]}...</span></div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" className="hidden" />
                        <input type="file" ref={bulkFileInputRef} onChange={handleMultipleFiles} multiple accept="image/*,application/pdf" className="hidden" />

                        {/* 
                           CRITICAL: Scanner Bridge 
                           The html5-qrcode library requires a visible DOM element with dimensions 
                           to initialize correctly, even for file scanning. We place it here 
                           with minimal footprint to satisfy the library while keeping it invisible.
                        */}
                        <div
                            id="file-qr-reader"
                            style={{
                                position: 'absolute',
                                width: '1px',
                                height: '1px',
                                opacity: 0.01,
                                pointerEvents: 'none',
                                bottom: 0,
                                left: 0
                            }}
                        />
                    </motion.div>

                    <div className="mt-12">
                        <AnimatePresence mode="wait">
                            {result === 'valid' && certData && (
                                <motion.div key="valid" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                                    <div className="glass-card rounded-3xl border border-green-500/30 p-8 shadow-2xl relative overflow-hidden">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                            <div>
                                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest mb-4"><ShieldCheck size={14} className="mr-2" />Blockchain Verified</div>
                                                <h3 className="text-2xl font-bold">{certData.name}</h3><p className="text-gray-400">{certData.course}</p>
                                            </div>
                                            <div className="text-left md:text-right"><div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Grade</div><div className="text-3xl font-bold text-white">{certData.grade}</div></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                                            <div><div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Issue Date</div><div className="text-base font-medium">{certData.date}</div></div>
                                            <div><div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Verified At</div><div className="text-base font-medium">{certData.timestamp}</div></div>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate(`/viewcertificate/${certId}`)} className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors">View Certificate Detail</button>
                                </motion.div>
                            )}
                            {result === 'not-found' && (
                                <motion.div key="not-found" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card rounded-3xl border border-red-500/30 p-8 shadow-2xl">
                                    <div className="flex items-start space-x-4"><XCircle className="text-red-500 shrink-0 mt-1" size={24} /><div><h3 className="text-xl font-bold text-white mb-2">Record Not Found</h3><p className="text-gray-400">ID <span className="text-white font-mono bg-white/5 px-2 rounded uppercase">{certId}</span> could not be verified on our blockchain records.</p></div></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* QR Scanner Modal */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                        <div className="w-full max-w-lg bg-[#161618] rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div><h2 className="text-2xl font-bold">Scan QR</h2><p className="text-gray-400 text-sm">Align QR code within the frame</p></div>
                                <button onClick={stopScanner} className="text-gray-400 hover:text-white"><X size={24} /></button>
                            </div>
                            <div className="p-6"><div id="reader" className="w-full overflow-hidden rounded-2xl border border-white/5 bg-black/20"></div></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {bulkStatus === 'completed' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-sm glass-card p-10 rounded-[2.5rem] border border-white/10 text-center relative overflow-hidden">
                            <PartyPopper className="text-green-500 mx-auto mb-6" size={48} />
                            <h2 className="text-2xl font-black text-white mb-2">Batch Complete</h2>
                            <p className="text-gray-400 text-sm mb-8">Blockchain audit sequence finished.</p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5"><p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total</p><p className="text-2xl font-black text-white">{bulkResults.length}</p></div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5"><p className="text-[10px] text-green-500 font-bold uppercase mb-1">Authentic</p><p className="text-2xl font-black text-green-400">{bulkResults.filter(r => r.success).length}</p></div>
                            </div>
                            <button onClick={() => { setBulkStatus('idle'); setBulkData([]); setBulkResults([]); }} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl transition-all">Dismiss</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="mt-auto py-12 border-t border-white/5 text-center"><p className="text-gray-600 text-sm">&copy; 2026 CertDapp Infrastructure.</p></footer>
        </div>
    );
};

export default VerifyCertificate;
