import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-400 mb-4 shadow-xl">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">
        403 - Access Forbidden
      </h2>
      <p className="text-sm text-slate-400 max-w-md mt-2 mb-6 leading-relaxed">
        You do not have the required role privileges or clearance to execute this operation. This security event is logged in the system records.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Go Back
        </Button>
        <Button variant="primary" onClick={() => navigate('/')} leftIcon={<Home className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
