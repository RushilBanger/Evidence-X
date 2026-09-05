import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  UploadCloud,
  Plus,
  Shield,
  Activity,
  User,
  LogOut,
  FolderPlus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RoleBadge } from '../components/common/Badge';
import Button from '../components/common/Button';

export interface TopbarProps {
  onToggleMobileMenu: () => void;
  onOpenUpload?: () => void;
  onOpenCreateCase?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileMenu,
  onOpenUpload,
  onOpenCreateCase,
}) => {
  const { user, logout, isAdmin, isInvestigator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickQuery.trim())}`);
      setQuickQuery('');
    }
  };

  const getPageHeading = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Security Dashboard', subtitle: 'Real-time legal document vault & integrity overview' };
    if (path === '/cases') return { title: 'Case Management', subtitle: 'Investigation case dossiers & associated digital evidence' };
    if (path.startsWith('/cases/')) return { title: 'Case Dossier', subtitle: 'Investigation details & linked evidence records' };
    if (path === '/documents') return { title: 'Document Vault', subtitle: 'Cryptographically secured legal & investigation repository' };
    if (path.startsWith('/documents/')) return { title: 'Forensic Document Inspector', subtitle: 'SHA-256 integrity inspection, OCR extraction & audit log' };
    if (path === '/search') return { title: 'Forensic Search Engine', subtitle: 'Direct query across document titles and case numbers' };
    if (path === '/audit') return { title: 'System Audit Ledger', subtitle: 'Immutable chronological chain of evidence & verification history' };
    if (path === '/profile') return { title: 'Access & Credentials', subtitle: 'Session authority, cryptographic security & user administration' };
    return { title: 'SecureDoc Portal', subtitle: 'Legal & Investigation Document Management' };
  };

  const heading = getPageHeading();

  return (
    <header className="h-16 bg-[#0d1320]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base font-bold text-white tracking-tight truncate flex items-center gap-2">
            <span>{heading.title}</span>
          </h1>
          <p className="text-[11px] text-slate-400 truncate hidden sm:block">
            {heading.subtitle}
          </p>
        </div>
      </div>

      {/* Center / Right: Quick Search & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <form onSubmit={handleQuickSearch} className="hidden md:block w-48 lg:w-64">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search case # or title..."
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="w-full bg-[#111827] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700/80 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
        </form>

        {/* Quick Action Buttons for ADMIN / INVESTIGATOR */}
        {(isAdmin || isInvestigator) && (
          <div className="flex items-center gap-2">
            {onOpenCreateCase && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenCreateCase}
                leftIcon={<FolderPlus className="w-3.5 h-3.5 text-cyan-400" />}
                className="hidden sm:inline-flex text-xs py-1.5"
              >
                New Case
              </Button>
            )}

            {onOpenUpload && (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenUpload}
                leftIcon={<UploadCloud className="w-3.5 h-3.5 text-slate-950" />}
                className="text-xs py-1.5"
              >
                Upload
              </Button>
            )}
          </div>
        )}

        {/* Server & Role Pill */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>API: Port 8080</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 flex items-center justify-center font-bold text-xs">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-white leading-none">{user?.username}</p>
              <p className="text-[10px] text-cyan-400 font-mono leading-none mt-1">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
