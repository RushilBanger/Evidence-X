import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Plus,
  LayoutGrid,
  List,
  RefreshCw,
  Filter,
  FolderPlus,
  Shield,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CaseResponse, CaseStatus } from '../types';
import { caseService } from '../services/caseService';
import { documentService } from '../services/documentService';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import CaseCard from '../components/cases/CaseCard';
import CaseTable from '../components/cases/CaseTable';
import CreateCaseModal from '../components/cases/CreateCaseModal';

export const CasesPage: React.FC = () => {
  const { isAdmin, isInvestigator } = useAuth();
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CaseStatus>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchCases = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await caseService.getAllCases();
      setCases(data);

      // Optionally fetch document counts for each case
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (c) => {
          try {
            const docs = await documentService.getDocumentsByCaseNumber(c.caseNumber);
            counts[c.caseNumber] = docs.length;
          } catch {
            counts[c.caseNumber] = 0;
          }
        })
      );
      setDocCounts(counts);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || 'Failed to fetch case records from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.createdBy && c.createdBy.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cases, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            <span>Investigation Cases</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and manage all registered criminal and legal investigation case files.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchCases}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>

          {(isAdmin || isInvestigator) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Case File
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by case #, title, or investigator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1320] text-xs text-slate-100 pl-9 pr-3 py-2 rounded-lg border border-slate-700/80 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Status Filter & View Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 bg-[#0d1320] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({cases.length})
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                statusFilter === 'OPEN'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter('UNDER_INVESTIGATION')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                statusFilter === 'UNDER_INVESTIGATION'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('CLOSED')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                statusFilter === 'CLOSED'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Closed
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#0d1320] p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              title="Table View"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Grid View"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <LoadingSpinner message="Retrieving legal cases from database..." />
      ) : errorMsg ? (
        <div className="p-6 bg-rose-950/20 border border-rose-800/60 rounded-xl text-center">
          <p className="text-sm font-semibold text-rose-300">Error Loading Cases</p>
          <p className="text-xs text-slate-400 mt-1">{errorMsg}</p>
          <Button variant="secondary" size="sm" onClick={fetchCases} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredCases.length === 0 ? (
        <EmptyState
          title="No Matching Cases Found"
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'No case records matched your active filter or search query.'
              : 'There are currently no cases registered in the system.'
          }
          actionLabel={isAdmin || isInvestigator ? 'Register New Case' : undefined}
          onAction={() => setIsCreateOpen(true)}
          actionIcon={<FolderPlus className="w-4 h-4" />}
        />
      ) : viewMode === 'table' ? (
        <CaseTable cases={filteredCases} documentCounts={docCounts} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((c) => (
            <CaseCard
              key={c.caseNumber}
              caseData={c}
              documentCount={docCounts[c.caseNumber]}
            />
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      <CreateCaseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchCases()}
      />
    </div>
  );
};

export default CasesPage;
