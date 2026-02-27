import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Lock, ArrowRight, ChevronRight,
  Database, Zap, Globe, Building2, Briefcase, GraduationCap,
  FileX, X, Search, Loader2, AlertTriangle, Clock, Server
} from 'lucide-react';

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 z-10 text-center lg:text-left"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2 mx-auto lg:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2.5 animate-pulse" />
              <span className="text-xs text-gray-300 font-semibold tracking-wider uppercase">Live on Sepolia</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-white">
              The Standard for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-400">
                Digital Trust.
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Eliminate fraud with blockchain-backed credentials.
              Secure, instant, and globally verifiable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/verify')}
                className="min-w-[160px] px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center"
              >
                Verify Now <ArrowRight size={18} className="ml-2" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="min-w-[160px] px-8 py-4 glass-btn rounded-full font-semibold text-lg text-white hover:bg-white/10 flex items-center justify-center border border-white/10"
              >
                Admin Login
              </motion.button>
            </div>
          </motion.div>

          {/* Right Content: Animated Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 flex justify-center lg:justify-end"
          >
            {/* Floating Animation Container */}
            <motion.div
              animate={{ y: [-15, 15] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }}
              className="relative w-full max-w-lg h-[460px]" // Increased size
            >
              {/* Background abstract elements */}
              <div className="absolute top-10 -right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

              {/* Main Interface Card with 3D Tilt */}
              <div
                className="absolute inset-0 glass-card rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-500"
                style={{
                  transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg)',
                  boxShadow: '20px 20px 60px rgba(0,0,0,0.5), -5px -5px 20px rgba(255,255,255,0.02)'
                }}
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  </div>
                  <div className="flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full">
                    <Lock size={10} className="text-gray-500" />
                    <div className="text-[10px] font-mono text-gray-500">certdapp.eth</div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-10 flex flex-col justify-center h-full relative">
                  {/* Input Field Animation */}
                  <div className="mb-8 space-y-3">
                    <div className="text-xs text-gray-400 font-medium ml-1 uppercase tracking-wider">Certificate ID</div>
                    <div className="h-14 bg-black/30 rounded-2xl border border-white/10 flex items-center px-5 overflow-hidden relative shadow-inner">
                      <motion.span
                        className="text-base font-mono text-white"
                        animate={{ opacity: [0.5, 1, 1, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0, delay: 1 }}
                        >0x8f27...e9a4</motion.span>
                      </motion.span>
                      <motion.div
                        className="w-0.5 h-6 bg-blue-500 ml-1.5"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    </div>
                  </div>

                  {/* Button Animation */}
                  <motion.div
                    animate={{ scale: [1, 0.96, 1], backgroundColor: ["#2563EB", "#1D4ED8", "#2563EB"] }}
                    transition={{ duration: 0.2, delay: 2.5, repeat: Infinity, repeatDelay: 7.8 }}
                    className="h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/20 mb-6 cursor-default"
                  >
                    Verify On-Chain
                  </motion.div>

                  {/* Result Card (Pop up) */}
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        y: [20, 0, 0, 20],
                        scale: [0.9, 1, 1, 0.9]
                      }}
                      transition={{
                        duration: 4,
                        times: [0.1, 0.2, 0.8, 1],
                        delay: 3,
                        repeat: Infinity,
                        repeatDelay: 4
                      }}
                      className="absolute bottom-8 left-8 right-8 p-5 rounded-2xl bg-[#0f0f11]/90 border border-green-500/40 backdrop-blur-xl shadow-2xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mr-4 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <div className="text-base font-bold text-white leading-none mb-1">Blockchain Verified</div>
                            <div className="text-xs text-green-400 font-medium">Issued by Kerala Blockchain Academy</div>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                      </div>

                      <div className="space-y-3">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
                        </div>
                        <div className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Transaction Hash</span>
                          <span className="text-[10px] text-blue-400 font-mono">0x72a...92b4</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Problem Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Trust Gap</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Traditional credentialing systems are failing. They are slow, insecure, and prone to manipulation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <FileX size={32} className="text-red-400" />, title: "Rampant Fraud", desc: "Forged degrees and fake certificates undermine institutional reputation." },
            { icon: <Clock size={32} className="text-orange-400" />, title: "Slow Verification", desc: "Manual background checks can take weeks to process." },
            { icon: <AlertTriangle size={32} className="text-yellow-400" />, title: "Lack of Transparency", desc: "Centralized databases are opaque and vulnerable to data breaches." }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent"
            >
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solution Section (Bento Repurposed) */}
      <section className="py-24 px-6 md:px-12 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:flex md:justify-between md:items-end">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Blockchain Advantage</h2>
              <p className="text-gray-400 text-lg">
                CertDapp leverages Ethereum smart contracts to ensure that once a certificate is issued, it exists permanently and immutably.
              </p>
            </div>
            <button
              onClick={() => navigate('/verify')}
              className="hidden md:flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium group"
            >
              Try Verification Demo <ChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 group hover:border-blue-500/30 transition-colors">
              <div className="mb-6"><Database className="text-blue-400" size={32} /></div>
              <h3 className="text-xl font-bold mb-3">Immutable Ledger</h3>
              <p className="text-gray-400">Records are cryptographically hashed and stored on-chain. Zero possibility of silent alteration.</p>
            </div>
            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 group hover:border-green-500/30 transition-colors">
              <div className="mb-6"><Zap className="text-green-400" size={32} /></div>
              <h3 className="text-xl font-bold mb-3">Instant Validation</h3>
              <p className="text-gray-400">Verify any document in milliseconds without contacting the issuer.</p>
            </div>
            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 group hover:border-purple-500/30 transition-colors">
              <div className="mb-6"><Globe className="text-purple-400" size={32} /></div>
              <h3 className="text-xl font-bold mb-3">Global Standard</h3>
              <p className="text-gray-400">Universally accessible verification infrastructure regardless of borders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Built for Every Stakeholder</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
              <Building2 size={32} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Universities</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">Issue tamper-proof degrees and reduce administrative overhead for verification requests.</p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
              <Briefcase size={32} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Recruiters</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">Instantly validate candidate credentials without waiting for third-party background checks.</p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-cyan-500/20">
              <GraduationCap size={32} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Students</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">Access your personalized dashboard to view and manage your blockchain-secured certificates with ease.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="verify-section" className="py-24 px-6 flex justify-center pb-40">
        <motion.div
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          initial={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-[2.5rem] p-12 md:p-24 text-center max-w-5xl w-full relative overflow-hidden border border-white/10"
        >
          <div className="absolute top-0 w-full h-full left-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white tracking-tight">Ready to Secure the Future?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join the decentralized network of trusted institutions. Start verifying or validiting certificates today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => navigate('/verify')}
              className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.15)] min-w-[200px]"
            >
              Verify Certificate
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-10 py-5 glass-btn rounded-full font-bold text-lg text-white hover:bg-white/10 border border-white/10 min-w-[200px]"
            >
              Admin Login
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Homepage;
