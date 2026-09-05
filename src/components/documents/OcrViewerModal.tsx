import React, { useState, useEffect } from 'react';
import { FileSearch, Copy, Check, Download, Search, RefreshCw, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { DocumentResponse } from '../../types';
import { documentService } from '../../services/documentService';
import { useToast } from '../../hooks/useToast';

export interface OcrViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentResponse | null;
}

export const OcrViewerModal: React.FC<OcrViewerModalProps> = ({
  isOpen,
  onClose,
  document: targetDoc,
}) => {
  const { success } = useToast();
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchOcrText = async () => {
    if (!targetDoc) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const text = await documentService.extractOcrText(targetDoc.id);
      setExtractedText(text || 'No text extracted from document.');
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(
        errObj.message ||
          'OCR Extraction failed. The backend OCR engine may be processing or the file format is non-text.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && targetDoc) {
      setExtractedText('');
      setErrorMsg(null);
      setSearchQuery('');
      setCopied(false);
      fetchOcrText();
    }
  }, [isOpen, targetDoc?.id]);

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    success('Copied to Clipboard', 'Extracted OCR text copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText || !targetDoc) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${targetDoc.title.replace(/\s+/g, '_')}_OCR_Extracted.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!targetDoc) return null;

  const wordCount = extractedText ? extractedText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = extractedText ? extractedText.length : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-cyan-400" />
          <span>Optical Character Recognition (OCR) Extracted Text</span>
        </div>
      }
      subtitle={`Tesseract OCR Engine Extraction for: ${targetDoc.title}`}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-400 font-mono">
            {wordCount} words • {charCount} characters
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={isLoading || !extractedText || !!errorMsg}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy Text'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadTxt}
              disabled={isLoading || !extractedText || !!errorMsg}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export as .TXT
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search bar inside OCR view */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search terms within extracted OCR text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1320] text-xs text-slate-100 pl-9 pr-3.5 py-2 rounded-lg border border-slate-800 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOcrText}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Re-Extract
          </Button>
        </div>

        {/* Content Container */}
        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner message="Extracting textual data using Tesseract OCR engine..." />
          </div>
        ) : errorMsg ? (
          <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-800/50 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h4 className="text-sm font-semibold text-rose-300">OCR Extraction Unavailable</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">{errorMsg}</p>
            <p className="text-[11px] text-slate-500 italic mt-2">
              Note: Requires Tesseract OCR engine running on the backend host.
            </p>
          </div>
        ) : (
          <div className="relative rounded-xl border border-slate-800 bg-[#0a0e17] overflow-hidden">
            <div className="p-3 bg-[#0d1320] border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Extracted Text Stream</span>
              <span>UTF-8 Plaintext</span>
            </div>
            <div className="p-4 max-h-[380px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30 selection:text-white">
              {searchQuery ? (
                highlightMatches(extractedText, searchQuery)
              ) : (
                extractedText || 'No text discovered in this document.'
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

function highlightMatches(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-cyan-400/30 text-cyan-200 rounded px-1 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default OcrViewerModal;
