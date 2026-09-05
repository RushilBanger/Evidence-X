import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ShieldCheck, FileSearch, ArrowRight, User, Calendar, History } from 'lucide-react';
import { DocumentResponse } from '../../types';
import { DocumentStatusBadge } from '../common/Badge';
import HashBadge from '../common/HashBadge';
import { formatDateTime } from '../../utils/formatters';
import Button from '../common/Button';
import { documentService } from '../../services/documentService';
import { useToast } from '../../hooks/useToast';
import IntegrityVerifyModal from './IntegrityVerifyModal';
import OcrViewerModal from './OcrViewerModal';

export interface DocumentCardProps {
  document: DocumentResponse;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await documentService.downloadDocument(document.id, `${document.title}.pdf`);
      success('Download Started', `Downloaded file: ${document.title}`);
    } catch (err: unknown) {
      const errObj = err as Error;
      error('Download Failed', errObj.message || 'Unable to download document file.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all duration-200 hover:shadow-card flex flex-col justify-between group">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 text-cyan-400 shrink-0 group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
                  {document.title}
                </h4>
                <span className="font-mono text-xs text-cyan-400 font-medium">
                  {document.caseNumber}
                </span>
              </div>
            </div>
            <DocumentStatusBadge status={document.status} size="sm" />
          </div>

          {/* Cryptographic SHA-256 Hash */}
          <div className="my-3">
            <HashBadge hash={document.fileHash} />
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{document.uploadedBy || 'Investigator'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{formatDateTime(document.uploadedAt)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVerifyOpen(true)}
              title="Verify SHA-256 Hash Integrity"
              className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40"
            >
              <ShieldCheck className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOcrOpen(true)}
              title="Extract Text (OCR)"
              className="p-2 text-slate-300 hover:text-white"
            >
              <FileSearch className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              isLoading={isDownloading}
              title="Download Document Stream"
              className="p-2 text-slate-300 hover:text-white"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/documents/${document.id}`)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Inspect
          </Button>
        </div>
      </div>

      <IntegrityVerifyModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        document={document}
      />

      <OcrViewerModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        document={document}
      />
    </>
  );
};

export default DocumentCard;
