import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Studio Light Simulator Logo"
    >
      <defs>
        <linearGradient id="logo-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" /> 
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="logo-yellow-grad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Abstract hexagonal shutter/aperture shape */}
      <g transform="translate(50 50)">
        {/* Top-Right segment */}
        <path d="M 0 -48 L 41.5 -24 L 0 0 Z" fill="url(#logo-blue-grad)" />
        {/* Right segment */}
        <path d="M 41.5 -24 L 41.5 24 L 0 0 Z" fill="url(#logo-yellow-grad)" />
        {/* Bottom-Right segment */}
        <path d="M 41.5 24 L 0 48 L 0 0 Z" fill="url(#logo-blue-grad)" />
        {/* Bottom-Left segment */}
        <path d="M 0 48 L -41.5 24 L 0 0 Z" fill="url(#logo-blue-grad)" />
        {/* Left segment */}
        <path d="M -41.5 24 L -41.5 -24 L 0 0 Z" fill="url(#logo-yellow-grad)" />
        {/* Top-Left segment */}
        <path d="M -41.5 -24 L 0 -48 L 0 0 Z" fill="url(#logo-blue-grad)" />
      </g>
    </svg>
  );
};

export default Logo;