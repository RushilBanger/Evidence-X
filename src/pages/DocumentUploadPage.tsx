import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Briefcase,
  Shield,
  ArrowLeft,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { CaseResponse } from '../types';
import { caseService } from '../services/caseService';
import { documentService } from '../services/documentService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { formatFileSize } from '../utils/formatters';

export const DocumentUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultCase = searchParams.get('case') || '';
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState(defaultCase);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    caseService
      .getAllCases()
      .then(setCases)
      .catch(() => setCases([]));
  }, []);

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
    if (formErrors.file) {
      setFormErrors((prev) => ({ ...prev, file: '' }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Document title is required';
    if (!caseNumber.trim()) errs.caseNumber = 'Associated case reference is required';
    if (!selectedFile) errs.file = 'Please choose a document file';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const doc = await documentService.createDocument(
        title,
        caseNumber,
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      success('Document Secured', `"${doc.title}" was ingested and SHA-256 hash computed.`);
      navigate(`/documents/${doc.id}`);
    } catch (err: unknown) {
      const errObj = err as Error;
      error('Upload Failed', errObj.message || 'Failed to ingest document into vault.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return</span>
      </button>

      {/* Upload Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Secure Document Ingestion Portal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingested documents are automatically hashed (SHA-256) and indexed for OCR text extraction.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Case Reference */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Associated Case Dossier <span className="text-rose-400">*</span>
            </label>
            {cases.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={caseNumber}
                  onChange={(e) => {
                    setCaseNumber(e.target.value);
                    if (formErrors.caseNumber) setFormErrors({ ...formErrors, caseNumber: '' });
                  }}
                  className="w-full bg-[#0d1320] text-slate-100 text-sm rounded-lg border border-slate-700/80 px-3.5 py-2.5 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose Existing Case --</option>
                  {cases.map((c) => (
                    <option key={c.caseNumber} value={c.caseNumber}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Or type reference:</span>
                  <input
                    type="text"
                    placeholder="e.g. CASE-2026-001"
                    value={caseNumber}
                    onChange={(e) => {
                      setCaseNumber(e.target.value.toUpperCase());
                      if (formErrors.caseNumber) setFormErrors({ ...formErrors, caseNumber: '' });
                    }}
                    className="flex-1 bg-slate-900 text-xs px-2.5 py-1 rounded border border-slate-800 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ) : (
              <Input
                placeholder="e.g. CASE-2026-001"
                value={caseNumber}
                onChange={(e) => {
                  setCaseNumber(e.target.value.toUpperCase());
                  if (formErrors.caseNumber) setFormErrors({ ...formErrors, caseNumber: '' });
                }}
                error={formErrors.caseNumber}
              />
            )}
            {formErrors.caseNumber && (
              <p className="text-xs text-rose-400 font-medium mt-1">{formErrors.caseNumber}</p>
            )}
          </div>

          {/* Title */}
          <Input
            label="Document Title / Evidence Description"
            required
            placeholder="e.g. Forensic Image Extraction - Hard Drive Sector 4"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
            }}
            error={formErrors.title}
          />

          {/* File Upload Zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Evidence Binary File <span className="text-rose-400">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.tiff"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/30'
                    : 'border-slate-700/80 hover:border-slate-500 bg-[#0d1320]'
                }`}
              >
                <div className="p-3.5 rounded-2xl bg-slate-800/80 text-cyan-400 shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    Click to select file or drag & drop here
                  </p>
                  <p className="text-xs text-slate-400">
                    PDF, DOCX, TXT, PNG, JPG, TIFF (Max 50MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-cyan-700/50 bg-cyan-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-3 rounded-lg bg-cyan-900/50 text-cyan-300 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-cyan-400/90 font-mono">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Document'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {formErrors.file && (
              <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{formErrors.file}</span>
              </p>
            )}
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  Encrypting, Computing SHA-256 & OCR Parsing...
                </span>
                <span className="text-cyan-400 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              onClick={() => navigate('/documents')}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUploading}
              disabled={!selectedFile || isUploading}
              leftIcon={<UploadCloud className="w-4 h-4 text-slate-950" />}
            >
              {isUploading ? `Ingesting (${uploadProgress}%)` : 'Ingest to Vault'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadPage;
