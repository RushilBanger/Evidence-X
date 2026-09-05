import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { ToastItem } from '../../types';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const configs = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      border: 'border-emerald-700/60',
      bg: 'bg-[#0f211c]',
      glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      border: 'border-rose-700/60',
      bg: 'bg-[#251016]',
      glow: 'shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      border: 'border-amber-700/60',
      bg: 'bg-[#261d0d]',
      glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]',
    },
    info: {
      icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
      border: 'border-cyan-700/60',
      bg: 'bg-[#0b1d28]',
      glow: 'shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]',
    },
  };

  const current = configs[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${current.border} ${current.bg} ${current.glow} text-slate-100 shadow-xl transition-all duration-200 animate-slide-up`}
      role="alert"
    >
      {current.icon}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold tracking-tight text-white">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastContainer;
