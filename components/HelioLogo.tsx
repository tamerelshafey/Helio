
import React from 'react';

interface LogoProps {
  className?: string;
}

export const HelioLogo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.6"></path>
      <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="currentColor"></path>
      <path d="M2 7L12 12L22 7L12 2L2 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
      <path d="M2 17L12 22L22 17L12 12L2 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
      <path d="M2 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
      <path d="M22 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
      <path d="M12 12V22" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
    </svg>
  );
};
