import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
}) => {
  const iconConfig = {
    danger: {
      icon: <AlertCircle className="w-6 h-6 text-rose-400" />,
      bg: 'bg-rose-950/40 border-rose-800/50',
      btnVariant: 'danger' as const,
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      bg: 'bg-amber-950/40 border-amber-800/50',
      btnVariant: 'primary' as const,
    },
    info: {
      icon: <Info className="w-6 h-6 text-cyan-400" />,
      bg: 'bg-cyan-950/40 border-cyan-800/50',
      btnVariant: 'primary' as const,
    },
  };

  const current = iconConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={current.btnVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl border ${current.bg} shrink-0`}>
          {current.icon}
        </div>
        <div className="text-sm text-slate-300 leading-relaxed pt-1">
          {message}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
