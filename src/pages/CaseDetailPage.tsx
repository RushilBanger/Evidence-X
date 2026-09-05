import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  UploadCloud,
  FileText,
  User,
  Calendar,
  Shield,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CaseResponse, DocumentResponse } from '../types';
import { caseService } from '../services/caseService';
import { documentService } from '../services/documentService';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { CaseStatusBadge } from '../components/common/Badge';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentTable from '../components/documents/DocumentTable';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';
import { formatDateTime } from '../utils/formatters';

export const CaseDetailPage: React.FC = () => {
  const { caseNumber } = useParams<{ caseNumber: string }>();
  const navigate = useNavigate();
  const { isAdmin, isInvestigator } = useAuth();

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters within case
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchCaseDetails = async () => {
    if (!caseNumber) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Case info
      const c = await caseService.getCaseByCaseNumber(caseNumber);
      setCaseData(c);

      // 2. Fetch linked documents
      const docs = await documentService.getDocumentsByCaseNumber(caseNumber);
      setDocuments(docs);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || `Case "${caseNumber}" could not be located in the database.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [caseNumber]);

  const filteredDocs = documents.filter((d) => {
    if (!searchDocQuery.trim()) return true;
    const q = searchDocQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.fileHash.toLowerCase().includes(q) ||
      (d.uploadedBy && d.uploadedBy.toLowerCase().includes(q))
    );
  });

  if (isLoading) {
    return <LoadingSpinner message={`Decrypting case dossier: ${caseNumber}...`} />;
  }

  if (errorMsg || !caseData) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl text-rose-300">
          <p className="text-sm font-semibold">Case Not Found</p>
          <p className="text-xs text-slate-400 mt-1">{errorMsg || 'Unable to find case dossier.'}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/cases')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Cases
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/cases')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Cases</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchCaseDetails}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          {(isAdmin || isInvestigator) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              leftIcon={<UploadCloud className="w-4 h-4 text-slate-950" />}
            >
              Upload Evidence
            </Button>
          )}
        </div>
      </div>

      {/* Case Dossier Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Briefcase className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-cyan-400 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-800/50">
                {caseData.caseNumber}
              </span>
              <CaseStatusBadge status={caseData.status} size="md" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {caseData.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase">Registered Docs</span>
              <span className="text-base font-bold text-cyan-300">{documents.length} Files</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Case Background & Investigation Details
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed bg-[#0d1320] p-4 rounded-xl border border-slate-800 font-sans">
            {caseData.description || 'No detailed investigation notes recorded for this case file.'}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Lead Officer: <strong className="text-slate-200">{caseData.createdBy || 'Unknown'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Filed On: <strong className="text-slate-200">{formatDateTime(caseData.createdAt)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>
              Jurisdiction: <strong className="text-slate-200">Legal Investigation Vault</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Linked Evidence Documents Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Linked Digital Evidence & Documents ({documents.length})
            </h3>
          </div>

          {documents.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search in this case..."
                  value={searchDocQuery}
                  onChange={(e) => setSearchDocQuery(e.target.value)}
                  className="w-full bg-[#111827] text-xs text-slate-100 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700/80 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-slate-800">
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
          )}
        </div>

        {documents.length === 0 ? (
          <EmptyState
            title="No Documents Linked to this Case"
            description="Upload affidavits, forensic extractions, CCTV logs, or legal filings to attach to this case."
            actionLabel={isAdmin || isInvestigator ? 'Upload First Document' : undefined}
            onAction={() => setIsUploadOpen(true)}
            actionIcon={<UploadCloud className="w-4 h-4" />}
          />
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            title="No Matching Documents Found"
            description="No documents in this case matched your search query."
          />
        ) : viewMode === 'table' ? (
          <DocumentTable documents={filteredDocs} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((d) => (
              <DocumentCard key={d.id} document={d} />
            ))}
          </div>
        )}
      </div>

      {/* Upload Document Modal for this case */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultCaseNumber={caseData.caseNumber}
        onSuccess={() => fetchCaseDetails()}
      />
    </div>
  );
};

export default CaseDetailPage;
