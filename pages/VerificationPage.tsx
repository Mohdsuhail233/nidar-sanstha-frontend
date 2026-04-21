import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, MapPin, Loader2, User, Calendar, Hash, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface VerificationData {
  name?: string;
  customerName?: string;
  fullName?: string;
  memberId?: string;
  id?: string;
  validUpto?: string;
  validity?: string;
  expiryDate?: string;
  status?: string; // e.g., 'ACTIVE', 'EXPIRED'
  latitude?: string;
  longitude?: string;
  [key: string]: any; // Allow dynamic fields from backend
}

const VerificationPage: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapOpened, setMapOpened] = useState(false);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const response = await api.get(`/form/verify/${id}`);
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid QR code or verification data not found.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVerification();
    } else {
      setLoading(false);
      setError('Invalid verification link parameters.');
    }
  }, [id]);

  useEffect(() => {
    if (data && data.latitude && data.longitude && !mapOpened) {
      const timer = setTimeout(() => {
        openGoogleMaps();
        setMapOpened(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [data, mapOpened]);

  const openGoogleMaps = () => {
    // Use mapUrl from backend if available, otherwise build from coordinates
    if (data?.mapUrl) {
      window.open(data.mapUrl, '_blank');
    } else if (data?.latitude && data?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Authenticating...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-red-100/50 max-w-sm w-full text-center border overflow-hidden">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Verification Failed</h2>
          <p className="text-gray-500 font-medium mb-8 pb-8 border-b border-gray-100">{error}</p>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            DUA-E-KHAIR FOUNDATION
          </div>
        </div>
      </div>
    );
  }

  // Determine if active — .trim() needed because backend sends "ACTIVE " with trailing space
  const statusStr = (data.status || 'ACTIVE').trim().toUpperCase();
  const isActive = statusStr === 'ACTIVE' || statusStr === 'VALID';

  // Fallbacks for display — backend sends `memberIdNo`, not `memberId`
  const displayName = data.name || data.customerName || data.fullName || 'N/A';
  const displayId = data.memberIdNo || data.memberId || data.id || 'N/A';
  const displayDate = data.validUpto || data.validity || data.expiryDate || 'N/A';

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-emerald-50 text-gray-800 flex items-center justify-center p-4 sm:p-6 fade-in">
      <div className="bg-white rounded-[3rem] p-8 sm:p-10 shadow-2xl shadow-blue-900/5 max-w-md w-full border border-white/50 relative overflow-hidden">
        
        {/* Soft background accent */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

        <div className="relative z-10">
          {/* Header Area */}
          <div className="text-center mb-10">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl ${isActive ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200' : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-red-200'}`}>
              <ShieldCheck className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
              {isActive ? 'Verification Successful' : 'Verification Expired'}
            </h1>
            <p className="text-blue-600 font-black text-[11px] uppercase tracking-[0.25em]">DUA-E-KHAIR FOUNDATION</p>
          </div>

          {/* User Details Grid */}
          <div className="space-y-4 mb-10">
            {/* Name Banner */}
            <div className="bg-gray-50/80 p-5 rounded-[2rem] border border-gray-100/80 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Member Name</p>
                <p className="font-black text-gray-900 text-xl leading-tight">{displayName}</p>
              </div>
            </div>

            {/* Sub-details grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/80 p-5 rounded-[2rem] border border-gray-100/80">
                <div className="flex items-center gap-2 mb-3 text-blue-500">
                  <Hash className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Member ID</p>
                <p className="font-bold text-gray-900 truncate">{displayId}</p>
              </div>

              <div className="bg-gray-50/80 p-5 rounded-[2rem] border border-gray-100/80">
                <div className="flex items-center gap-2 mb-3 text-blue-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valid Upto</p>
                <p className="font-bold text-gray-900">{displayDate}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`p-4 rounded-[2rem] border-2 flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-[0.15em] ${isActive ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
              {isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              Status: {statusStr}
            </div>
          </div>

          {/* Action Button */}
          {(data.latitude && data.longitude) ? (
            <button
              onClick={openGoogleMaps}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-full font-black uppercase text-[11px] tracking-widest transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98]"
            >
              <MapPin className="w-5 h-5" />
              {mapOpened ? 'Open Again In Maps' : 'Open Location in Maps'}
            </button>
          ) : (
            <div className="text-center p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" /> No Map Data Attached
              </p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); scale: 0.98; }
          to { opacity: 1; transform: translateY(0); scale: 1; }
        }
      `}</style>
    </div>
  );
};

export default VerificationPage;
