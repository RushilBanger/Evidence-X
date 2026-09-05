import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Briefcase,
  FileText,
  Search,
  History,
  User,
  LogOut,
  UploadCloud,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RoleBadge } from '../components/common/Badge';

export interface SidebarProps {
  onCloseMobile?: () => void;
  onOpenUpload?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile, onOpenUpload }) => {
  const { user, logout, isAdmin, isInvestigator } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Cases',
      path: '/cases',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      label: 'Documents',
      path: '/documents',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: 'Forensic Search',
      path: '/search',
      icon: <Search className="w-4 h-4" />,
    },
    {
      label: 'Audit Trail',
      path: '/audit',
      icon: <History className="w-4 h-4" />,
    },
    {
      label: 'Profile & Access',
      path: '/profile',
      icon: <User className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#0d1320] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-glow-cyan">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-lg">SecureDoc</span>
              
              </div>
               <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Secure Document Management System
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Button (for ADMIN/INVESTIGATOR) */}
        {(isAdmin || isInvestigator) && onOpenUpload && (
          <div className="px-4 pt-4">
            <button
              onClick={() => {
                onOpenUpload();
                onCloseMobile?.();
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold py-2.5 px-3 rounded-lg shadow-glow-cyan flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Document</span>
            </button>
          </div>
        )}

        {/* Navigation Section */}
        <nav className="p-4 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
            System Modules
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/50 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#090d16]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs shrink-0 uppercase">
              {user?.username?.substring(0, 2) || 'SD'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.username}</p>
              <div className="mt-0.5">
                <RoleBadge role={user?.role || 'VIEWER'} size="sm" />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
