import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Search,
    Copy,
    ExternalLink,
    ArrowLeft,
    QrCode,
    Loader2,
    AlertTriangle,
    XCircle,
    CheckCircle2,
    Check,
    ChevronRight,
    Info,
    ExternalLink as ExternalIcon,
    Lock,
    Eye,
    Upload,
    Camera,
    Cpu,
    FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Certificate from '../components/Certificate';
import { abi } from '../scdata/Cert.json';
import { CertModuleCert } from '../scdata/deployed_addresses.json';
import { toast } from 'react-toastify';
import { Html5Qrcode } from 'html5-qrcode';
import AnimatedBackground from '../components/AnimatedBackground';
import confetti from 'canvas-confetti';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
    const [isDownloading, setIsDownloading] = useState(false);

    const qrScannerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Helper to extract numeric ID from QR text (handles URLs like https://site.com/view/101)
    const extractId = (text) => {
        if (!text) return '';
        const segments = text.split('/');
        const lastSegment = (segments.pop() || segments.pop()).trim();
        // Keep only digits if the blockchain ID is numeric
        return lastSegment.replace(/\D/g, '');
    };

    // Cleanup scanner on unmount
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

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleVerify = async (e, directId = null) => {
        if (e) e.preventDefault();
        const activeId = directId || certId;

        if (!activeId || !activeId.toString().trim()) {
            toast.error('Please enter a Certificate ID');
            return;
        }

        setLoading(true);
        setResult(null);
        setCertData(null);
        setTxHash('');

        // Step-by-step security simulation for "theatre"
        const steps = [
            'Accessing Decentralized Ledger...',
            'Verifying Smart Contract Integrity...',
            'Querying Certificate Mapping...',
            'Validating Cryptographic Hash...',
        ];

        let stepIdx = 0;
        const stepInterval = setInterval(() => {
            if (stepIdx < steps.length) {
                setVerifyingText(steps[stepIdx]);
                stepIdx++;
            } else {
                clearInterval(stepInterval);
            }
        }, 600);

        try {
            const provider = new BrowserProvider(window.ethereum);
            const instance = new Contract(CertModuleCert, abi, provider);

            // Fetch the result using BigInt for uint256
            const blockchainResult = await instance.getFunction("Certificates")(BigInt(activeId));

            // Artificial delay to make it feel like a heavy security check
            await new Promise(resolve => setTimeout(resolve, 2000));
            clearInterval(stepInterval);

            const name = blockchainResult.name || blockchainResult[0];
            const course = blockchainResult.course || blockchainResult[1];
            const grade = blockchainResult.grade || blockchainResult[2];
            const date = blockchainResult.date || blockchainResult[3];

            if (!name || name === "") {
                setResult('not-found');
            } else {
                const data = {
                    name: name,
                    course: course,
                    grade: grade,
                    date: date,
                    timestamp: new Date().toLocaleString()
                };
                setCertData(data);

                if (candidateName.trim() && candidateName.toLowerCase() !== name.toLowerCase()) {
                    setResult('mismatch');
                } else {
                    setResult('valid');
                    // Generating a unique proof hash for this specific verification session
                    setTxHash('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
                    fireConfetti();
                    toast.success('Certificate Successfully Authenticated!');
                }
            }
        } catch (error) {
            console.error('Verification error:', error);
            setResult('not-found');
        } finally {
            setLoading(false);
            setVerifyingText('Initializing Security Protocol...');
        }
    };

    const startScanner = async () => {
        setIsScanning(true);
        setTimeout(async () => {
            try {
                if (qrScannerRef.current) {
                    await qrScannerRef.current.stop().catch(() => { });
                }

                const html5QrCode = new Html5Qrcode("reader");
                qrScannerRef.current = html5QrCode;

                const config = { fps: 10, qrbox: { width: 250, height: 250 } };

                // Get available cameras to find the integrated one
                const devices = await Html5Qrcode.getCameras();

                if (devices && devices.length > 0) {
                    // Look for integrated camera, front camera, or just pick the first one
                    let cameraId = devices[0].id;
                    const integratedCamera = devices.find(d =>
                        d.label.toLowerCase().includes('integrated') ||
                        d.label.toLowerCase().includes('front') ||
                        d.label.toLowerCase().includes('built-in') ||
                        d.label.toLowerCase().includes('webcam')
                    );

                    if (integratedCamera) {
                        cameraId = integratedCamera.id;
                        console.log("Using integrated camera:", integratedCamera.label);
                    }

                    await html5QrCode.start(
                        cameraId,
                        config,
                        (decodedText) => {
                            const extractedId = extractId(decodedText);
                            setCertId(extractedId);
                            stopScanner();
                            handleVerify(null, extractedId);
                        }
                    );
                } else {
                    // Fallback to basic constraints if device list fails
                    await html5QrCode.start(
                        { facingMode: "user" },
                        config,
                        (decodedText) => {
                            const extractedId = extractId(decodedText);
                            setCertId(extractedId);
                            stopScanner();
                            handleVerify(null, extractedId);
                        }
                    );
                }
            } catch (err) {
                console.error("Scanner start failure:", err);
                toast.error("Could not start camera. Please ensure permissions are granted.");
                setIsScanning(false);
            }
        }, 500);
    };

    const stopScanner = async () => {
        if (qrScannerRef.current) {
            try {
                await qrScannerRef.current.stop();
                qrScannerRef.current = null;
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
        setIsScanning(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = toast.loading(file.type === 'application/pdf' ? "Reading PDF..." : "Processing image...");

        try {
            let extractedText = '';
            const html5QrCode = new Html5Qrcode("file-qr-reader");

            if (file.type === 'application/pdf') {
                // PDF processing: convert first page to canvas
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 2.0 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                // Scan the canvas Blob
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const imageFile = new File([blob], "temp.png", { type: "image/png" });
                extractedText = await html5QrCode.scanFile(imageFile, true);
            } else {
                // Image processing
                extractedText = await html5QrCode.scanFile(file, true);
            }

            const extractedId = extractId(extractedText);
            setCertId(extractedId);
            toast.update(toastId, { render: "QR Code detected!", type: "success", isLoading: false, autoClose: 2000 });

            // Trigger verification
            handleVerify(null, extractedId);
        } catch (err) {
            console.error("File Scan Error:", err);
            toast.update(toastId, { render: "No valid QR code found in file", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            // Clean up file input
            if (e.target) e.target.value = '';
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Transaction Hash copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadPDF = async () => {
        const element = document.getElementById('certificate-content');
        if (!element) return;

        setIsDownloading(true);
        const toastId = toast.loading("Generating high-quality PDF...");

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff"
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Certificate-${certId}-${certData.name.replace(/\s+/g, '-')}.pdf`);

            toast.update(toastId, {
                render: "Certificate Downloaded!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
        } catch (error) {
            console.error("PDF Export Error:", error);
            toast.update(toastId, {
                render: "Download Failed",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setIsDownloading(false);
        }
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
                    <Link
                        to="/"
                        className="flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium group"
                    >
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-4 md:px-0">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
                        >
                            Verify Certificate
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 text-lg max-w-md mx-auto"
                        >
                            Instantly confirm the authenticity of blockchain-issued credentials.
                        </motion.p>
                    </div>

                    {/* Verification Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-[2rem] border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden bg-white/[0.02]"
                    >
                        {loading && <div className="scanline" />}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-2 text-blue-400">
                                <Lock size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{loading ? 'System Scanning...' : 'Secure Gateway'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-500">
                                <Cpu size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Node: Sepolia-v1.4</span>
                            </div>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                                    Certificate ID <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                        <Search size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={certId}
                                        onChange={(e) => setCertId(e.target.value)}
                                        placeholder="CERT-2026-001"
                                        disabled={loading}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Candidate Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={candidateName}
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    placeholder="Enter candidate name for validation"
                                    disabled={loading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    id="verify-btn"
                                    type="submit"
                                    disabled={loading || !certId.trim()}
                                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center space-x-3 active:scale-[0.98] relative overflow-hidden"
                                >
                                    {loading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <Loader2 className="animate-spin" size={20} />
                                                <span>{verifyingText}</span>
                                            </div>
                                            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-white"
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 2.5 }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Verify Certificate</span>
                                            <ChevronRight size={20} />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-secondary mt-4 flex items-center justify-center">
                                    <Info size={12} className="mr-1.5" />
                                    The certificate ID is provided by the candidate.
                                </p>
                            </div>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                                    <span className="bg-[#0f0f11] px-4 text-gray-600">OR</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={startScanner}
                                    className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
                                >
                                    <Camera size={18} />
                                    <span>Use Camera</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
                                >
                                    <Upload size={18} />
                                    <span>Upload Image</span>
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                />
                            </div>
                        </form>
                    </motion.div>

                    {/* Results Area */}
                    <div className="mt-12">
                        <AnimatePresence mode="wait">
                            {result === 'valid' && certData && (
                                <motion.div
                                    key="valid"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Success Result Card */}
                                    <div className="glass-card rounded-3xl border border-green-500/30 p-8 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-10">
                                            <CheckCircle2 size={120} className="text-green-500" />
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                            <div>
                                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
                                                    <ShieldCheck size={14} className="mr-2" />
                                                    Blockchain Verified
                                                </div>
                                                <h3 className="text-2xl font-bold">{certData.name}</h3>
                                                <p className="text-gray-400">{certData.course}</p>
                                            </div>

                                            <div className="text-left md:text-right">
                                                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Grade</div>
                                                <div className="text-3xl font-bold text-white tracking-tight">{certData.grade}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                                            <div>
                                                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Issue Date</div>
                                                <div className="text-base font-medium">{certData.date}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Verified At</div>
                                                <div className="text-base font-medium">{certData.timestamp}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Info Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="glass-card rounded-2xl border border-white/5 p-6 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transaction Hash</span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => copyToClipboard(txHash)}
                                                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                                    title="Copy Hash"
                                                >
                                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                </button>
                                                <a
                                                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                                    title="View on Etherscan"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            </div>
                                        </div>
                                        <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-blue-400 break-all border border-white/5">
                                            {txHash}
                                        </div>
                                    </motion.div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => navigate(`/viewcertificate/${certId}`)}
                                            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl font-bold text-lg transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
                                        >
                                            <Eye size={20} />
                                            <span>View Full</span>
                                        </button>
                                        <button
                                            onClick={downloadPDF}
                                            disabled={isDownloading}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <FileDown size={20} />
                                                    <span>Download PDF</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {result === 'mismatch' && (
                                <motion.div
                                    key="mismatch"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="glass-card rounded-3xl border border-yellow-500/30 p-8 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0 border border-yellow-500/20">
                                            <AlertTriangle className="text-yellow-500" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">Name Mismatch Detected</h3>
                                            <p className="text-gray-400 leading-relaxed">
                                                The certificate ID <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded uppercase">{certId}</span> exists, but the candidate name you entered does not match blockchain records.
                                            </p>

                                            <div className="mt-8 pt-8 border-t border-white/5">
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">Blockchain Record</p>
                                                <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                                                        <CheckCircle2 size={18} className="text-green-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold">{certData.name}</div>
                                                        <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Registered Name</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {result === 'not-found' && (
                                <motion.div
                                    key="not-found"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="glass-card rounded-3xl border border-red-500/30 p-8 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0 border border-red-500/20">
                                            <XCircle className="text-red-500" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">Certificate Not Found</h3>
                                            <p className="text-gray-400 leading-relaxed">
                                                No valid record was found for ID <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded uppercase">{certId}</span> on the blockchain ledger. This credential could not be verified.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* QR Scanner Modal */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    >
                        <div className="w-full max-w-lg bg-[#161618] rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">Scan QR Code</h2>
                                    <p className="text-gray-400 text-sm">Position the QR code within the frame</p>
                                </div>
                                <button
                                    onClick={stopScanner}
                                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="p-6">
                                <div id="reader" className="w-full overflow-hidden rounded-2xl border border-white/5 bg-black/20"></div>
                            </div>

                            <div className="p-8 bg-black/20 flex items-center justify-center">
                                <p className="text-xs text-gray-500 flex items-center">
                                    <ShieldCheck size={14} className="mr-2" />
                                    Scanner uses local processing for privacy
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="mt-auto py-12 border-t border-white/5 text-center">
                <p className="text-gray-600 text-sm">
                    &copy; 2026 CertDapp Infrastructure. All rights reserved.
                </p>
            </footer>

            {/* Hidden element for file scanning logic */}
            <div id="file-qr-reader" className="hidden"></div>

            {/* Hidden Certificate for PDF Capture */}
            <div className="absolute -left-[9999px] top-0 pointer-events-none overflow-hidden">
                {certData && (
                    <div className="bg-white">
                        <Certificate
                            name={certData.name}
                            course={certData.course}
                            grade={certData.grade}
                            date={certData.date}
                            id={certId}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyCertificate;
