import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ShieldCheck, ShieldAlert, Shield, CheckCircle2, Clock, Lock, FileUp, Download, Eye } from 'lucide-react';
import { CaseStatus, DocumentAction, Role } from '../../types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet' | 'blue';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  dot,
  className,
}) => {
  const variantStyles = {
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50 shadow-sm',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 shadow-sm',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-700/50 shadow-sm',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-700/50 shadow-sm',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700 shadow-sm',
    violet: 'bg-violet-950/60 text-violet-300 border-violet-700/50 shadow-sm',
    blue: 'bg-blue-950/60 text-blue-300 border-blue-700/50 shadow-sm',
  };

  const dotColors = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    slate: 'bg-slate-400',
    violet: 'bg-violet-400',
    blue: 'bg-blue-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-full border whitespace-nowrap tracking-wide select-none',
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </span>
  );
};

// Specialized Role Badge
export const RoleBadge: React.FC<{ role: Role | string; size?: 'sm' | 'md' }> = ({ role, size = 'md' }) => {
  switch (role) {
    case 'ADMIN':
      return (
        <Badge variant="violet" size={size} icon={<Lock className="w-3 h-3" />}>
          ADMIN
        </Badge>
      );
    case 'INVESTIGATOR':
      return (
        <Badge variant="cyan" size={size} icon={<Shield className="w-3 h-3" />}>
          INVESTIGATOR
        </Badge>
      );
    case 'VIEWER':
    default:
      return (
        <Badge variant="slate" size={size} icon={<Eye className="w-3 h-3" />}>
          VIEWER
        </Badge>
      );
  }
};

// Specialized Case Status Badge
export const CaseStatusBadge: React.FC<{ status: CaseStatus | string; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'OPEN':
      return (
        <Badge variant="cyan" size={size} dot>
          OPEN
        </Badge>
      );
    case 'UNDER_INVESTIGATION':
      return (
        <Badge variant="amber" size={size} icon={<Clock className="w-3 h-3" />}>
          UNDER INVESTIGATION
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge variant="slate" size={size} icon={<CheckCircle2 className="w-3 h-3" />}>
          CLOSED
        </Badge>
      );
    default:
      return (
        <Badge variant="slate" size={size}>
          {status}
        </Badge>
      );
  }
};

// Specialized Document Status Badge
export const DocumentStatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  if (status === 'ACTIVE') {
    return (
      <Badge variant="emerald" size={size} dot>
        ACTIVE
      </Badge>
    );
  }
  return (
    <Badge variant="slate" size={size}>
      {status || 'ARCHIVED'}
    </Badge>
  );
};

// Specialized Action Badge
export const DocumentActionBadge: React.FC<{ action: DocumentAction | string; size?: 'sm' | 'md' }> = ({
  action,
  size = 'md',
}) => {
  switch (action) {
    case 'DOCUMENT_UPLOADED':
      return (
        <Badge variant="blue" size={size} icon={<FileUp className="w-3 h-3" />}>
          UPLOADED
        </Badge>
      );
    case 'DOCUMENT_VERIFIED':
      return (
        <Badge variant="emerald" size={size} icon={<ShieldCheck className="w-3 h-3" />}>
          VERIFIED
        </Badge>
      );
    case 'DOCUMENT_DOWNLOADED':
      return (
        <Badge variant="violet" size={size} icon={<Download className="w-3 h-3" />}>
          DOWNLOADED
        </Badge>
      );
    default:
      return (
        <Badge variant="slate" size={size}>
          {action}
        </Badge>
      );
  }
};

// Specialized Integrity Status Badge
export const IntegrityStatusBadge: React.FC<{ isValid: boolean | null; size?: 'sm' | 'md' }> = ({
  isValid,
  size = 'md',
}) => {
  if (isValid === null) {
    return (
      <Badge variant="slate" size={size} icon={<Shield className="w-3.5 h-3.5" />}>
        UNVERIFIED
      </Badge>
    );
  }

  if (isValid) {
    return (
      <Badge variant="emerald" size={size} icon={<ShieldCheck className="w-3.5 h-3.5" />}>
        INTEGRITY VERIFIED
      </Badge>
    );
  }

  return (
    <Badge variant="rose" size={size} icon={<ShieldAlert className="w-3.5 h-3.5" />}>
      INTEGRITY MISMATCH
    </Badge>
  );
};

export default Badge;
