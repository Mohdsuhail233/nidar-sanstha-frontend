import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../App';
import { ShieldAlert, Loader2, Phone, Lock, ArrowRight, WifiOff, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  setIsNetworkError(false);
  // Clear any stale token from previous sessions
  localStorage.removeItem('token');

  try {
    const response = await api.post('/auth/login', { mobile, password });
    const userData = response.data;

    // --- YE LINE ADD KARO ---
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }

    login(userData);

    const roleRedirects: Record<string, string> = {
      SUPER_ADMIN: '/dashboard/super-admin',
      ADMIN: '/dashboard/admin',
      FIELD_STAFF: '/dashboard/field-staff',
    };

    navigate(roleRedirects[userData.role] || '/', { replace: true });
  } catch (err: any) {
    console.error('Login Error:', err);
    // Error handling waise hi rahegi
    if (err.isNetworkError) {
      setIsNetworkError(true);
      setError(err.message);
    } else {
      setError(err.response?.data?.message || 'Invalid Credentials');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="p-10 pt-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[2rem] mb-6 text-white shadow-xl shadow-blue-200">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Nidar Sanstha
          </h1>
          <p className="text-gray-400 font-semibold text-sm">
            Operation & Management Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-10 pt-2 space-y-6">

          {/* Error Box */}
          {error && (
            <div
              className={`p-4 rounded-2xl border animate-in shake duration-300 ${
                isNetworkError
                  ? 'bg-amber-50 border-amber-100 text-amber-700'
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isNetworkError ? <WifiOff size={16} /> : <ShieldAlert size={16} />}
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isNetworkError ? 'Connection Error' : 'Auth Failed'}
                </span>
              </div>
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-4">

            {/* Mobile */}
            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Staff ID / Mobile
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500"
                />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Enter registered mobile"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 text-lg"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Sign In
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">
            Authorized Person Only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
