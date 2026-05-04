import React from 'react';

export const HyperionLogo = ({ horizontal = false, className = "h-12 w-auto" }) => {
  if (horizontal) {
    return (
      <svg viewBox="0 0 420 120" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-logo-h" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(0, 5) scale(0.9)">
          <circle cx="60" cy="60" r="42" fill="none" stroke="#00D9FF" strokeWidth="2.2" />
          <circle cx="60" cy="60" r="32" fill="none" stroke="#00D9FF" strokeWidth="1.2" opacity="0.5" />
          <circle cx="60" cy="60" r="18" fill="#00D9FF" opacity="0.85" filter="url(#glow-logo-h)" />
          <circle cx="102" cy="60" r="7.5" fill="#00D9FF" opacity="0.95" filter="url(#glow-logo-h)" />
          <circle cx="42" cy="108" r="7.5" fill="#00D9FF" opacity="0.95" filter="url(#glow-logo-h)" />
          <circle cx="42" cy="12" r="7.5" fill="#00D9FF" opacity="0.95" filter="url(#glow-logo-h)" />
          <line x1="60" y1="60" x2="102" y2="60" stroke="#00D9FF" strokeWidth="1.5" opacity="0.65" />
          <line x1="60" y1="60" x2="42" y2="108" stroke="#00D9FF" strokeWidth="1.5" opacity="0.65" />
          <line x1="60" y1="60" x2="42" y2="12" stroke="#00D9FF" strokeWidth="1.5" opacity="0.65" />
          <polygon points="60,18 88,38 88,88 60,108 32,88 32,38" fill="none" stroke="#00D9FF" strokeWidth="1.8" opacity="0.45" />
        </g>
        <text x="130" y="65" fill="#ffffff" fontSize="42" fontWeight="800" fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif">HYPERION</text>
        <text x="130" y="92" fill="#00D9FF" fontSize="15" fontWeight="600" fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" letterSpacing="2px">CLINICAL AI ENGINE</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-logo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="60" r="42" fill="none" stroke="#00D9FF" strokeWidth="2.2" />
      <circle cx="100" cy="60" r="32" fill="none" stroke="#00D9FF" strokeWidth="1.2" opacity="0.5" />
      <circle cx="100" cy="60" r="18" fill="#00D9FF" opacity="0.85" filter="url(#glow-logo)" />
      <circle cx="142" cy="60" r="7.5" fill="#00D9FF" opacity="0.95" filter="url(#glow-logo)" />
      <circle cx="82" cy="108" r="7.5" fill="#00D9FF" opacity="0.95" filter="url(#glow-logo)" />
      <circle cx="82" cy="12" r="7.5" fill="#00D9FF" opacity="0.95" filter="url(#glow-logo)" />
      <line x1="100" y1="60" x2="142" y2="60" stroke="#00D9FF" strokeWidth="1.5" opacity="0.65" />
      <line x1="100" y1="60" x2="82" y2="108" stroke="#00D9FF" strokeWidth="1.5" opacity="0.65" />
      <line x1="100" y1="60" x2="82" y2="12" stroke="#00D9FF" strokeWidth="1.5" opacity="0.65" />
      <polygon points="100,18 128,38 128,88 100,108 72,88 72,38" fill="none" stroke="#00D9FF" strokeWidth="1.8" opacity="0.45" />
      <text x="100" y="165" fill="#ffffff" fontSize="28" fontWeight="700" fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" textAnchor="middle">HYPERION</text>
      <text x="100" y="185" fill="#00D9FF" fontSize="10" fontWeight="500" fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" letterSpacing="1.5px" textAnchor="middle">CLINICAL AI ENGINE</text>
    </svg>
  );
};

export const HyperionIcon = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 10 200 110" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow-icon" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="100" cy="60" r="42" fill="none" stroke="#00D9FF" strokeWidth="2.2" />
    <circle cx="100" cy="60" r="32" fill="none" stroke="#00D9FF" strokeWidth="1.2" opacity="0.5" />
    <circle cx="100" cy="60" r="18" fill="#00D9FF" opacity="0.85" filter="url(#glow-icon)" />
    <circle cx="142" cy="60" r="7.5" fill="#00D9FF" opacity="0.95" filter="url(#glow-icon)" />
    <circle cx="82" cy="108" r="7.5" fill="#00D9FF" opacity="0.95" filter="url(#glow-icon)" />
    <circle cx="82" cy="12" r="7.5" fill="#00D9FF" opacity="0.95" filter="url(#glow-icon)" />
    <line x1="100" y1="60" x2="142" y2="60" stroke="#00D9FF" strokeWidth="1.5" opacity="0.65" />
    <line x1="100" y1="60" x2="82" y2="108" stroke="#00D9FF" strokeWidth="1.5" opacity="0.65" />
    <line x1="100" y1="60" x2="82" y2="12" stroke="#00D9FF" strokeWidth="1.5" opacity="0.65" />
    <polygon points="100,18 128,38 128,88 100,108 72,88 72,38" fill="none" stroke="#00D9FF" strokeWidth="1.8" opacity="0.45" />
  </svg>
);
