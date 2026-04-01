import React from 'react';
import { motion } from 'framer-motion';

interface WingedHeartProps {
  size?: number;
  className?: string;
  fill?: string;
}

export const WingedHeart = ({ size = 24, className = "", fill = "currentColor" }: WingedHeartProps) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Wing - More detailed feathery shape */}
      <motion.path
        d="M10 10C7 10 4 8 2 4C1.5 3 2.5 1.5 4 1.5C5.5 1.5 7 3 8 5M10 10C8.5 10 7 9 6 7.5M10 10C9 10 8 9.5 7.5 8.5"
        stroke={fill}
        strokeWidth="1.2"
        strokeLinecap="round"
        animate={{ 
          rotate: [-15, 10, -15],
          translateY: [0, -1, 0],
          translateX: [0, -0.5, 0]
        }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        style={{ originX: "10px", originY: "10px" }}
      />
      {/* Right Wing - More detailed feathery shape */}
      <motion.path
        d="M14 10C17 10 20 8 22 4C22.5 3 21.5 1.5 20 1.5C18.5 1.5 17 3 16 5M14 10C15.5 10 17 9 18 7.5M14 10C15 10 16 9.5 16.5 8.5"
        stroke={fill}
        strokeWidth="1.2"
        strokeLinecap="round"
        animate={{ 
          rotate: [15, -10, 15],
          translateY: [0, -1, 0],
          translateX: [0, 0.5, 0]
        }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        style={{ originX: "14px", originY: "10px" }}
      />
      {/* Heart - Pulsing animation */}
      <motion.path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
        fill={fill}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
        style={{ originX: "12px", originY: "12px" }}
      />
    </motion.svg>
  );
};
