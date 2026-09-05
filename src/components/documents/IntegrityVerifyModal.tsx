import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Shield, RefreshCw, CheckCircle2, AlertTriangle, Hash, FileText } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import HashBadge from '../common/HashBadge';
import { DocumentResponse } from '../../types';
import { documentService } from '../../services/documentService';

export interface IntegrityVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentResponse | null;
  onVerified?: (isValid: boolean) => void;
}

export const IntegrityVerifyModal: React.FC<IntegrityVerifyModalProps> = ({
  isOpen,
  onClose,
  document,
  onVerified,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const runVerification = async () => {
    if (!document) return;
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const isValid = await documentService.verifyDocumentIntegrity(document.id);
      setVerificationResult(isValid);
      setTimestamp(new Date().toISOString());
      if (onVerified) {
        onVerified(isValid);
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || 'Failed to complete cryptographic verification check');
      setVerificationResult(false);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (isOpen && document) {
      setVerificationResult(null);
      setErrorMsg(null);
      runVerification();
    }
  }, [isOpen, document?.id]);

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span>Cryptographic Integrity Verification</span>
        </div>
      }
      subtitle={`Forensic SHA-256 hash comparison for Document #${document.id}`}
      maxWidth="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={runVerification}
            isLoading={isVerifying}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Re-Verify
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close Inspector
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Document Info Banner */}
        <div className="p-3.5 rounded-xl bg-[#0d1320] border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{document.title}</h4>
              <p className="text-xs text-slate-400 font-mono">Case: {document.caseNumber}</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono shrink-0">ID: {document.id}</span>
        </div>

        {/* Verification Status Card */}
        {isVerifying ? (
          <div className="p-8 rounded-xl border border-cyan-700/50 bg-cyan-950/20 text-center space-y-3 animate-pulse">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            <h4 className="text-sm font-semibold text-cyan-300">
              Computing Live SHA-256 Checksum on Secure Storage...
            </h4>
            <p className="text-xs text-slate-400">
              Comparing byte stream with stored cryptographic footprint in PostgreSQL vault.
            </p>
          </div>
        ) : verificationResult === true ? (
          <div className="p-5 rounded-xl border border-emerald-700/60 bg-emerald-950/25 shadow-glow-emerald space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-900/50 text-emerald-300 border border-emerald-700/60 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-emerald-300 tracking-tight">
                    INTEGRITY VERIFIED (MATCH)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-900/80 text-emerald-200 border border-emerald-600/60 font-semibold">
                    100% INTACT
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The live binary SHA-256 hash calculated from storage matches the registered document footprint. No unauthorized modifications detected.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-emerald-800/40 text-[11px] text-emerald-400/90 flex items-center justify-between font-mono">
              <span>Security Result: MATCH</span>
              <span>Logged to Audit Trail</span>
            </div>
          </div>
        ) : verificationResult === false ? (
          <div className="p-5 rounded-xl border border-rose-700/60 bg-rose-950/25 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-900/50 text-rose-300 border border-rose-700/60 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-rose-300 tracking-tight">
                    INTEGRITY MISMATCH DETECTED
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-900/80 text-rose-200 border border-rose-600/60 font-semibold">
                    ALERT
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {errorMsg ||
                    'Integrity mismatch detected. The live storage file hash differs from the registered cryptographic SHA-256 signature.'}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-rose-800/40 text-[11px] text-rose-400 flex items-center justify-between font-mono">
              <span>Security Result: MISMATCH</span>
              <span>Incident Logged in Audit Trail</span>
            </div>
          </div>
        ) : null}

        {/* Registered Hash Details */}
        <div className="p-4 rounded-xl bg-[#0d1320] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-cyan-500" />
              Registered SHA-256 Hash
            </span>
            <span className="text-[11px] text-slate-500 font-mono">256-bit Digest</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
            {document.fileHash}
          </div>
        </div>

        {/* Legal & Security Compliance Note */}
        <p className="text-[11px] text-slate-500 leading-relaxed italic">
          * Note: Cryptographic verification adheres to Section 65B Indian Evidence Act / ISO/IEC 27037 Digital Forensics Standards. Each verification event is permanently recorded in the immutable audit trail.
        </p>
      </div>
    </Modal>
  );
};

export default IntegrityVerifyModal;
