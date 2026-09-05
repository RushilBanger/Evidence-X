import React from 'react';
import { FileSearch, FolderOpen } from 'lucide-react';
import Button from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#111827]/60 border border-dashed border-slate-800 rounded-2xl my-4">
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-slate-400 mb-4 shadow-inner">
        {icon || <FolderOpen className="w-10 h-10 text-cyan-400/80" />}
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          leftIcon={actionIcon}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
