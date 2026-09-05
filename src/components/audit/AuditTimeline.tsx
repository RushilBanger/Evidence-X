import React from 'react';
import { ShieldCheck, ShieldAlert, FileUp, Download, Clock, User, Briefcase, Activity } from 'lucide-react';
import { AuditLogResponse } from '../../types';
import { DocumentActionBadge } from '../common/Badge';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';

export interface AuditTimelineProps {
  logs: AuditLogResponse[];
  isLoading?: boolean;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs, isLoading = false }) => {
  if (isLoading) {
    return <LoadingSpinner message="Fetching cryptographic audit ledger from backend..." />;
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center bg-[#111827]/40 border border-slate-800 rounded-xl">
        <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">No Audit Events Logged</p>
        <p className="text-xs text-slate-500 mt-1">
          Actions such as uploading, verifying integrity, and downloading are automatically recorded.
        </p>
      </div>
    );
  }

  const getActionIcon = (action: string, details?: string) => {
    if (action === 'DOCUMENT_UPLOADED') {
      return (
        <div className="p-2 rounded-full bg-blue-950/80 border border-blue-600/50 text-blue-400">
          <FileUp className="w-4 h-4" />
        </div>
      );
    }
    if (action === 'DOCUMENT_DOWNLOADED') {
      return (
        <div className="p-2 rounded-full bg-violet-950/80 border border-violet-600/50 text-violet-400">
          <Download className="w-4 h-4" />
        </div>
      );
    }
    if (action === 'DOCUMENT_VERIFIED') {
      if (details?.includes('MISMATCH')) {
        return (
          <div className="p-2 rounded-full bg-rose-950/80 border border-rose-600/50 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        );
      }
      return (
        <div className="p-2 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
        <Activity className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {logs.map((log) => (
        <div key={log.id} className="relative group">
          {/* Node Icon on Timeline */}
          <div className="absolute -left-6 top-0 -translate-x-1/2 bg-[#0b0f19] ring-4 ring-[#0b0f19] rounded-full">
            {getActionIcon(log.action, log.details)}
          </div>

          {/* Event Content Card */}
          <div className="bg-[#111827] border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm space-y-2.5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <DocumentActionBadge action={log.action} size="sm" />
                <span className="font-mono text-xs font-semibold text-cyan-400">
                  Case: {log.caseNumber}
                </span>
                {log.documentId && (
                  <span className="text-[11px] font-mono text-slate-400">
                    (Doc #{log.documentId})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span title={log.timestamp}>{formatRelativeTime(log.timestamp)}</span>
              </div>
            </div>

            {/* Details Description */}
            <div className="p-2.5 rounded-lg bg-[#0d1320] border border-slate-800/80 text-xs text-slate-200 font-mono flex items-center justify-between">
              <span className="leading-relaxed">{log.details || 'Action completed successfully.'}</span>
              {log.details?.includes('MATCH') && !log.details?.includes('MISMATCH') && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold uppercase">
                  Verified Valid
                </span>
              )}
              {log.details?.includes('MISMATCH') && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-semibold uppercase">
                  Mismatch
                </span>
              )}
            </div>

            {/* Footer Attribution */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-500" />
                <span>Actor: <strong className="text-slate-300">{log.username}</strong></span>
              </div>
              <span className="text-slate-500 font-mono">{formatDateTime(log.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuditTimeline;
