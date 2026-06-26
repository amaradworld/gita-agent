import React from 'react';

export default function GitaLogo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Gita Gyan logo"
    >
      {/* Outer glow ring */}
      <circle cx="60" cy="60" r="56" stroke="url(#logo-gradient)" strokeWidth="2" opacity="0.3" />

      {/* Background circle with gradient */}
      <circle cx="60" cy="60" r="50" fill="url(#logo-bg)" />

      {/* Om symbol — stylized */}
      <g transform="translate(60, 58)">
        {/* Main Om curve */}
        <path
          d="M-18 8C-18 8-22-4-14-12C-6-20 8-18 8-12C8-6-2-2-8 2C-14 6-16 14-10 18C-4 22 6 20 10 16"
          stroke="url(#om-gradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Om tail */}
        <path
          d="M10 16C12 14 16 8 16 4C16 0 12-2 10 0"
          stroke="url(#om-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Om dot */}
        <circle cx="12" cy="-10" r="3" fill="url(#om-gradient)" />
        {/* Om crescent */}
        <path
          d="M6-8C8-12 14-12 16-8"
          stroke="url(#om-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Radiating lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="60"
          y1="10"
          x2="60"
          y2="6"
          stroke="url(#logo-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
          transform={`rotate(${angle} 60 60)`}
        />
      ))}

      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="100%" stopColor="#0c0a09" />
        </linearGradient>
        <linearGradient id="om-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}
