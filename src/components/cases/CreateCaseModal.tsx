import React, { useState } from 'react';
import { Briefcase, FilePlus, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { CaseRequest, CaseResponse } from '../../types';
import { caseService } from '../../services/caseService';
import { useToast } from '../../hooks/useToast';

export interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCase: CaseResponse) => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState<CaseRequest>({
    caseNumber: '',
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateCaseNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, caseNumber: `CASE-${year}-${random}` }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.caseNumber.trim()) {
      newErrors.caseNumber = 'Case number is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Case title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const createdCase = await caseService.createCase(formData);
      success('Case Created', `Case ${createdCase.caseNumber} has been successfully registered in the secure vault.`);
      onSuccess(createdCase);
      setFormData({ caseNumber: '', title: '', description: '' });
      onClose();
    } catch (err: unknown) {
      const errObj = err as Error;
      error('Failed to Create Case', errObj.message || 'An error occurred while creating the case.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-cyan-400" />
          <span>Register New Investigation Case</span>
        </div>
      }
      subtitle="Create a secure case file to link documents and track forensic evidence."
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<FilePlus className="w-4 h-4" />}
          >
            Create Case File
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Case Number with Auto-generate button */}
        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Case Reference Number"
                required
                placeholder="e.g. CASE-2026-8921"
                value={formData.caseNumber}
                onChange={(e) => {
                  setFormData({ ...formData, caseNumber: e.target.value.toUpperCase() });
                  if (errors.caseNumber) setErrors({ ...errors, caseNumber: '' });
                }}
                error={errors.caseNumber}
                helperText="Must be unique. Format: CASE-YYYY-XXXX"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={generateCaseNumber}
              leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}
              className="mb-1"
            >
              Generate
            </Button>
          </div>
        </div>

        {/* Title */}
        <Input
          label="Case Title"
          required
          placeholder="e.g. Cyber Security Incident Forensic Investigation - Phase 1"
          value={formData.title}
          onChange={(e) => {
            setFormData({ ...formData, title: e.target.value });
            if (errors.title) setErrors({ ...errors, title: '' });
          }}
          error={errors.title}
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Case Description / Investigation Scope
          </label>
          <textarea
            rows={4}
            placeholder="Provide context, evidence scope, legal jurisdiction, or investigatory objectives..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-[#111827] text-slate-100 text-sm placeholder:text-slate-500 rounded-lg border border-slate-700/80 hover:border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 px-3.5 py-2.5 transition-colors focus:outline-none resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateCaseModal;
