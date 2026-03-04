
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'blue' | 'purple' | 'green' | 'none';
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = 'none', onClick }) => {
  // Light theme: White bg, subtle gray border, shadow
  const baseClasses = "bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-300";
  
  const glowClass = glow === 'purple' 
    ? 'shadow-lg shadow-purple-500/10 border-purple-100' 
    : glow === 'blue'
    ? 'shadow-lg shadow-blue-500/10 border-blue-100'
    : glow === 'green'
    ? 'shadow-lg shadow-green-500/10 border-green-100'
    : 'hover:shadow-md';
  
  return (
    <div onClick={onClick} className={`${baseClasses} ${glowClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </div>
  );
};

export default GlassCard;
