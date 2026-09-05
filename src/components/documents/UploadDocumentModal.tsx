import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, AlertCircle, X, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { DocumentResponse, CaseResponse } from '../../types';
import { documentService } from '../../services/documentService';
import { caseService } from '../../services/caseService';
import { useToast } from '../../hooks/useToast';
import { formatFileSize } from '../../utils/formatters';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'docx'];

export interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: DocumentResponse) => void;
  defaultCaseNumber?: string;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultCaseNumber = '',
}) => {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState(defaultCaseNumber);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [availableCases, setAvailableCases] = useState<CaseResponse[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCaseNumber(defaultCaseNumber);
      setSelectedFile(null);
      setUploadProgress(0);
      setFormErrors({});

      // Fetch available cases for dropdown
      caseService
        .getAllCases()
        .then((cases) => setAvailableCases(cases))
        .catch(() => setAvailableCases([]));
    }
  }, [isOpen, defaultCaseNumber]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds the 10 MB maximum limit (Selected: ${formatFileSize(file.size)}).`;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return `File format .${ext || 'unknown'} is not allowed. Supported formats: PDF, JPG, JPEG, PNG, DOCX.`;
    }
    return null;
  };

  const handleFileSelection = (file: File) => {
    const fileError = validateFile(file);
    if (fileError) {
      setFormErrors((prev) => ({ ...prev, file: fileError }));
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    if (!title) {
      // Pre-fill title without extension
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
    if (!caseNumber.trim()) errs.caseNumber = 'Associated case number is required';
    if (!selectedFile) {
      errs.file = 'Please select a document file to upload';
    } else {
      const fileErr = validateFile(selectedFile);
      if (fileErr) errs.file = fileErr;
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpload = async (e: React.FormEvent) => {
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

      success('Document Uploaded', `"${doc.title}" was secured and SHA-256 integrity hash generated.`);
      onSuccess(doc);
      onClose();
    } catch (err: unknown) {
      const errObj = err as Error;
      error('Upload Failed', errObj.message || 'Failed to upload and secure document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-cyan-400" />
          <span>Upload & Ingest Legal Document</span>
        </div>
      }
      subtitle="Files are cryptographically hashed (SHA-256) and OCR-indexed upon upload."
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={!selectedFile || isUploading}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            {isUploading ? `Securing (${uploadProgress}%)` : 'Ingest Document'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleUpload} className="space-y-4">
        {/* Case Selection */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
            Associated Case File <span className="text-rose-400">*</span>
          </label>
          {availableCases.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <select
                value={caseNumber}
                onChange={(e) => {
                  setCaseNumber(e.target.value);
                  if (formErrors.caseNumber) setFormErrors({ ...formErrors, caseNumber: '' });
                }}
                className="w-full bg-[#111827] text-slate-100 text-sm rounded-lg border border-slate-700/80 px-3.5 py-2.5 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
              >
                <option value="">-- Select an Existing Investigation Case --</option>
                {availableCases.map((c) => (
                  <option key={c.caseNumber} value={c.caseNumber}>
                    {c.caseNumber} - {c.title}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-400">Or enter reference:</span>
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
              helperText="Enter the exact Case Reference Number"
            />
          )}
          {formErrors.caseNumber && (
            <p className="text-xs text-rose-400 font-medium mt-1">{formErrors.caseNumber}</p>
          )}
        </div>

        {/* Document Title */}
        <Input
          label="Document Title"
          required
          placeholder="e.g. Forensic Hard Drive Extraction Report"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
          }}
          error={formErrors.title}
        />

        {/* File Dropzone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Select Document File <span className="text-rose-400">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
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
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/30'
                  : 'border-slate-700/80 hover:border-slate-500 bg-[#0d1320]'
              }`}
            >
              <div className="p-3 rounded-full bg-slate-800/80 text-cyan-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Click to browse or drag & drop document here
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Supported formats: PDF, JPG, JPEG, PNG, DOCX (Max 10MB)
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-cyan-700/40 bg-cyan-950/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-cyan-900/50 text-cyan-300 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-cyan-400/80 font-mono">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {formErrors.file && (
            <p className="text-xs text-rose-400 font-medium animate-fade-in flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formErrors.file}</span>
            </p>
          )}
        </div>

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                Calculating SHA-256 Hash & Ingesting...
              </span>
              <span className="text-cyan-400 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UploadDocumentModal;
