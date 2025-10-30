
import React from 'react';

interface LogoProps {
  className?: string;
}

export const HelioLogo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* The Sun */}
      <circle cx="12" cy="8" r="4" opacity="0.5"/> 
      
      {/* The Building / Gate / 'H' Monogram */}
      <path 
        d="M4 21V7H8V11C8 11.5523 8.44772 12 9 12H15C15.5523 12 16 11.5523 16 11V7H20V21H16V16C16 15.4477 15.5523 15 15 15H9C8.44772 15 8 15.4477 8 16V21H4Z"
      />
    </svg>
  );
};
