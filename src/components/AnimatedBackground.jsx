import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 bg-app-bg overflow-hidden">
            {/* 1. Base Gradient Layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-app-bg via-[#0f0f11] to-[#0a0a0c]" />

            {/* 2. Abstract "Running" SVG Lines - Blockchain/Network Theme */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                        <stop offset="50%" stopColor="rgba(56, 189, 248, 0.2)" />
                        <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                    </linearGradient>
                </defs>

                {/* Diagonal Grid Lines that "run" across the screen */}
                {[...Array(20)].map((_, i) => (
                    <motion.path
                        key={`line-${i}`}
                        d={`M-100 ${i * 100} L${2000} ${i * 100 - 500}`}
                        stroke="url(#grid-gradient)"
                        strokeWidth="1"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0, x: -100 }}
                        animate={{
                            pathLength: [0, 1, 0],
                            opacity: [0, 0.4, 0],
                            x: [0, 1000]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                    />
                ))}

                {/* Vertical "Data" Streams */}
                {[...Array(15)].map((_, i) => (
                    <motion.rect
                        key={`stream-${i}`}
                        x={100 + i * 150}
                        y="-100"
                        width="1"
                        height="100"
                        fill="rgba(56, 189, 248, 0.3)"
                        initial={{ y: -200, opacity: 0 }}
                        animate={{
                            y: ['100%', '110%'], // Move down
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "linear"
                        }}
                    />
                ))}
            </svg>

            {/* 3. Existing Color Blobs for Depth (Enhanced) */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
            <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-[100px] opacity-30 animate-pulse"></div>

            {/* 4. Overlay noise or texture if desired (Optional, keeping it clean for now) */}
        </div>
    );
};

export default AnimatedBackground;
