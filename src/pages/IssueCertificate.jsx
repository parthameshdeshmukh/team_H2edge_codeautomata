import React, { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { abi } from '../scdata/Cert.json';
import { CertModuleCert } from '../scdata/deployed_addresses.json';
import { toast } from 'react-toastify';
import {
  Calendar, User, Hash, ChevronDown, Check, Loader2, ExternalLink,
  Copy, Eye, FileText, Mail, Share2, MessageCircle, X,
  ShieldAlert, ArrowLeft, Lock, Award, Zap, FileSpreadsheet, Upload, RotateCcw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import Certificate from '../components/Certificate';
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';

const IssueCertificate = () => {
  const { isAdmin, account } = useOutletContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    emailjs.init("RDdze55nFmv0HKhwk");
  }, []);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <Lock className="text-red-500" size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-3">Access Denied</h2>
        <p className="text-gray-400 max-w-md mb-8">
          This wallet ({account?.slice(0, 6)}...{account?.slice(-4)}) is not authorized to issue certificates. Please switch to the Admin Wallet in MetaMask.
        </p>
        <Link
          to="/dashboard"
          className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all border border-white/10 flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    course: 'Certified Blockchain Associate',
    grade: 'S',
    date: '',
    studentAddress: '', // New field
    performance: {
      theory: 80,
      practical: 80,
      project: 80,
      assignment: 80,
      attendance: 80
    }
  });

  const [status, setStatus] = useState('idle'); // idle, preparing, confirming, success
  const [txHash, setTxHash] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Bulk Mode States
  const [issueMode, setIssueMode] = useState('single'); // single, bulk
  const [bulkData, setBulkData] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('idle'); // idle, processing, completed
  const [currentBulkIndex, setCurrentBulkIndex] = useState(-1);
  const [bulkResults, setBulkResults] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const issuecert = async (e) => {
    e.preventDefault();
    setStatus('preparing');

    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      setStatus('idle');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const instance = new Contract(CertModuleCert, abi, signer);

      setStatus('confirming');

      const tx = await instance.issue(
        formData.id,
        formData.name,
        formData.course,
        formData.grade,
        formData.date,
        formData.studentAddress, // Added studentAddress
        Object.values(formData.performance).join(',') // Performance scores
      );

      setTxHash(tx.hash);

      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      setStatus('success');
      toast.success('Certificate Issued Successfully!');

      // EmailJS Integration
      const templateParams = {
        to_email: formData.email,
        to_name: formData.name,
        cert_id: formData.id,
        course: formData.course,
        date: formData.date,
        verify_link: `${window.location.origin}/viewcertificate/${formData.id}`
      };

      emailjs.send(
        'service_j1p07f6',
        'template_le29xxk',
        templateParams,
        'RDdze55nFmv0HKhwk'
      ).then((response) => {
        console.log('EMAIL SENT SUCCESS!', response.status, response.text);
        toast.info(`Notification sent to ${formData.email}`);
      }, (err) => {
        console.error('EMAILJS ERROR DETAIL:', err); // This tells us the exact reason
        toast.error(`Email Error: ${err.text || 'Check console'}`);
      });

    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error('Failed to issue certificate.');
      setStatus('idle');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const issueSingleCertificate = async (data) => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask!');
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const instance = new Contract(CertModuleCert, abi, signer);

    const performanceStr = [
      data.theory || 0,
      data.practical || 0,
      data.project || 0,
      data.assignment || 0,
      data.attendance || 0
    ].join(',');

    const tx = await instance.issue(
      data.id,
      data.name,
      data.course,
      data.grade,
      data.date,
      data.studentAddress,
      performanceStr
    );

    await tx.wait();

    // EmailJS Notification
    const templateParams = {
      to_email: data.email,
      to_name: data.name,
      cert_id: data.id,
      course: data.course,
      date: data.date,
      verify_link: `${window.location.origin}/viewcertificate/${data.id}`
    };

    try {
      await emailjs.send(
        'service_j1p07f6',
        'template_le29xxk',
        templateParams,
        'RDdze55nFmv0HKhwk'
      );
    } catch (err) {
      console.warn('Email notification failed but certificate issued:', err);
    }

    return tx.hash;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error('Excel file is empty');
          return;
        }

        // Basic validation of columns
        const required = ['id', 'name', 'email', 'course', 'grade', 'date', 'studentAddress'];
        const headers = Object.keys(data[0] || {});
        const missing = required.filter(h => !headers.includes(h));

        if (missing.length > 0) {
          toast.error(`Missing columns: ${missing.join(', ')}`);
          return;
        }

        setBulkData(data);
        toast.success(`Loaded ${data.length} records!`);
      } catch (err) {
        toast.error('Failed to parse Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        id: "1001",
        name: "John Doe",
        email: "john@example.com",
        course: "Certified Blockchain Associate",
        grade: "S",
        date: "2024-03-27",
        studentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        theory: 85,
        practical: 90,
        project: 88,
        assignment: 92,
        attendance: 95
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Mass_Certificate_Template.xlsx");
  };

  const processBulk = async () => {
    if (bulkData.length === 0) return;

    setBulkStatus('processing');
    const results = [];

    for (let i = 0; i < bulkData.length; i++) {
      setCurrentBulkIndex(i);
      try {
        const hash = await issueSingleCertificate(bulkData[i]);
        results.push({ index: i, success: true, hash, id: bulkData[i].id });
        toast.success(`Issued ${bulkData[i].id} (${i + 1}/${bulkData.length})`);
      } catch (err) {
        console.error(`Error at index ${i}:`, err);
        results.push({ index: i, success: false, error: err.message, id: bulkData[i].id });
        toast.error(`Failed ${bulkData[i].id}: ${err.message}`);
      }
      setBulkResults([...results]);
    }

    setBulkStatus('completed');
    setCurrentBulkIndex(-1);
    toast.info('Mass generation complete!');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-lg p-10 rounded-[32px] relative overflow-hidden"
      >
        {/* Mode Switcher */}
        <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/10">
          <button
            disabled={status !== 'idle' || bulkStatus === 'processing'}
            onClick={() => setIssueMode('single')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${issueMode === 'single' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-secondary hover:text-white disabled:opacity-50'}`}
          >
            <User size={14} /> Single Issue
          </button>
          <button
            disabled={status !== 'idle' || bulkStatus === 'processing'}
            onClick={() => setIssueMode('bulk')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${issueMode === 'bulk' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-secondary hover:text-white disabled:opacity-50'}`}
          >
            <FileSpreadsheet size={14} /> Mass Generation
          </button>
        </div>

        <AnimatePresence mode="wait">
          {issueMode === 'single' ? (
            status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-2 ring-1 ring-success/50">
                  <Check size={40} className="text-success" strokeWidth={3} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Certificate Minted</h2>
                  <p className="text-secondary text-sm">Successfully issued certificate to {formData.name}</p>
                </div>

                <div className="w-full bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/10 text-left">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Hash size={16} className="text-secondary" />
                    </div>
                    <div className="flex flex-col truncate pr-2">
                      <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">Transaction Hash</span>
                      <span className="text-sm font-mono text-white truncate w-full">{txHash.slice(0, 20)}...{txHash.slice(-6)}</span>
                    </div>
                  </div>
                  <button onClick={() => copyToClipboard(txHash)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-secondary hover:text-white" title="Copy Hash">
                    <Copy size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => {
                      const message = `Hi ${formData.name}, your certificate for ${formData.course} has been issued! Verify it here: ${window.location.origin}/viewcertificate/${formData.id}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-all text-sm"
                  >
                    <MessageCircle size={18} />
                    Share to WhatsApp
                  </button>

                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/viewcertificate/${formData.id}`;
                      navigator.clipboard.writeText(link);
                      toast.success('Share link copied!');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all text-sm"
                  >
                    <Copy size={18} />
                    Copy Share Link
                  </button>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center text-sm">
                    View on Etherscan <ExternalLink size={14} className="ml-2" />
                  </a>
                  <Link
                    to={`/viewcertificate/${formData.id}`}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold transition-all group"
                  >
                    View Certificate <Eye size={18} className="ml-2 group-hover:scale-110 transition-transform" />
                  </Link>

                  <button
                    onClick={() => {
                      setStatus('idle');
                      setFormData({
                        id: '',
                        name: '',
                        course: 'Certified Blockchain Associate',
                        grade: 'S',
                        date: '',
                        studentAddress: '',
                        performance: { theory: 80, practical: 80, project: 80, assignment: 80, attendance: 80 }
                      });
                      setTxHash('');
                    }}
                    className="w-full py-4 bg-primary hover:bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 transition-all"
                  >
                    Issue New Certificate
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-8 text-center flex justify-between items-center">
                  <div className="text-left">
                    <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Issue Certificate</h1>
                    <p className="text-secondary text-xs">Mint a new credential to the ledger.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-primary transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    <Eye size={16} /> Preview
                  </button>
                </div>

                <form onSubmit={issuecert} className="space-y-5">
                  {/* Certificate ID */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">Certificate ID</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="number"
                        name="id"
                        required
                        className="glass-input w-full px-4 py-3.5 pl-11 rounded-xl text-white font-medium placeholder-gray-600 focus:placeholder-gray-500 bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        placeholder="e.g. 1001"
                        value={formData.id}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Candidate Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">Candidate Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="text"
                        name="name"
                        required
                        className="glass-input w-full px-4 py-3.5 pl-11 rounded-xl text-white font-medium placeholder-gray-600 focus:placeholder-gray-500 bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        placeholder="Full Legal Name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Student Email */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">Student Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="email"
                        name="email"
                        required
                        className="glass-input w-full px-4 py-3.5 pl-11 rounded-xl text-white font-medium placeholder-gray-600 focus:placeholder-gray-500 bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        placeholder="student@example.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Student Wallet Address */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">Student Wallet Address</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/5 rounded-lg">
                        <ExternalLink size={14} className="text-gray-500 group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="studentAddress"
                        required
                        pattern="^0x[a-fA-F0-9]{40}$"
                        className="glass-input w-full px-4 py-3.5 pl-12 rounded-xl text-white font-medium placeholder-gray-600 focus:placeholder-gray-500 bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono text-xs"
                        placeholder="0x..."
                        value={formData.studentAddress}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Course Select */}
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">Course</label>
                      <div className="relative">
                        <select
                          name="course"
                          className="glass-input w-full px-4 py-3.5 rounded-xl text-white font-medium appearance-none cursor-pointer bg-[#1c1c1f] border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                          value={formData.course}
                          onChange={handleChange}
                        >
                          <option value="Certified Blockchain Associate">CBA</option>
                          <option value="Developer Essential for Blockchain">DEB</option>
                          <option value="Blockchain Foundation Program">BFP</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                      </div>
                    </div>

                    {/* Grade Select */}
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">Grade</label>
                      <div className="relative">
                        <select
                          name="grade"
                          required
                          className="glass-input w-full px-4 py-3.5 rounded-xl text-white font-medium appearance-none cursor-pointer bg-[#1c1c1f] border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                          value={formData.grade}
                          onChange={handleChange}
                        >
                          <option value="S">S</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Issue Date */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">Issue Date</label>
                    <div className="relative group">
                      <input
                        type="date"
                        name="date"
                        required
                        className="glass-input w-full px-4 py-3.5 rounded-xl text-white font-medium bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all [color-scheme:dark]"
                        value={formData.date}
                        onChange={handleChange}
                      />

                    </div>
                  </div>

                  {/* Performance Metrics Section */}
                  <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">Performance Details</label>
                      <div className="flex items-center text-[10px] text-primary font-bold">
                        <Zap size={10} className="mr-1" /> CORE METRICS
                      </div>
                    </div>

                    {[
                      { key: 'theory', label: 'Theory' },
                      { key: 'practical', label: 'Practical' },
                      { key: 'project', label: 'Project' },
                      { key: 'assignment', label: 'Assignment' },
                      { key: 'attendance', label: 'Attendance' }
                    ].map((metric) => (
                      <div key={metric.key} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400 font-medium uppercase tracking-wider">{metric.label}</span>
                          <span className="text-white font-bold">{formData.performance[metric.key]}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                          value={formData.performance[metric.key]}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              performance: {
                                ...prev.performance,
                                [metric.key]: parseInt(e.target.value)
                              }
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Transaction Progress / Submit Button */}
                  <div className="pt-4">
                    {status !== 'idle' ? (
                      <div className="space-y-5 bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-semibold text-white">
                            {status === 'preparing' ? 'Preparing Transaction' : status === 'confirming' ? 'Waiting for Confirmation' : 'Certificate Minted'}
                          </span>
                          <span className="text-xs text-secondary">{status === 'preparing' ? '1/3' : status === 'confirming' ? '2/3' : '3/3'}</span>
                        </div>

                        <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className="h-full bg-primary shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: status === 'preparing' ? "33%" : status === 'confirming' ? "66%" : "100%" }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>

                        <div className="flex items-center justify-center pt-2">
                          <Loader2 className="animate-spin text-primary mr-2" size={18} />
                          <span className="text-xs text-gray-400">Please confirm only once in MetaMask</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="w-full py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] text-[15px]"
                      >
                        Issue Certificate
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )
          ) : (
            <motion.div
              key="bulk-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Mass Generation</h1>
                <p className="text-secondary text-xs">Upload Excel to batch issue certificates.</p>
              </div>

              {bulkStatus === 'idle' ? (
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-white/10 group-hover:border-primary/50 group-hover:bg-primary/5 rounded-[24px] p-8 transition-all flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-secondary group-hover:text-primary" size={32} />
                      </div>
                      <h3 className="text-white font-bold mb-1">Click to Upload Excel</h3>
                      <p className="text-secondary text-xs">Drop your .xlsx file here</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={downloadTemplate}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <FileSpreadsheet size={18} /> Download Excel Template
                    </button>

                    {bulkData.length > 0 && (
                      <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-white">{bulkData.length} Records Loaded</span>
                          <button
                            onClick={() => setBulkData([])}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <X size={12} /> Clear
                          </button>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                          {bulkData.map((row, idx) => (
                            <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] flex justify-between items-center">
                              <span className="font-mono text-white truncate w-1/3">{row.name}</span>
                              <span className="text-secondary truncate w-1/3">{row.course}</span>
                              <span className="text-primary font-bold">{row.grade}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={processBulk}
                          className="w-full mt-6 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Zap size={18} /> Start Mass Generation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Processing Status */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <span className="text-lg font-bold text-white block">
                          {bulkStatus === 'processing' ? 'Generating Certificates...' : 'Generation Complete'}
                        </span>
                        <span className="text-xs text-secondary">
                          {bulkResults.length} / {bulkData.length} processed
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary">
                          {bulkData.length > 0 ? Math.round((bulkResults.length / bulkData.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden mb-6">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: `${bulkData.length > 0 ? (bulkResults.length / bulkData.length) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Results List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {bulkResults.map((res, i) => (
                        <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${res.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${res.success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {res.success ? <Check size={14} /> : <AlertCircle size={14} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">ID: {res.id}</p>
                              <p className="text-[10px] text-secondary truncate max-w-[150px]">
                                {res.success ? `Hash: ${res.hash.slice(0, 10)}...` : res.error}
                              </p>
                            </div>
                          </div>
                          {res.success && (
                            <a href={`https://sepolia.etherscan.io/tx/${res.hash}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-secondary">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                      {currentBulkIndex !== -1 && (
                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 animate-pulse flex items-center gap-3">
                          <Loader2 className="animate-spin text-primary" size={14} />
                          <span className="text-xs font-bold text-white">Processing ID: {bulkData[currentBulkIndex]?.id}...</span>
                        </div>
                      )}
                    </div>

                    {bulkStatus === 'completed' && (
                      <button
                        onClick={() => {
                          setBulkStatus('idle');
                          setBulkData([]);
                          setBulkResults([]);
                        }}
                        className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={18} /> Start New Batch
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div >

      {/* Live Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-[900px] h-fit max-h-[95vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-[70] border border-white/10"
              >
                <X size={20} />
              </button>

              <div className="p-4 bg-white/5 rounded-[40px] border border-white/10 shadow-2xl backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Award className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Certificate Preview</h3>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Verification Simulation</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    LAYOUT_RENDERED_STABLE
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-2xl scale-[0.98]">
                  <Certificate
                    name={formData.name || "CANDIDATE NAME"}
                    course={formData.course}
                    grade={formData.grade}
                    date={formData.date || "YYYY-MM-DD"}
                    id={formData.id || "0000"}
                    performance={Object.values(formData.performance).join(',')}
                  />
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                  >
                    Got it, Looks Great!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default IssueCertificate;
