
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md animate-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 text-red-600 rounded-full mb-8">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-500 mb-8 font-medium">
          You don't have the required permissions to access this page. If you believe this is an error, contact your Super Admin.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
