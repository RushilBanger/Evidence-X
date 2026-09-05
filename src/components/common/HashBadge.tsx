import React, { useState } from 'react';
import { Copy, Check, Hash } from 'lucide-react';
import { truncateHash } from '../../utils/formatters';

export interface HashBadgeProps {
  hash: string;
  full?: boolean;
  copyable?: boolean;
  className?: string;
  label?: string;
}

export const HashBadge: React.FC<HashBadgeProps> = ({
  hash,
  full = false,
  copyable = true,
  className = '',
  label,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hash) {
    return <span className="text-xs text-slate-500 font-mono italic">No hash available</span>;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {label && <span className="text-[11px] font-semibold uppercase text-slate-400">{label}:</span>}
      <div
        onClick={copyable ? handleCopy : undefined}
        title={copyable ? 'Click to copy full SHA-256 hash' : undefined}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 font-mono text-xs text-cyan-300 select-all group transition-colors ${
          copyable ? 'hover:border-cyan-500/50 hover:bg-slate-850 cursor-pointer' : ''
        }`}
      >
        <Hash className="w-3.5 h-3.5 text-cyan-500/70 shrink-0" />
        <span className="tracking-wider">
          {full ? hash : truncateHash(hash, 10, 8)}
        </span>
        {copyable && (
          <span className="text-slate-400 group-hover:text-cyan-300 transition-colors ml-0.5">
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-fade-in" />
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default HashBadge;
