import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Download,
  ShieldCheck,
  ShieldAlert,
  Shield,
  FileSearch,
  User,
  Calendar,
  Briefcase,
  History,
  Hash,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DocumentResponse, AuditLogResponse } from '../types';
import { documentService } from '../services/documentService';
import { auditService } from '../services/auditService';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DocumentStatusBadge } from '../components/common/Badge';
import HashBadge from '../components/common/HashBadge';
import AuditTimeline from '../components/audit/AuditTimeline';
import IntegrityVerifyModal from '../components/documents/IntegrityVerifyModal';
import OcrViewerModal from '../components/documents/OcrViewerModal';
import { formatDateTime } from '../utils/formatters';
import { useToast } from '../hooks/useToast';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [document, setDocument] = useState<DocumentResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditsLoading, setIsAuditsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Integrity Check State
  const [liveIntegrity, setLiveIntegrity] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // OCR state
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchDocumentAndAudits = async () => {
    if (!id) return;
    const docId = parseInt(id, 10);
    if (isNaN(docId)) {
      setErrorMsg('Invalid document ID specified.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch document metadata
      const doc = await documentService.getDocumentById(docId);
      setDocument(doc);

      // 2. Fetch audit logs
      setIsAuditsLoading(true);
      try {
        const logs = await auditService.getDocumentAuditHistory(docId);
        setAuditLogs(logs);
      } catch {
        setAuditLogs([]);
      } finally {
        setIsAuditsLoading(false);
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || `Document #${id} could not be retrieved from the vault.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentAndAudits();
  }, [id]);

  const handleVerifyIntegrity = async () => {
    if (!document) return;
    setIsVerifying(true);
    try {
      const isValid = await documentService.verifyDocumentIntegrity(document.id);
      setLiveIntegrity(isValid);
      if (isValid) {
        success('Integrity Verified (MATCH)', 'Live file hash matches the stored cryptographic record.');
      } else {
        error('Integrity Mismatch Detected', 'Live storage hash differs from recorded signature.');
      }
      // Re-fetch audit logs to show newly added DOCUMENT_VERIFIED entry!
      const updatedLogs = await auditService.getDocumentAuditHistory(document.id);
      setAuditLogs(updatedLogs);
    } catch (err: unknown) {
      const errObj = err as Error;
      error('Verification Error', errObj.message || 'Failed to verify document integrity.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    setIsDownloading(true);
    try {
      await documentService.downloadDocument(document.id, `${document.title}.pdf`);
      success('Download Started', `Downloading: ${document.title}`);
      // Re-fetch audit logs to show new DOCUMENT_DOWNLOADED entry!
      const updatedLogs = await auditService.getDocumentAuditHistory(document.id);
      setAuditLogs(updatedLogs);
    } catch (err: unknown) {
      const errObj = err as Error;
      error('Download Failed', errObj.message || 'Unable to download file.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={`Loading cryptographic manifest for Document #${id}...`} />;
  }

  if (errorMsg || !document) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl text-rose-300">
          <p className="text-sm font-semibold">Document Not Found</p>
          <p className="text-xs text-slate-400 mt-1">{errorMsg || 'Unable to find document record.'}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/documents')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Documents Vault
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Nav & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVerifyIntegrity}
            isLoading={isVerifying}
            leftIcon={<ShieldCheck className="w-4 h-4 text-cyan-400" />}
          >
            Run Integrity Check
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOcrOpen(true)}
            leftIcon={<FileSearch className="w-4 h-4 text-cyan-400" />}
          >
            OCR Text Inspector
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            isLoading={isDownloading}
            leftIcon={<Download className="w-4 h-4 text-slate-950" />}
          >
            Download Binary
          </Button>
        </div>
      </div>

      {/* Main Forensic Dossier Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50">
                DOC ID #{document.id}
              </span>
              <DocumentStatusBadge status={document.status} size="md" />
              <button
                onClick={() => navigate(`/cases/${encodeURIComponent(document.caseNumber)}`)}
                className="font-mono text-xs font-semibold text-slate-300 hover:text-cyan-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1"
              >
                <Briefcase className="w-3 h-3 text-cyan-400" />
                <span>Case: {document.caseNumber}</span>
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {document.title}
            </h2>
          </div>

          {/* Quick Integrity Pill */}
          {liveIntegrity !== null && (
            <div>
              {liveIntegrity ? (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 flex items-center gap-2 font-mono text-xs shadow-glow-emerald">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold">INTEGRITY VERIFIED (MATCH)</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-700/60 text-rose-300 flex items-center gap-2 font-mono text-xs shadow-md">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="font-bold">INTEGRITY MISMATCH DETECTED</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cryptographic SHA-256 Block */}
        <div className="p-4 rounded-xl bg-[#0a0e17] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              Registered Cryptographic Hash (SHA-256)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Immutable Signature</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0d1320] border border-slate-800/80 font-mono text-xs text-cyan-300 break-all select-all flex items-center justify-between gap-3">
            <span>{document.fileHash}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(document.fileHash);
                success('Copied', 'SHA-256 hash copied to clipboard.');
              }}
              title="Copy Full Hash"
              className="p-1 text-slate-400 hover:text-cyan-300"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">Uploaded By</span>
              <strong className="text-slate-200">{document.uploadedBy || 'Investigator'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">Timestamp</span>
              <strong className="text-slate-200">{formatDateTime(document.uploadedAt)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">Associated Case</span>
              <strong className="text-slate-200">{document.caseNumber}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">Chain of Custody</span>
              <strong className="text-slate-200">{auditLogs.length} Logged Events</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Cryptographic Audit Trail ({auditLogs.length} Events)
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDocumentAndAudits}
            isLoading={isAuditsLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Ledger
          </Button>
        </div>

        <AuditTimeline logs={auditLogs} isLoading={isAuditsLoading} />
      </div>

      {/* Modals */}
      <IntegrityVerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        document={document}
      />

      <OcrViewerModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        document={document}
      />
    </div>
  );
};

export default DocumentDetailPage;
