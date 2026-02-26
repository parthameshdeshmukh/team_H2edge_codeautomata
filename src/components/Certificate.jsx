import React from 'react';
import logo from '../assets/images/dapp-logo.png'; // Make sure this path is correct or update it
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import QRCode from "react-qr-code";

const Certificate = ({ name, course, grade, date, id }) => {
    return (
        <div id="certificate-content" className="relative w-full max-w-[800px] bg-white text-black shadow-2xl overflow-hidden font-serif border-8 border-double border-gray-100 p-10 md:p-16">

            {/* Subtle Paper Texture / Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                <ShieldCheck size={400} />
            </div>

            {/* Verification Badge */}
            <div className="absolute top-8 right-8 flex items-center space-x-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-100 shadow-sm z-20">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-xs font-bold text-green-700 tracking-wide uppercase">Blockchain Verified</span>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center h-full justify-between space-y-8">

                {/* Header */}
                <div className="flex flex-col items-center">
                    {/* Placeholder Logo if image is missing, or use the imported one */}
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mb-6 shadow-md">
                        <span className="text-2xl font-bold">C</span>
                    </div>
                    {/* <img src={logo} className="h-20 object-contain mb-6" alt="KBA Logo" /> */}

                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 tracking-tight mb-2">Certificate of Achievement</h1>
                    <p className="text-gray-500 uppercase tracking-[0.2em] text-xs font-sans font-semibold mt-2">Official Digital Credential</p>
                </div>

                {/* Body */}
                <div className="w-full max-w-2xl space-y-6 my-8">
                    <div>
                        <p className="text-lg text-gray-500 font-serif italic mb-2">This certifies that</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-b border-gray-200 pb-4 inline-block min-w-[300px]">{name || "Candidate Name"}</h2>
                    </div>

                    <div>
                        <p className="text-lg text-gray-500 font-serif italic mb-2">has successfully completed the course</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{course || "Blockchain Course Name"}</h3>
                    </div>

                    <div className="flex justify-center items-center space-x-12 mt-8">
                        <div>
                            <p className="text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-1">Grade</p>
                            <p className="text-xl font-bold text-gray-900">{grade || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-1">Date Issued</p>
                            <p className="text-xl font-bold text-gray-900">{date || "YYYY-MM-DD"}</p>
                        </div>
                    </div>
                </div>

                {/* Footer with QR and ID */}
                <div className="w-full flex justify-between items-end mt-12 pt-8 border-t border-gray-100">
                    <div className="text-left">
                        <p className="text-gray-400 text-[10px] uppercase font-sans font-bold tracking-widest mb-2">Certificate ID</p>
                        <p className="font-mono text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded inline-block text-sm border border-gray-100">{id || "0000"}</p>
                        <p className="text-[10px] text-gray-400 mt-2 max-w-[200px] leading-tight font-sans">
                            This certificate is recorded on the Ethereum blockchain and can be verified using the ID or QR code.
                        </p>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="bg-white p-2 rounded-lg border border-gray-100 mb-2">
                            {/* Create a verification link - assuming localhost for now or the deployed URL */}
                            <QRCode value={`https://certdapp.com/verify/${id}`} size={64} level={"L"} />
                        </div>
                        <p className="text-gray-400 text-[10px] uppercase font-sans font-bold tracking-widest">Scan to Verify</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
