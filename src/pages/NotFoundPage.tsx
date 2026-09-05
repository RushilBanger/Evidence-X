import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-cyan-400 mb-4 shadow-xl">
        <FileQuestion className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">
        404 - Resource Not Found
      </h2>
      <p className="text-sm text-slate-400 max-w-md mt-2 mb-6 leading-relaxed">
        The requested digital record, case dossier, or application route does not exist in the SecureDoc database.
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

export default NotFoundPage;
