import React from 'react';
import { Loader2, Shield } from 'lucide-react';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading data from secure vault...',
  size = 'md',
  fullPage = false,
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="relative flex items-center justify-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-cyan-400`} />
        {size === 'lg' && (
          <Shield className="w-5 h-5 text-cyan-500/50 absolute pointer-events-none" />
        )}
      </div>
      {message && (
        <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
