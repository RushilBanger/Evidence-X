import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Calendar, User } from 'lucide-react';
import { CaseResponse } from '../../types';
import { CaseStatusBadge } from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';
import Button from '../common/Button';

export interface CaseTableProps {
  cases: CaseResponse[];
  documentCounts?: Record<string, number>;
}

export const CaseTable: React.FC<CaseTableProps> = ({ cases, documentCounts = {} }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-[#111827]">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-[#141d2e] text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
          <tr>
            <th className="py-3.5 px-4">Case Number</th>
            <th className="py-3.5 px-4">Case Title & Description</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Created By</th>
            <th className="py-3.5 px-4">Created At</th>
            <th className="py-3.5 px-4">Docs</th>
            <th className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-normal">
          {cases.map((c) => (
            <tr
              key={c.id || c.caseNumber}
              className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
              onClick={() => navigate(`/cases/${encodeURIComponent(c.caseNumber)}`)}
            >
              <td className="py-3.5 px-4 font-mono font-semibold text-cyan-400 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  <span>{c.caseNumber}</span>
                </div>
              </td>
              <td className="py-3.5 px-4 max-w-xs">
                <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {c.title}
                </div>
                {c.description && (
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {c.description}
                  </div>
                )}
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <CaseStatusBadge status={c.status} size="sm" />
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.createdBy || 'Unknown'}</span>
                </div>
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDateTime(c.createdAt)}</span>
                </div>
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-300">
                {documentCounts[c.caseNumber] ?? '-'}
              </td>
              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/cases/${encodeURIComponent(c.caseNumber)}`);
                  }}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaseTable;
