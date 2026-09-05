import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History,
  Shield,
  FileText,
  Search,
  RefreshCw,
  Clock,
  User,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { AuditLogResponse, DocumentResponse } from '../types';
import { auditService } from '../services/auditService';
import { documentService } from '../services/documentService';
import { caseService } from '../services/caseService';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import AuditTimeline from '../components/audit/AuditTimeline';
import HashBadge from '../components/common/HashBadge';
import { useToast } from '../hooks/useToast';

export const AuditTrailPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const docIdParam = searchParams.get('docId') || '';
  const { error } = useToast();

  const [documentId, setDocumentId] = useState<string>(docIdParam);
  const [activeDoc, setActiveDoc] = useState<DocumentResponse | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load available documents for dropdown
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const cases = await caseService.getAllCases();
        const docPromises = cases.slice(0, 10).map((c) =>
          documentService.getDocumentsByCaseNumber(c.caseNumber).catch(() => [])
        );
        const nested = await Promise.all(docPromises);
        const flat = nested.flat();
        const unique = new Map<number, DocumentResponse>();
        flat.forEach((d) => unique.set(d.id, d));
        const list = Array.from(unique.values());
        setRecentDocs(list);

        // If no param was specified and we have documents, default to first document
        if (!docIdParam && list.length > 0) {
          setDocumentId(list[0].id.toString());
          loadAuditHistory(list[0].id);
        }
      } catch {
        // Fallback
      }
    };
    loadDocs();
  }, []);

  const loadAuditHistory = async (idNum: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch doc metadata
      try {
        const doc = await documentService.getDocumentById(idNum);
        setActiveDoc(doc);
      } catch {
        setActiveDoc(null);
      }

      // 2. Fetch audits
      const logs = await auditService.getDocumentAuditHistory(idNum);
      setAuditLogs(logs);
      setSearchParams({ docId: idNum.toString() }, { replace: true });
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || `Unable to fetch audit log for Document #${idNum}`);
      setAuditLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = parseInt(documentId, 10);
    if (isNaN(idNum) || idNum <= 0) {
      error('Invalid Input', 'Please enter a valid numeric Document ID.');
      return;
    }
    loadAuditHistory(idNum);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <History className="w-6 h-6 text-cyan-400" />
          <span>Cryptographic Audit Ledger</span>
        </h2>
        <p className="text-xs text-slate-400">
          Inspect immutable chronological access logs, hash verification history, and chain-of-custody records.
        </p>
      </div>

      {/* Target Document Selector Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleInspectSubmit} className="flex flex-col md:flex-row items-end gap-4">
          {/* Document ID or Selector */}
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Document to Inspect Chain of Custody
            </label>
            {recentDocs.length > 0 ? (
              <select
                value={documentId}
                onChange={(e) => {
                  setDocumentId(e.target.value);
                  if (e.target.value) {
                    loadAuditHistory(parseInt(e.target.value, 10));
                  }
                }}
                className="w-full bg-[#0d1320] text-sm text-slate-100 rounded-lg border border-slate-700/80 px-3.5 py-2.5 focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose a Document from Vault --</option>
                {recentDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    Doc #{d.id} • {d.title} ({d.caseNumber})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                placeholder="Enter Document ID (e.g. 1)"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="w-full bg-[#0d1320] text-sm text-slate-100 rounded-lg border border-slate-700/80 px-3.5 py-2.5 focus:border-cyan-500 focus:outline-none font-mono"
              />
            )}
          </div>

          {/* Manual Input Fallback */}
          <div className="w-full md:w-48 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Or Document ID #
            </label>
            <input
              type="number"
              placeholder="e.g. 1"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="w-full bg-[#0d1320] text-sm text-slate-100 rounded-lg border border-slate-700/80 px-3.5 py-2.5 focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={<Search className="w-4 h-4 text-slate-950" />}
            className="w-full md:w-auto shrink-0"
          >
            Audit History
          </Button>
        </form>

        {/* Selected Doc Summary Banner */}
        {activeDoc && (
          <div className="p-4 rounded-xl bg-[#0d1320] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-700/40 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{activeDoc.title}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                  <span>Case: {activeDoc.caseNumber}</span>
                  <span>•</span>
                  <span>Doc ID: #{activeDoc.id}</span>
                </div>
              </div>
            </div>

            <HashBadge hash={activeDoc.fileHash} />
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Chronological Audit Trail Events
            </h3>
          </div>
          {documentId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const idNum = parseInt(documentId, 10);
                if (!isNaN(idNum)) loadAuditHistory(idNum);
              }}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner message={`Querying immutable audit logs for Document #${documentId}...`} />
        ) : errorMsg ? (
          <div className="p-6 bg-rose-950/20 border border-rose-800/60 rounded-xl text-center">
            <p className="text-sm font-semibold text-rose-300">Audit Query Failed</p>
            <p className="text-xs text-slate-400 mt-1">{errorMsg}</p>
          </div>
        ) : !documentId ? (
          <EmptyState
            title="No Document Selected"
            description="Select a document above to inspect its cryptographic chain of evidence and access history."
          />
        ) : (
          <AuditTimeline logs={auditLogs} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default AuditTrailPage;
