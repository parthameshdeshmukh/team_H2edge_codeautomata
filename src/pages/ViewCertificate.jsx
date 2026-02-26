import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers';
import { abi } from '../scdata/Cert.json';
import { CertModuleCert } from '../scdata/deployed_addresses.json';
import { ArrowLeft, Share2, ShieldCheck, Loader2, ChevronRight, Linkedin, FileDown } from 'lucide-react';
import Certificate from '../components/Certificate';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ViewCertificate = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const location = useLocation();

  // Determine back path and breadcrumb text based on state
  const from = location.state?.from;
  const backPath = from === 'issue' ? '/issuecertificate' : '/';
  const parentName = from === 'issue' ? 'Admin' : 'Verify';
  const pageName = from === 'issue' ? 'Issue' : 'Certificate';

  useEffect(() => {
    async function getcert(searchId) {
      if (!window.ethereum) return;
      try {
        console.log("Querying Contract:", CertModuleCert);
        const provider = new BrowserProvider(window.ethereum);
        const instance = new Contract(CertModuleCert, abi, provider);

        // Convert searchId to BigInt for safe uint256 lookup
        const result = await instance.getFunction("Certificates")(BigInt(searchId));

        console.log("Found Blockchain Record:", result);

        // In ethers v6, result is a Result object that can be accessed by name or index
        const name = result.name || result[0];
        const course = result.course || result[1];
        const grade = result.grade || result[2];
        const date = result.date || result[3];
        const performance = result.performance || result[5] || "";

        if (!name || name === "") {
          setCertificate(null);
        } else {
          setCertificate({ name, course, grade, date, performance });
        }
      } catch (error) {
        console.error('Error fetching certificate:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getcert(id);
    }
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Blockchain Certificate',
        text: `Check out my verified blockchain certificate! ID: ${id}`,
        url: window.location.href,
      })
        .then(() => toast.success('Shared successfully'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const shareToLinkedIn = () => {
    const url = window.location.href;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const addToLinkedInProfile = () => {
    const baseUrl = 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME';

    // Attempt to parse date for year and month
    let issueYear = new Date().getFullYear();
    let issueMonth = new Date().getMonth() + 1;

    if (certificate?.date) {
      try {
        const d = new Date(certificate.date);
        if (!isNaN(d.getTime())) {
          issueYear = d.getFullYear();
          issueMonth = d.getMonth() + 1;
        }
      } catch (e) {
        console.error("Date parsing error", e);
      }
    }

    const params = new URLSearchParams({
      name: certificate?.course || 'Blockchain Certificate',
      organizationName: 'CertDapp Blockchain Network',
      issueYear: issueYear.toString(),
      issueMonth: issueMonth.toString(),
      certId: id,
      certUrl: window.location.href,
    });

    window.open(`${baseUrl}&${params.toString()}`, '_blank');
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
      pdf.save(`Certificate-${id}-${certificate.name.replace(/\s+/g, '-')}.pdf`);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-secondary font-medium animate-pulse">Verifying Blockchain Record...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[60vh]"
      >
        <div className="glass-card p-12 rounded-[32px] max-w-md w-full text-center border border-white/5 relative overflow-hidden">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 text-error">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h2>
          <p className="text-secondary mb-8 leading-relaxed">
            We couldn't locate a valid certificate with ID <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded text-sm">{id}</span> on the ledger.
          </p>
          <Link
            to={backPath}
            className="w-full py-3.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all flex items-center justify-center group border border-white/5"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start py-8 min-h-screen px-4">

      {/* Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mb-6 flex items-center text-xs font-semibold tracking-wider text-secondary uppercase"
      >
        <span className="text-gray-500">{parentName}</span>
        {from === 'issue' && (
          <>
            <ChevronRight size={12} className="mx-2 text-gray-600" />
            <span className="text-gray-500">Issue</span>
          </>
        )}
        <ChevronRight size={12} className="mx-2 text-gray-600" />
        <span className="text-white">Certificate</span>
      </motion.div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex flex-col lg:flex-row justify-between items-center mb-10 glass-card px-8 py-5 rounded-3xl sticky top-24 z-30 gap-6 lg:gap-0"
      >
        <Link to={backPath} className="flex items-center text-secondary hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="font-medium text-sm whitespace-nowrap">
            {from === 'issue' ? 'Back to Dashboard' : 'Back to Verify'}
          </span>
        </Link>

        <div className="flex flex-wrap justify-center items-center gap-3">
          {/* LinkedIn Group */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              onClick={addToLinkedInProfile}
              className="flex items-center px-4 py-2.5 bg-[#0077b5] text-white rounded-xl hover:bg-[#006097] transition-all text-sm font-bold shadow-lg shadow-[#0077b5]/20 animate-pulse-subtle"
            >
              <Linkedin size={16} className="mr-2" />
              Add to Profile
            </button>
            <button
              onClick={shareToLinkedIn}
              className="flex items-center px-4 py-2.5 bg-white/5 text-secondary hover:text-white rounded-xl hover:bg-white/10 transition-all text-sm font-bold"
              title="Share as Post"
            >
              <Share2 size={16} className="mr-2" />
              Post
            </button>
          </div>

          <div className="h-8 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>

          {/* Action Group */}
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="flex items-center px-5 py-2.5 bg-white/5 text-white text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 group"
            >
              {isDownloading ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <FileDown size={16} className="mr-2 group-hover:translate-y-0.5 transition-transform" />
              )}
              PDF
            </button>

            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2.5 bg-white/5 text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-colors border border-white/10 active:scale-95"
              title="Copy Link"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Certificate Display with Parallax Hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        whileHover={{ scale: 1.01 }}
        className="relative w-full max-w-[850px]"
        style={{ perspective: 1200 }}
      >
        <div className="relative group transition-all duration-700 transform-style-3d">
          {/* Animated Glow Effect behind */}
          <div className="absolute -inset-8 bg-gradient-to-r from-blue-600/20 via-primary/20 to-purple-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[40px] animate-pulse"></div>

          <div className="relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border border-white/5 bg-white transform-gpu group-hover:rotate-x-1 group-hover:-rotate-y-1 transition-transform duration-500">
            <Certificate
              name={certificate.name}
              course={certificate.course}
              grade={certificate.grade}
              date={certificate.date}
              performance={certificate.performance}
              id={id}
            />
          </div>
        </div>
      </motion.div>

      <div className="mt-16 text-center text-secondary mb-20">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="flex -space-x-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-6 h-6 rounded-full border border-black bg-blue-${i * 100 + 400} flex items-center justify-center text-[8px] font-bold text-white`}>
                {i}
              </div>
            ))}
          </div>
          <span className="text-sm font-medium text-white">Verified by Global Network</span>
        </div>
        <div className="inline-flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
          <ShieldCheck size={14} className="text-success mr-2" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Fingerprint: 0x{id?.padStart(8, '0')}...BLOCKCHAIN_SECURED</span>
        </div>
        <p className="text-xs max-w-md mx-auto leading-relaxed">This credential is cryptographically signed and stored on the Ethereum Virtual Machine. It represents a permanent verifiable achievement.</p>
      </div>

    </div>
  );
};

export default ViewCertificate;
