import React from 'react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'blue' | 'violet';
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'cyan',
  trend,
  onClick,
}) => {
  const variantStyles = {
    cyan: {
      border: 'border-slate-800 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-950/50 text-cyan-400 border border-cyan-800/40',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)]',
    },
    emerald: {
      border: 'border-slate-800 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]',
    },
    amber: {
      border: 'border-slate-800 hover:border-amber-500/40',
      iconBg: 'bg-amber-950/50 text-amber-400 border border-amber-800/40',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]',
    },
    blue: {
      border: 'border-slate-800 hover:border-blue-500/40',
      iconBg: 'bg-blue-950/50 text-blue-400 border border-blue-800/40',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)]',
    },
    violet: {
      border: 'border-slate-800 hover:border-violet-500/40',
      iconBg: 'bg-violet-950/50 text-violet-400 border border-violet-800/40',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.15)]',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative bg-[#111827] border rounded-xl p-5 transition-all duration-200 flex flex-col justify-between overflow-hidden',
        style.border,
        style.glow,
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight font-mono">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${style.iconBg}`}>{icon}</div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && <span className="text-cyan-400 font-medium">{trend}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
