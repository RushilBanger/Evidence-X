import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from '../components/common/ToastContainer';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';
import CreateCaseModal from '../components/cases/CreateCaseModal';
import { DocumentResponse, CaseResponse } from '../types';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false);

  const handleUploadSuccess = (doc: DocumentResponse) => {
    navigate(`/documents/${doc.id}`);
  };

  const handleCaseCreated = (newCase: CaseResponse) => {
    navigate(`/cases/${encodeURIComponent(newCase.caseNumber)}`);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          onOpenUpload={() => setIsUploadModalOpen(true)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-50 animate-fade-in">
            <Sidebar
              onCloseMobile={() => setIsMobileMenuOpen(false)}
              onOpenUpload={() => setIsUploadModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenCreateCase={() => setIsCreateCaseModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet
            context={{
              openUploadModal: (defaultCase?: string) => setIsUploadModalOpen(true),
              openCreateCaseModal: () => setIsCreateCaseModalOpen(true),
            }}
          />
        </main>
      </div>

      {/* Global Modals */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <CreateCaseModal
        isOpen={isCreateCaseModalOpen}
        onClose={() => setIsCreateCaseModalOpen(false)}
        onSuccess={handleCaseCreated}
      />

      {/* Global Toast Stack */}
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
