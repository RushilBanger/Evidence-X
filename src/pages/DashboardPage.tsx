import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  ShieldCheck,
  Search,
  UploadCloud,
  FolderPlus,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CaseResponse, DocumentResponse } from '../types';
import { caseService } from '../services/caseService';
import { documentService } from '../services/documentService';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { CaseCard } from '../components/cases/CaseCard';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentStatusBadge, RoleBadge } from '../components/common/Badge';
import HashBadge from '../components/common/HashBadge';
import { formatDateTime } from '../utils/formatters';

interface OutletContextType {
  openUploadModal: () => void;
  openCreateCaseModal: () => void;
}

export const DashboardPage: React.FC = () => {
  const { user, isAdmin, isInvestigator } = useAuth();
  const navigate = useNavigate();
  const outletContext = useOutletContext<OutletContextType>();

  const [isLoading, setIsLoading] = useState(true);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch all cases
      const allCases = await caseService.getAllCases();
      setCases(allCases);

      // 2. Fetch documents for cases (aggregate from cases)
      const docPromises = allCases.slice(0, 10).map((c) =>
        documentService.getDocumentsByCaseNumber(c.caseNumber).catch(() => [])
      );
      const docsNested = await Promise.all(docPromises);
      const allDocs = docsNested.flat();

      // Deduplicate by ID
      const uniqueDocsMap = new Map<number, DocumentResponse>();
      allDocs.forEach((d) => uniqueDocsMap.set(d.id, d));
      const sortedDocs = Array.from(uniqueDocsMap.values()).sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      setDocuments(sortedDocs);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || 'Failed to load dashboard metrics from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Derived statistics (strictly from real backend data)
  const totalCases = cases.length;
  const totalDocuments = documents.length;
  const activeCases = cases.filter((c) => c.status === 'OPEN' || c.status === 'UNDER_INVESTIGATION').length;
  const closedCases = cases.filter((c) => c.status === 'CLOSED').length;

  const recentCases = cases.slice(0, 3);
  const recentDocuments = documents.slice(0, 4);

  if (isLoading) {
    return <LoadingSpinner message="Aggregating secure vault intelligence..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111827] via-[#152238] to-[#111827] border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center  gap-6">
          <div className="space-y-2 ">
            <div className="flex absolute top-0 right-0 mt- mr-2">
              <RoleBadge role={user?.role || 'VIEWER'} size="sm" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight items-center justify-center">
              {user?.username}'s Workspace 
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Cryptographically verified repository for legal evidence, case management, OCR text extraction, and continuous tamper-detection.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {(isAdmin || isInvestigator) && (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => outletContext?.openCreateCaseModal?.()}
                  leftIcon={<FolderPlus className="w-4 h-4 text-cyan-400" />}
                >
                  Create Case
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => outletContext?.openUploadModal?.()}
                  leftIcon={<UploadCloud className="w-4 h-4 text-slate-950" />}
                >
                  Ingest Document
                </Button>
              </>
            )}
        
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Investigation Cases"
          value={totalCases}
          subtitle="Registered Legal Files"
          icon={<Briefcase className="w-5 h-5" />}
          variant="cyan"
          onClick={() => navigate('/cases')}
        />
        <StatCard
          title="Active Investigations"
          value={activeCases}
          subtitle="Open & In Progress"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
          onClick={() => navigate('/cases')}
        />
        <StatCard
          title="Secured Documents"
          value={totalDocuments}
          subtitle="SHA-256 Hashed Evidence"
          icon={<FileText className="w-5 h-5" />}
          variant="blue"
          onClick={() => navigate('/documents')}
        />
        <StatCard
          title="Integrity Verified"
          value={closedCases}
          subtitle="Closed Cases & Archives"
          icon={<ShieldCheck className="w-5 h-5" />}
          variant="emerald"
          onClick={() => navigate('/audit')}
        />
      </div>

      {/* Security Posture & Engine Health */}
      <div className="">
       

        {/* Quick Search Widget */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 ">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Search className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Instant Forensic Search
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Search across registered case identifiers, evidence titles, and digital document metadata.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-fit justify-between text-xs"
            onClick={() => navigate('/search')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Search Engine
          </Button>
        </div>
      </div>

      {/* Recent Cases Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Recent Case Investigations
            </h3>
          </div>
          {cases.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cases')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View All ({cases.length})
            </Button>
          )}
        </div>

        {cases.length === 0 ? (
          <EmptyState
            title="No Active Investigation Cases"
            description="Create your first case dossier to begin securely cataloging digital legal evidence."
            actionLabel="Create New Case File"
            onAction={() => outletContext?.openCreateCaseModal?.()}
            actionIcon={<FolderPlus className="w-4 h-4" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentCases.map((c) => (
              <CaseCard key={c.caseNumber} caseData={c} />
            ))}
          </div>
        )}
      </div>

      {/* Recently Uploaded Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Recently Uploaded Evidence Documents
            </h3>
          </div>
          {documents.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/documents')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Vault ({documents.length})
            </Button>
          )}
        </div>

        {documents.length === 0 ? (
          <EmptyState
            title="Vault is Currently Empty"
            description="Upload legal or investigation files to generate cryptographic signatures and OCR index."
            actionLabel="Upload First Document"
            onAction={() => outletContext?.openUploadModal?.()}
            actionIcon={<UploadCloud className="w-4 h-4" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
