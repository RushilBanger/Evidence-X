import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, User, Calendar, FileText } from 'lucide-react';
import { CaseResponse } from '../../types';
import { CaseStatusBadge } from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';
import Button from '../common/Button';

export interface CaseCardProps {
  caseData: CaseResponse;
  documentCount?: number;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, documentCount }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all duration-200 hover:shadow-card flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-800/40 text-cyan-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold text-cyan-400 tracking-wider">
                {caseData.caseNumber}
              </span>
              <h4 className="text-base font-semibold text-white tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
                {caseData.title}
              </h4>
            </div>
          </div>
          <CaseStatusBadge status={caseData.status} size="sm" />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
          {caseData.description || 'No description provided for this legal case.'}
        </p>

        {/* Meta details */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">By: {caseData.createdBy || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{formatDateTime(caseData.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
          <FileText className="w-3.5 h-3.5 text-cyan-500" />
          <span>{documentCount !== undefined ? `${documentCount} documents` : 'Evidence Vault'}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/cases/${encodeURIComponent(caseData.caseNumber)}`)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Case
        </Button>
      </div>
    </div>
  );
};

export default CaseCard;
