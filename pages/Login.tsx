import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../App';
import { ShieldAlert, Loader2, Phone, Lock, ArrowRight, WifiOff, Eye, EyeOff, Mail, Key, CheckCircle2 } from 'lucide-react';

const Login: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (forgotStep === 1) {
        if (!forgotEmail) {
          setError('Please enter your email');
          setIsLoading(false);
          return;
        }
        await api.post('/auth/forgot-password', null, { params: { email: forgotEmail } });
        setForgotStep(2);
      } else if (forgotStep === 2) {
        if (!forgotOtp) {
          setError('Please enter the OTP');
          setIsLoading(false);
          return;
        }
        await api.post('/auth/verify-otp', null, { params: { email: forgotEmail, otp: forgotOtp } });
        setForgotStep(3);
      } else if (forgotStep === 3) {
        if (!newPassword || newPassword.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        // Sometimes reset-password needs the newly generated token or just uses the recent verified state. Assuming standard params.
        await api.post('/auth/reset-password', null, { params: { email: forgotEmail, newPassword: newPassword } });
        alert('Password Changed Successfully! Please login.');
        setIsForgotPassword(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="p-10 pt-16 text-center">
          <img 
            src="/DUA E KHAIR Logo.png" 
            alt="Dua-E-Khair Foundation Logo" 
            className="w-32 h-32 mx-auto mb-6 object-contain drop-shadow-lg"
          />
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Dua-E-Khair Foundation
          </h1>
          <p className="text-gray-400 font-semibold text-sm">
            Operation & Management Portal
          </p>
        </div>

        {/* Form */}
        {!isForgotPassword ? (
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
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setError(''); }}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                >
                  Forgot Password?
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
        ) : (
          <form onSubmit={handleForgotSubmit} className="p-10 pt-2 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-2">
               <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
               <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setForgotStep(1); setError(''); }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600"
               >
                  Cancel
               </button>
            </div>
            
            {error && (
              <div className="p-4 rounded-2xl border animate-in shake duration-300 bg-red-50 border-red-100 text-red-600">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Error</span>
                </div>
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            {forgotStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-medium">Enter your registered email.</p>
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="email" required placeholder="you@example.com" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP'}
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-blue-600 font-medium bg-blue-50 p-3 rounded-xl border border-blue-100">OTP sent to {forgotEmail}.</p>
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Enter 4-Digit OTP</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="text" required maxLength={4} placeholder="1234" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold" value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-3">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify OTP'}
                </button>
              </div>
            )}

            {forgotStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-emerald-600 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-2"><CheckCircle2 size={16}/>   OTP Verified</p>
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="password" required placeholder="Enter new password" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-3">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                </button>
              </div>
            )}
          </form>
        )}

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
