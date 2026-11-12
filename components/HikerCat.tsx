"use client";

import React from "react";
import { motion } from "framer-motion";

export function HikerCat({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative inline-block select-none ${className}`}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width="110"
        height="95"
        viewBox="0 0 110 95"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Walking stick */}
        <line
          x1="28"
          y1="48"
          x2="24"
          y2="88"
          stroke="#78350F"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Green Backpack */}
        <path
          d="M 68 45 C 80 43, 85 55, 84 72 C 82 80, 72 82, 65 79 Z"
          fill="#15803D"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Backpack flap & strap */}
        <path
          d="M 68 46 C 76 45, 82 50, 82 55 L 67 57 Z"
          fill="#16A34A"
          stroke="#1F2937"
          strokeWidth="2"
        />
        <line x1="68" y1="52" x2="68" y2="76" stroke="#1F2937" strokeWidth="2" />

        {/* Tail sticking out behind */}
        <path
          d="M 78 72 C 90 70, 94 62, 92 56"
          stroke="#1F2937"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cat Body */}
        <ellipse
          cx="52"
          cy="66"
          rx="18"
          ry="17"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="2.5"
        />

        {/* Little paws / feet */}
        <ellipse
          cx="44"
          cy="83"
          rx="6"
          ry="4"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="2.5"
        />
        <ellipse
          cx="60"
          cy="82"
          rx="6"
          ry="4"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="2.5"
        />

        {/* Left hand holding stick */}
        <ellipse
          cx="28"
          cy="52"
          rx="4.5"
          ry="4.5"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="2"
        />

        {/* Cat Head */}
        <ellipse
          cx="50"
          cy="36"
          rx="19"
          ry="16"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="2.5"
        />

        {/* Cat Ears */}
        {/* Left Ear */}
        <path
          d="M 35 27 L 31 12 L 45 22 Z"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M 36 24 L 34 16 L 42 22 Z" fill="#FCA5A5" />

        {/* Right Ear */}
        <path
          d="M 57 22 L 67 13 L 65 28 Z"
          fill="#FFFFFF"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M 59 23 L 64 16 L 63 26 Z" fill="#FCA5A5" />

        {/* Orange Headband wrapped around head */}
        <path
          d="M 31 32 C 42 27, 58 27, 69 32 L 68 38 C 58 33, 42 33, 31 38 Z"
          fill="#EA580C"
          stroke="#1F2937"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Flapping headband knot on right */}
        <motion.g
          animate={{ rotate: [-3, 5, -3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "68px", originY: "34px" }}
        >
          <path
            d="M 68 34 C 76 33, 84 37, 88 41 C 82 43, 76 39, 68 37 Z"
            fill="#EA580C"
            stroke="#1F2937"
            strokeWidth="2"
          />
          <path
            d="M 68 36 C 74 38, 80 44, 82 50 C 76 47, 72 42, 68 38 Z"
            fill="#EA580C"
            stroke="#1F2937"
            strokeWidth="2"
          />
        </motion.g>

        {/* Face Features */}
        {/* Determined Eyes */}
        <path
          d="M 40 37 L 45 35"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 57 35 L 62 37"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <line x1="30" y1="41" x2="23" y2="40" stroke="#1F2937" strokeWidth="1.5" />
        <line x1="30" y1="44" x2="24" y2="45" stroke="#1F2937" strokeWidth="1.5" />
        <line x1="68" y1="41" x2="74" y2="40" stroke="#1F2937" strokeWidth="1.5" />
        <line x1="68" y1="44" x2="73" y2="45" stroke="#1F2937" strokeWidth="1.5" />

        {/* Cute Nose and Mouth */}
        <ellipse cx="51" cy="42" rx="1.5" ry="1.2" fill="#1F2937" />
        <path
          d="M 48 45 Q 51 47, 54 45"
          stroke="#1F2937"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cute blush cheeks */}
        <circle cx="37" cy="43" r="2.5" fill="#FECDD3" opacity="0.8" />
        <circle cx="65" cy="43" r="2.5" fill="#FECDD3" opacity="0.8" />
      </svg>
    </motion.div>
  );
}
