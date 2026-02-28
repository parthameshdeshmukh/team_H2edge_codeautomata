import React from 'react';
import { ShieldCheck, CheckCircle2, Award, Zap, Star } from 'lucide-react';
import QRCode from "react-qr-code";

const Certificate = ({ name, course, grade, date, id, performance }) => {
    // Default performance scores if none provided
    const scores = performance ? performance.split(',').map(Number) : [85, 90, 78, 92, 88];
    const metrics = ['Theory', 'Practical', 'Project', 'Assignment', 'Attendance'];

    // Helper to calculate radar chart points
    const getPoint = (index, value, radius) => {
        const angle = (index * 72 - 90) * (Math.PI / 180);
        const r = (value / 100) * radius;
        return {
            x: 100 + r * Math.cos(angle),
            y: 100 + r * Math.sin(angle)
        };
    };

    const radarPoints = scores.map((v, i) => getPoint(i, isNaN(v) ? 0 : v, 70)).map(p => `${p.x},${p.y}`).join(' ');
    const grid100 = [0, 1, 2, 3, 4].map((i) => getPoint(i, 100, 70)).map(p => `${p.x},${p.y}`).join(' ');
    const grid75 = [0, 1, 2, 3, 4].map((i) => getPoint(i, 75, 70)).map(p => `${p.x},${p.y}`).join(' ');
    const grid50 = [0, 1, 2, 3, 4].map((i) => getPoint(i, 50, 70)).map(p => `${p.x},${p.y}`).join(' ');
    const avgScore = Math.round(scores.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0) / Math.max(scores.length, 1));
    const verificationUrl = `${window.location.origin}/viewcertificate/${id || '0000'}`;

    return (
        <div id="certificate-content" className="relative w-full max-w-[1000px] aspect-[1.414/1] bg-[#fdfbf7] text-[#0a192f] shadow-2xl overflow-hidden font-serif p-0 border-[1.5px] border-[#b8860b]/40 m-auto flex flex-col">

            {/* Elegant Outer Padding with Border */}
            <div className="absolute inset-4 border-[1px] border-[#b8860b]/30 pointer-events-none" />

            {/* Subtle Parchment Wave Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="wave-pattern" width="100" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                            <path d="M0 10 Q 25 20, 50 10 T 100 10" fill="none" stroke="#b8860b" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#wave-pattern)" />
                </svg>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full px-12 py-8 justify-between">

                {/* TOP HEADER SECTION */}
                <div className="w-full flex justify-between items-start">
                    {/* Left: ID and Academic Excellence */}
                    <div className="flex flex-col space-y-2">
                        <div className="bg-[#b8860b] px-3 py-1 rounded-sm shadow-sm inline-block w-fit">
                            <span className="text-[9px] font-sans font-black text-white uppercase tracking-[0.2em]">ID: #{String(id || 'PREVIEW').padStart(6, '0')}</span>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-sans font-black text-[#0a192f] tracking-[0.2em] uppercase mb-0.5">Academic Excellence</p>
                            <p className="text-[8px] font-sans font-bold text-gray-400 uppercase tracking-widest leading-none">Global Standards Bureau | Verified Record</p>
                        </div>
                    </div>

                    {/* Right: Blockchain Secured */}
                    <div className="text-right">
                        <div className="inline-flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-100 mb-0.5">
                            <CheckCircle2 size={10} className="text-green-600" />
                            <span className="text-[8px] font-sans font-bold text-green-800 uppercase tracking-wider">Blockchain Secured</span>
                        </div>
                        <p className="text-[8px] font-sans font-bold text-gray-400 uppercase tracking-tight">Verified on Sepolia Network</p>
                    </div>
                </div>

                {/* MAIN BODY SECTION - Optimized for varied font lengths */}
                <div className="flex flex-col items-center w-full flex-1 justify-center py-4 min-h-0">
                    <h1 className="text-3xl font-serif font-black text-[#0a192f] tracking-tight leading-none mb-1">CERTIFICATE</h1>
                    <h2 className="text-sm font-serif font-bold text-[#b8860b] tracking-[0.4em] uppercase mb-6 italic">Of Achievement</h2>

                    <p className="text-[10px] text-gray-500 mb-1 font-serif italic">This is to certify that</p>
                    <h3 className="text-2xl md:text-3xl font-sans font-black text-[#0a192f] mb-3 tracking-tight uppercase border-b border-gray-100 px-8 pb-1 max-w-[90%] text-center line-clamp-1">{name || "PRATHAMESH BHASKAR DESHMUKH"}</h3>

                    <p className="text-[10px] text-gray-500 mb-1 font-serif italic">Has successfully completed the requirements for</p>
                    <h4 className="text-lg font-sans font-bold text-[#0a192f] mb-6 uppercase tracking-[0.15em] text-center max-w-[85%]">{course || "CERTIFIED BLOCKCHAIN ASSOCIATE"}</h4>

                    <div className="flex space-x-12">
                        <div className="text-center">
                            <p className="text-[9px] font-sans font-bold text-gray-400 uppercase tracking-widest mb-0.5">Final Grade</p>
                            <p className="text-xl font-sans font-black text-[#0a192f]">{grade || "S"}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-sans font-bold text-gray-400 uppercase tracking-widest mb-0.5">Issue Date</p>
                            <p className="text-xl font-sans font-black text-[#0a192f]">{date || "2024-05-22"}</p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM LAYOUT - Now more compact to prevent clipping */}
                <div className="w-full grid grid-cols-2 gap-8 items-center pt-4 border-t-[0.5px] border-[#b8860b]/20">

                    {/* LEFT COLUMN: PERFORMANCE MATRIX */}
                    <div className="flex items-center space-x-6 pl-4">
                        <div className="relative w-28 h-28 flex items-center justify-center p-1.5 bg-white/30 rounded-full border border-[#b8860b]/5 flex-shrink-0">
                            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm overflow-visible">
                                {/* Outer Black Boundary */}
                                <polygon points={grid100} fill="none" stroke="#000" strokeWidth="0.8" />

                                <polygon points={grid75} fill="none" stroke="#bbb" strokeWidth="0.5" strokeDasharray="1,1" />
                                <polygon points={grid50} fill="none" stroke="#bbb" strokeWidth="0.5" strokeDasharray="1,1" />

                                {[0, 1, 2, 3, 4].map(i => {
                                    const p = getPoint(i, 100, 75);
                                    return <line key={i} x1="100" y1="100" x2={p.x} y2={p.y} stroke="#eee" strokeWidth="0.5" />;
                                })}

                                {/* Inner labels background */}
                                <circle cx="100" cy="100" r="22" fill="#fff" stroke="#000" strokeWidth="0.5" />
                                <text x="100" y="98" fontSize="13" fontWeight="900" fill="#000" textAnchor="middle" style={{ fontFamily: 'sans-serif' }}>{avgScore}%</text>
                                <text x="100" y="109" fontSize="6" fontWeight="900" fill="#666" textAnchor="middle" className="uppercase tracking-widest" style={{ fontFamily: 'sans-serif' }}>Score</text>

                                {metrics.map((m, i) => {
                                    const p = getPoint(i, 132, 70);
                                    const score = scores[i];
                                    return (
                                        <text key={m} x={p.x} y={p.y} fontSize="9" fontWeight="800" fill="#000" textAnchor="middle" dominantBaseline="middle" className="uppercase" style={{ fontFamily: 'sans-serif' }}>
                                            {m} {isNaN(score) ? 0 : score}
                                        </text>
                                    );
                                })}

                                {/* Radar Coverage Area - Light Blue with thin black boundary */}
                                <polygon points={radarPoints} fill="rgba(186, 230, 253, 0.5)" stroke="#000" strokeWidth="1" strokeLinejoin="round" />

                                {scores.map((v, i) => {
                                    const pointVal = isNaN(v) ? 0 : v;
                                    const p = getPoint(i, pointVal, 70);
                                    return <circle key={i} cx={p.x} cy={p.y} r="2" fill="#0ea5e9" stroke="#000" strokeWidth="0.5" />;
                                })}
                            </svg>
                        </div>
                        <div className="text-left space-y-1 overflow-hidden">
                            <p className="text-[9px] font-sans font-black text-[#0a192f] tracking-widest uppercase truncate">Performance Index</p>
                            <div className="w-8 h-0.5 bg-[#b8860b]/30" />
                            <p className="text-[8px] font-sans font-bold text-gray-400 uppercase tracking-widest">Verified Metrics</p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SCAN TO VERIFY */}
                    <div className="flex items-center justify-end space-x-6 pr-4">
                        <div className="text-right space-y-1.5 overflow-hidden">
                            <p className="text-[9px] font-sans font-black text-[#b8860b] tracking-widest uppercase">Scan To Verify</p>
                            <div className="space-y-0.5">
                                <p className="text-[7px] font-sans font-bold text-gray-400 uppercase">Verification ID</p>
                                <p className="text-[9px] font-mono text-[#0a192f] truncate">
                                    {id ? id.toString() : 'PREVIEW'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-1.5 rounded shadow-lg border border-gray-100 transition-transform hover:scale-105 flex-shrink-0">
                            <QRCode value={verificationUrl} size={70} level={"H"} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Luxury Corner Labels */}
            <div className="absolute top-0 left-0 p-4">
                <div className="w-8 h-8 border-t border-l border-[#b8860b]/30" />
            </div>
            <div className="absolute top-0 right-0 p-4">
                <div className="w-8 h-8 border-t border-r border-[#b8860b]/30" />
            </div>
            <div className="absolute bottom-0 left-0 p-4">
                <div className="w-8 h-8 border-b border-l border-[#b8860b]/30" />
            </div>
            <div className="absolute bottom-0 right-0 p-4">
                <div className="w-8 h-8 border-b border-r border-[#b8860b]/30" />
            </div>
        </div>
    );
};
export default Certificate;
