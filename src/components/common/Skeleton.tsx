import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse bg-slate-800/80 border border-slate-700/30',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-800/50 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-6 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
