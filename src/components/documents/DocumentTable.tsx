import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ShieldCheck, FileSearch, ArrowRight, User, Calendar } from 'lucide-react';
import { DocumentResponse } from '../../types';
import { DocumentStatusBadge } from '../common/Badge';
import HashBadge from '../common/HashBadge';
import { formatDateTime } from '../../utils/formatters';
import Button from '../common/Button';
import { documentService } from '../../services/documentService';
import { useToast } from '../../hooks/useToast';
import IntegrityVerifyModal from './IntegrityVerifyModal';
import OcrViewerModal from './OcrViewerModal';

export interface DocumentTableProps {
  documents: DocumentResponse[];
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ documents }) => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [selectedDocForVerify, setSelectedDocForVerify] = useState<DocumentResponse | null>(null);
  const [selectedDocForOcr, setSelectedDocForOcr] = useState<DocumentResponse | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownload = async (e: React.MouseEvent, doc: DocumentResponse) => {
    e.stopPropagation();
    setDownloadingId(doc.id);
    try {
      await documentService.downloadDocument(doc.id, `${doc.title}.pdf`);
      success('Download Started', `Downloaded file: ${doc.title}`);
    } catch (err: unknown) {
      const errObj = err as Error;
      error('Download Failed', errObj.message || 'Unable to download document file.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-[#111827]">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#141d2e] text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Document Title</th>
              <th className="py-3.5 px-4">Case Number</th>
              <th className="py-3.5 px-4">Cryptographic Hash (SHA-256)</th>
              <th className="py-3.5 px-4">Uploaded By</th>
              <th className="py-3.5 px-4">Date Uploaded</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-normal">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                {/* Title */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 text-cyan-400 shrink-0 group-hover:border-cyan-500/40">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors truncate max-w-xs">
                        {doc.title}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">ID #{doc.id}</span>
                    </div>
                  </div>
                </td>

                {/* Case Number */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-mono text-xs font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/30">
                    {doc.caseNumber}
                  </span>
                </td>

                {/* SHA-256 Hash */}
                <td className="py-3.5 px-4">
                  <HashBadge hash={doc.fileHash} />
                </td>

                {/* Uploaded By */}
                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{doc.uploadedBy || 'Investigator'}</span>
                  </div>
                </td>

                {/* Uploaded Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDateTime(doc.uploadedAt)}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <DocumentStatusBadge status={doc.status} size="sm" />
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Verify SHA-256 Hash Integrity"
                      onClick={() => setSelectedDocForVerify(doc)}
                      className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Extract Text (OCR)"
                      onClick={() => setSelectedDocForOcr(doc)}
                      className="p-1.5 text-slate-300 hover:text-white"
                    >
                      <FileSearch className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Download File"
                      isLoading={downloadingId === doc.id}
                      onClick={(e) => handleDownload(e, doc)}
                      className="p-1.5 text-slate-300 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      rightIcon={<ArrowRight className="w-3 h-3" />}
                    >
                      Inspect
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <IntegrityVerifyModal
        isOpen={!!selectedDocForVerify}
        onClose={() => setSelectedDocForVerify(null)}
        document={selectedDocForVerify}
      />

      <OcrViewerModal
        isOpen={!!selectedDocForOcr}
        onClose={() => setSelectedDocForOcr(null)}
        document={selectedDocForOcr}
      />
    </>
  );
};

export default DocumentTable;
