import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  UploadCloud,
  LayoutGrid,
  List,
  RefreshCw,
  Filter,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DocumentResponse, CaseResponse } from '../types';
import { caseService } from '../services/caseService';
import { documentService } from '../services/documentService';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentTable from '../components/documents/DocumentTable';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';

export const DocumentsPage: React.FC = () => {
  const { isAdmin, isInvestigator } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCase = searchParams.get('case') || 'ALL';

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<string>(initialCase);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchVaultData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch cases
      const allCases = await caseService.getAllCases();
      setCases(allCases);

      // 2. Fetch documents across cases
      const docPromises = allCases.map((c) =>
        documentService.getDocumentsByCaseNumber(c.caseNumber).catch(() => [])
      );
      const docsNested = await Promise.all(docPromises);
      const allDocs = docsNested.flat();

      // Deduplicate by ID
      const uniqueDocs = new Map<number, DocumentResponse>();
      allDocs.forEach((d) => uniqueDocs.set(d.id, d));
      const sortedDocs = Array.from(uniqueDocs.values()).sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      setDocuments(sortedDocs);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || 'Failed to retrieve documents from vault.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.uploadedBy && doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCase = selectedCase === 'ALL' || doc.caseNumber === selectedCase;
      const matchesStatus = selectedStatus === 'ALL' || doc.status === selectedStatus;

      return matchesSearch && matchesCase && matchesStatus;
    });
  }, [documents, searchQuery, selectedCase, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Digital Document Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic catalog of all ingested legal documents and digital evidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchVaultData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
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
              Ingest Document
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, hash, case, uploader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1320] text-xs text-slate-100 pl-9 pr-3 py-2 rounded-lg border border-slate-700/80 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap justify-between lg:justify-end">
          {/* Case Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Case:</span>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="bg-[#0d1320] text-xs text-slate-100 rounded-lg border border-slate-700/80 px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="ALL">All Cases ({cases.length})</option>
              {cases.map((c) => (
                <option key={c.caseNumber} value={c.caseNumber}>
                  {c.caseNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#0d1320] text-xs text-slate-100 rounded-lg border border-slate-700/80 px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* View Mode */}
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

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner message="Scanning document repositories and cryptographic manifests..." />
      ) : errorMsg ? (
        <div className="p-6 bg-rose-950/20 border border-rose-800/60 rounded-xl text-center">
          <p className="text-sm font-semibold text-rose-300">Vault Access Error</p>
          <p className="text-xs text-slate-400 mt-1">{errorMsg}</p>
          <Button variant="secondary" size="sm" onClick={fetchVaultData} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          title="No Documents Found"
          description={
            searchQuery || selectedCase !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No documents matched the chosen criteria.'
              : 'The evidence vault is currently empty.'
          }
          actionLabel={isAdmin || isInvestigator ? 'Ingest Document' : undefined}
          onAction={() => setIsUploadOpen(true)}
          actionIcon={<UploadCloud className="w-4 h-4" />}
        />
      ) : viewMode === 'table' ? (
        <DocumentTable documents={filteredDocuments} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => fetchVaultData()}
      />
    </div>
  );
};

export default DocumentsPage;
