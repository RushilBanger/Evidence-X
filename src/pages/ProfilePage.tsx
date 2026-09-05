import React, { useState } from 'react';
import {
  User,
  Shield,
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Search,
  UserPlus,
  LogOut,
  Clock,
  Briefcase,
  FileText,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { RoleBadge } from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { userService } from '../services/userService';
import { UserResponse, Role } from '../types';
import { formatDateTime } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user, logout, isAdmin, isInvestigator } = useAuth();
  const { success, error } = useToast();

  // Admin User Lookup State
  const [lookupUsername, setLookupUsername] = useState('');
  const [lookupResult, setLookupResult] = useState<UserResponse | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Admin Provision User State
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('INVESTIGATOR');
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupUsername.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await userService.getUserByUsername(lookupUsername.trim());
      setLookupResult(res);
    } catch (err: unknown) {
      const errObj = err as Error;
      setLookupError(errObj.message || `User "${lookupUsername}" not found.`);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserUsername.trim() || !newUserEmail.trim() || !newUserPassword) {
      error('Validation Error', 'All fields are required to provision a user.');
      return;
    }

    setIsProvisioning(true);
    try {
      const created = await userService.createUser({
        username: newUserUsername.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
      });

      success('User Provisioned', `User ${created.username} has been registered.`);
      setNewUserUsername('');
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (err: unknown) {
      const errObj = err as Error;
      error('Provision Failed', errObj.message || 'Failed to register user account.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const permissionsMatrix = [
    { permission: 'View Investigation Cases', admin: true, investigator: true, viewer: true },
    { permission: 'Create New Case Dossiers', admin: true, investigator: true, viewer: false },
    { permission: 'Ingest / Upload Evidence Documents', admin: true, investigator: true, viewer: false },
    { permission: 'Download Binary Evidence Stream', admin: true, investigator: true, viewer: true },
    { permission: 'Cryptographic SHA-256 Hash Verification', admin: true, investigator: true, viewer: true },
    { permission: 'Optical Character Recognition (OCR)', admin: true, investigator: true, viewer: true },
    { permission: 'Forensic Document Search', admin: true, investigator: true, viewer: true },
    { permission: 'Immutable Audit Trail Ledger Access', admin: true, investigator: true, viewer: true },
    { permission: 'User Directory Lookup (GET /api/users)', admin: true, investigator: false, viewer: false },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-2xl uppercase shadow-glow-cyan">
              {user?.username?.substring(0, 2) || 'SD'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user?.username}
                </h2>
                <RoleBadge role={user?.role || 'VIEWER'} size="md" />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Authenticated SecureDoc Session • Role: {user?.role}
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>

        {/* Security Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs justify-center ">
          
          <div className="p-4 rounded-xl bg-[#0d1320] border border-slate-800 space-y-1 ">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Session Expiration
            </span>
            <p className="font-mono text-emerald-300 font-bold">
              {user?.exp ? formatDateTime(new Date(user.exp * 1000).toISOString()) : '1 Hour Token'}
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Role Authority & Access Control Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">@PreAuthorize Rules</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0d1320] text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">System Operation / Action</th>
                <th className="py-2.5 px-4 text-center">ADMIN</th>
                <th className="py-2.5 px-4 text-center">INVESTIGATOR</th>
                <th className="py-2.5 px-4 text-center">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-850/40">
                  <td className="py-2.5 px-4 font-medium text-slate-200">{item.permission}</td>
                  <td className="py-2.5 px-4 text-center">
                    {item.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.investigator ? (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.viewer ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-300 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Operations Section (Only visible for ADMIN) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Directory Lookup */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                User Directory Lookup
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Query user records via administrative API (<code>GET /api/users/username/&#123;username&#125;</code>).
            </p>

            <form onSubmit={handleLookup} className="space-y-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter username to search..."
                    value={lookupUsername}
                    onChange={(e) => setLookupUsername(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLookingUp}
                  leftIcon={<Search className="w-4 h-4" />}
                >
                  Lookup
                </Button>
              </div>
            </form>

            {lookupError && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/60 text-xs text-rose-300">
                {lookupError}
              </div>
            )}

            {lookupResult && (
              <div className="p-4 rounded-xl bg-[#0d1320] border border-slate-800 space-y-2 animate-fade-in text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span>User Record ID:</span>
                  <strong className="text-cyan-300">#{lookupResult.id}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Username:</span>
                  <strong className="text-white">{lookupResult.username}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Email:</span>
                  <strong className="text-white">{lookupResult.email}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Provision New User */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Provision User Credentials
              </h3>
            </div>

            <form onSubmit={handleProvisionUser} className="space-y-3">
              <Input
                label="Username"
                required
                placeholder="e.g. inspector_khan"
                value={newUserUsername}
                onChange={(e) => setNewUserUsername(e.target.value)}
              />

              <Input
                label="Official Email"
                type="email"
                required
                placeholder="e.g. khan@investigation.gov.in"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••••••"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Role Assignment
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full bg-[#0d1320] text-slate-100 text-xs rounded-lg border border-slate-700/80 px-3 py-2 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="INVESTIGATOR">INVESTIGATOR</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isProvisioning}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Provision User
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
