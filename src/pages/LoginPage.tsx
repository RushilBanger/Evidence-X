import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  UserPlus,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('INVESTIGATOR');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    const result = await login({ username: username.trim(), password });

    if (result.success) {
      success('Authentication Successful', `Welcome back, ${username.trim()}!`);
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.message || 'Invalid username or password.');
      error('Access Denied', result.message || 'Authentication failed. Please check credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim() || !regPassword) {
      error('Validation Error', 'Please complete all required registration fields.');
      return;
    }

    setIsRegistering(true);
    const result = await register({
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
    });

    setIsRegistering(false);
    if (result.success) {
      success('Account Created', 'New user credentials registered in vault. You may now login.');
      setIsRegisterOpen(false);
      setUsername(regUsername.trim());
      setPassword('');
    } else {
      error('Registration Failed', result.message || 'Unable to register user.');
    }
  };

  // Demo credential presets for easy SIH evaluation
  const fillDemoAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-2/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[750px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
     

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
       
          <h1 className="text-2xl font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 *:shadow-glow-cyan inline-flex items-center gap-2 animate-slide-up ">
            <Shield className="w-10 h-10" />
            <span>SecureDoc</span>
           
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Digital Document Management System for Legal & Investigation Documents
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-semibold text-white tracking-tight flex items-center justify-center gap-2">
              
              <span>Authentication Gate</span>
              <Lock className="w-4 h-4 text-cyan-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-2 ">
              Enter your credentials.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Username / ID"
              placeholder="e.g. investigator_roy"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to SecureDoc
            </Button>
          </form>

          {/* Demo Credentials Quick Fill for Evaluators */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick-Fill Demo Credentials:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin', 'admin123')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-cyan-300 transition-colors text-center"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('investigator', 'investigator123')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-cyan-300 transition-colors text-center"
              >
                INVESTIGATOR
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('viewer', 'viewer123')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-cyan-300 transition-colors text-center"
              >
                VIEWER
              </button>
            </div>
          </div>

          {/* Register User Option (Supported by POST /api/users) */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register new user credentials</span>
            </button>
          </div>
        </div>

        {/* Security / Compliance Badges */}
        <div className="mt-8 text-center text-slate-500 text-[11px] space-y-1 font-mono">
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5 text-cyan-500" />
              SHA-256 Hashed
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
              OCR Extracted
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-violet-500" />
              JWT Signed
            </span>
          </div>
         
        </div>
      </div>

      {/* User Registration Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            <span>Register New User</span>
          </div>
        }
        subtitle="Registers user credentials into the backend repository (POST /api/users)."
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRegisterOpen(false)} disabled={isRegistering}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRegisterSubmit} isLoading={isRegistering}>
              Create User Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
          <Input
            label="Username"
            required
            placeholder="e.g. detective_sharma"
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. sharma@police.gov.in"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="Minimum 6 characters"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Authority Role <span className="text-rose-400">*</span>
            </label>
            <select
              value={regRole}
              onChange={(e) => setRegRole(e.target.value as Role)}
              className="w-full bg-[#111827] text-slate-100 text-sm rounded-lg border border-slate-700/80 px-3.5 py-2.5 focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="INVESTIGATOR">INVESTIGATOR (Upload, Create Cases, Verify, Download, OCR)</option>
              <option value="ADMIN">ADMIN (Full Administrative Authority)</option>
              <option value="VIEWER">VIEWER (Read-Only: View, Download, Verify, OCR)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;
