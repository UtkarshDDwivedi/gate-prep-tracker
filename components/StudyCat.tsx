"use client";

import React from "react";
import { motion } from "framer-motion";

export function StudyCat({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ scale: 0.95 }}
      animate={{ scale: [0.95, 1, 0.95] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width="150"
        height="125"
        viewBox="0 0 150 125"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto select-none"
      >
        {/* Headband tail fluttering behind */}
        <motion.path
          d="M106 48 C120 40, 130 52, 142 46 C134 56, 126 62, 110 58 Z"
          fill="#F59E0B"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: [-2, 4, -2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "106px", originY: "48px" }}
        />
        <motion.path
          d="M104 53 C118 52, 128 66, 138 64 C128 72, 118 70, 108 61 Z"
          fill="#D97706"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: [3, -3, 3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "104px", originY: "53px" }}
        />

        {/* Ears */}
        {/* Left Ear */}
        <path
          d="M48 34 L36 12 C34 9, 39 5, 43 9 L60 26 Z"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M43 28 L39 16 C38 14, 40 13, 42 15 L52 25 Z"
          fill="#FECDD3"
        />

        {/* Right Ear */}
        <path
          d="M84 26 L101 9 C105 5, 110 9, 108 12 L96 34 Z"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M92 25 L102 15 C104 13, 106 14, 105 16 L101 28 Z"
          fill="#FECDD3"
        />

        {/* Head Base */}
        <ellipse
          cx="72"
          cy="48"
          rx="36"
          ry="30"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="3"
        />

        {/* Yellow Headband */}
        <path
          d="M38 46 C48 38, 96 38, 106 46 L104 56 C94 48, 50 48, 40 56 Z"
          fill="#FBBF24"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Headband Knot */}
        <ellipse
          cx="106"
          cy="50"
          rx="5"
          ry="6"
          fill="#F59E0B"
          stroke="#1F2937"
          strokeWidth="2"
        />

        {/* Determined Eyebrows */}
        <path
          d="M52 42 L62 46"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M92 42 L82 46"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Eyes (Focused / Determined) */}
        <circle cx="56" cy="52" r="3.5" fill="#1F2937" />
        <circle cx="88" cy="52" r="3.5" fill="#1F2937" />
        {/* Eye highlights */}
        <circle cx="55" cy="50.5" r="1.2" fill="#FFFFFF" />
        <circle cx="87" cy="50.5" r="1.2" fill="#FFFFFF" />

        {/* Nose */}
        <polygon points="72,57 70,55 74,55" fill="#F43F5E" />

        {/* Focused Mouth / Concentrating line */}
        <path
          d="M69 61 C71 63, 73 63, 75 61"
          stroke="#1F2937"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Cute Whiskers */}
        <line x1="38" y1="56" x2="48" y2="57" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="36" y1="61" x2="47" y2="60" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="96" y1="57" x2="106" y2="56" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="97" y1="60" x2="108" y2="61" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />

        {/* Body / Shoulders */}
        <path
          d="M48 74 C44 85, 42 105, 42 110 L102 110 C102 105, 100 85, 96 74 Z"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="3"
        />

        {/* Open Notebook */}
        <path
          d="M44 98 L72 92 L100 98 L104 116 L72 111 L40 116 Z"
          fill="#F3F4F6"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Spine & pages */}
        <line x1="72" y1="92" x2="72" y2="111" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="2 2" />
        <line x1="50" y1="102" x2="66" y2="99" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="49" y1="107" x2="65" y2="104" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="78" y1="99" x2="94" y2="102" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="79" y1="104" x2="95" y2="107" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* Left Paw holding notebook */}
        <ellipse
          cx="52"
          cy="97"
          rx="7"
          ry="5"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="2.5"
        />

        {/* Right Paw holding pencil */}
        <ellipse
          cx="88"
          cy="95"
          rx="7"
          ry="5"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="2.5"
        />

        {/* Pencil */}
        <path
          d="M86 92 L76 80 L73 83 L83 95 Z"
          fill="#FBBF24"
          stroke="#1F2937"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polygon points="76,80 72,76 73,83" fill="#E2E8F0" stroke="#1F2937" strokeWidth="1.5" />
        <polygon points="73,77 72,76 74,79" fill="#1F2937" />

        {/* Grass tufts around bottom */}
        <path d="M28 114 C30 110, 31 108, 33 115" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
        <path d="M33 115 C35 109, 37 108, 38 116" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
        <path d="M112 116 C114 110, 116 109, 117 117" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
        <path d="M117 117 C119 112, 121 111, 122 118" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}
