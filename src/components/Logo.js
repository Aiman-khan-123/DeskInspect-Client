import React from "react";

const Logo = ({ className = "h-10 w-10", variant = "gradient" }) => {
  if (variant === "white") {
    return (
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Graduation Cap Board */}
        <path d="M15 45 L50 30 L85 45 L50 60 Z" fill="white" opacity="0.95" />

        {/* Cap Base */}
        <path
          d="M35 50 L35 62 L50 68 L65 62 L65 50"
          fill="white"
          opacity="0.85"
        />

        {/* Tassel */}
        <circle cx="50" cy="30" r="3" fill="white" />
        <line x1="50" y1="33" x2="50" y2="45" stroke="white" strokeWidth="2" />
        <circle cx="50" cy="48" r="4" fill="white" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Primary Gradient */}
        <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B46C1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>

        {/* Secondary Gradient */}
        <linearGradient id="capGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6B46C1" />
        </linearGradient>

        {/* Tassel Gradient */}
        <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Shadow */}
        <filter id="shadow">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#6B46C1"
            floodOpacity="0.3"
          />
        </filter>

        {/* Glow */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Graduation Cap */}
      <g filter="url(#shadow)">
        {/* Cap Board - Diamond Shape */}
        <path d="M15 45 L50 30 L85 45 L50 60 Z" fill="url(#capGrad)" />

        {/* Top Highlight */}
        <path d="M15 45 L50 30 L85 45 L50 35 Z" fill="white" opacity="0.25" />

        {/* Side Highlight - Left */}
        <path d="M15 45 L50 60 L50 35 Z" fill="url(#capGrad)" opacity="0.4" />

        {/* Side Highlight - Right */}
        <path d="M50 35 L50 60 L85 45 Z" fill="url(#capGrad2)" opacity="0.6" />

        {/* Cap Base (3D effect) */}
        <path
          d="M35 50 L35 62 L50 68 L65 62 L65 50"
          fill="url(#capGrad2)"
          opacity="0.9"
        />

        {/* Base Highlight */}
        <path d="M35 50 L35 62 L50 68 L50 56 Z" fill="white" opacity="0.15" />
      </g>

      {/* Tassel */}
      <g filter="url(#glow)">
        {/* Button on Top */}
        <circle cx="50" cy="30" r="3.5" fill="url(#tasselGrad)" />
        <circle cx="50" cy="30" r="2" fill="white" opacity="0.4" />

        {/* Tassel String */}
        <line
          x1="50"
          y1="33"
          x2="50"
          y2="45"
          stroke="url(#tasselGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Tassel End */}
        <circle cx="50" cy="48" r="4.5" fill="url(#tasselGrad)" />
        <circle cx="50" cy="48" r="2.5" fill="white" opacity="0.3" />

        {/* Tassel Strands */}
        <line
          x1="47"
          y1="50"
          x2="47"
          y2="56"
          stroke="url(#tasselGrad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <line
          x1="50"
          y1="52"
          x2="50"
          y2="58"
          stroke="url(#tasselGrad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <line
          x1="53"
          y1="50"
          x2="53"
          y2="56"
          stroke="url(#tasselGrad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};

export default Logo;
