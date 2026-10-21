import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Check
} from 'lucide-react';
import {
  adminLogin,
  requestAdminPasswordReset,
  verifyAdminOtpAndResetPassword,
  updateAdminPasswordDirect,
  AdminSession
} from '../../services/adminAuthService';
import { supabase } from '../../lib/supabaseClient';

interface AdminLoginGateProps {
  onAuthenticated: (session: AdminSession) => void;
  onBackToHome?: () => void;
  onNavigateToClientPortal?: () => void;
}

type GateMode = 'login' | 'forgot' | 'verify_otp' | 'recovery_direct' | 'success';

export function AdminLoginGate({ onAuthenticated, onBackToHome, onNavigateToClientPortal }: AdminLoginGateProps) {
  // Mode State
  const [mode, setMode] = useState<GateMode>('login');

  // Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recovery States
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  // Auto-detect recovery hash or Supabase auth event on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setMode('recovery_direct');
      }
    }

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setMode('recovery_direct');
        }
      });
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Standard Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both administrator email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await adminLogin(email.trim(), password.trim());
    setIsLoading(false);

    if (result.success && result.session) {
      onAuthenticated(result.session);
    } else {
      setErrorMessage(result.error || 'Authentication denied. Please check your administrator credentials.');
    }
  };

  // Forgot Password Request Submit (Triggers email & 6-digit OTP)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid administrator email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await requestAdminPasswordReset(cleanEmail);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || `A secure password reset link and verification code have been dispatched to ${cleanEmail}.`);
      setCooldown(60);
      setMode('verify_otp');
    } else {
      setErrorMessage(result.error || 'Failed to dispatch password recovery email.');
    }
  };

  // Verify OTP and Set New Password
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (!cleanEmail) {
      setErrorMessage('Email address is missing. Please go back and enter your email.');
      return;
    }

    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMessage('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await verifyAdminOtpAndResetPassword(cleanEmail, cleanOtp, newPassword);
    setIsLoading(false);

    if (result.success) {
      if (result.session) {
        setSuccessMessage('Password successfully updated! Authorizing your command session...');
        setTimeout(() => {
          onAuthenticated(result.session!);
        }, 1200);
      } else {
        setSuccessMessage(result.message || 'Password updated successfully! You can now sign in.');
        setMode('success');
      }
    } else {
      setErrorMessage(result.error || 'Verification failed. Please check the 6-digit code or request a new one.');
    }
  };

  // Direct Recovery (when arrived via recovery email link)
  const handleDirectRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await updateAdminPasswordDirect(newPassword);
    setIsLoading(false);

    if (result.success) {
      if (result.session) {
        setSuccessMessage('Password successfully updated! Launching Administrator Command Console...');
        setTimeout(() => {
          onAuthenticated(result.session!);
        }, 1200);
      } else {
        setSuccessMessage('Password updated successfully. You can now sign in with your new credentials.');
        setMode('success');
      }
    } else {
      setErrorMessage(result.error || 'Failed to update password with Supabase.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-6 inline-flex items-center gap-2 text-xs font-mono text-purple-300 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Vixora Main Site
          </button>
        )}

        <div className="relative rounded-3xl bg-[#0e0724]/90 border border-purple-500/30 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-purple-950/60">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-purple-900/40 border border-purple-500/40 text-purple-300 mb-4 shadow-inner shadow-purple-500/20">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              {mode === 'login' && 'Enterprise Admin Portal'}
              {mode === 'forgot' && 'Reset Admin Password'}
              {mode === 'verify_otp' && 'Verify Security Code'}
              {mode === 'recovery_direct' && 'Set New Admin Password'}
              {mode === 'success' && 'Password Updated'}
            </h1>
            <p className="text-sm text-neutral-300">
              {mode === 'login' && 'Vixora Digital Hub • Supabase Auth Protected'}
              {mode === 'forgot' && 'Enter your authorized administrator email for a cryptographic reset link'}
              {mode === 'verify_otp' && 'Enter the 6-digit code sent to your email to create a new password'}
              {mode === 'recovery_direct' && 'Supabase recovery session verified. Choose your new password.'}
              {mode === 'success' && 'Your administrator credentials have been updated securely'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-3 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* MODE 1: STANDARD ADMIN LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-medium text-purple-200 mb-2">
                  Administrator Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vixoradigitalhub.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white placeholder-purple-300/30 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono font-medium text-purple-200">
                    Administrator Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setMode('forgot');
                    }}
                    className="text-xs font-mono text-purple-300 hover:text-purple-100 underline decoration-purple-500/50 cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white placeholder-purple-300/30 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-400/60 hover:text-purple-300 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-900/50 hover:shadow-purple-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying Supabase Credentials...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Authorize Command Session
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: FORGOT PASSWORD REQUEST FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-medium text-purple-200 mb-2">
                  Registered Administrator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vixoralabsai@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white placeholder-purple-300/30 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  />
                </div>
                <p className="mt-2 text-[11px] text-purple-300/70 leading-relaxed">
                  We will dispatch a high-security recovery link and 6-digit verification code to this authorized address.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setMode('login');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-700/40 text-purple-200 text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || cooldown > 0}
                  className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Dispatching Reset Link...
                    </>
                  ) : cooldown > 0 ? (
                    `Wait ${cooldown}s to Resend`
                  ) : (
                    <>
                      Send Reset Email
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('verify_otp');
                  }}
                  className="text-xs font-mono text-purple-300 hover:text-white underline decoration-purple-500/40 cursor-pointer"
                >
                  Already have a 6-digit verification code? Enter it here
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: ENTER 6-DIGIT OTP AND CREATE NEW PASSWORD */}
          {mode === 'verify_otp' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-purple-200 mb-1.5">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-purple-200 mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl bg-purple-950/40 border border-purple-500/60 text-white text-center text-xl font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[11px] text-purple-300/70 mt-1 text-center">
                  Check your inbox for the code dispatched by Vixora Auth.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-purple-200 mb-1.5">
                  New Administrator Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400/60 hover:text-purple-300 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-purple-200 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('login');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-700/40 text-purple-200 text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleForgotSubmit({ preventDefault: () => {} } as any)}
                  disabled={cooldown > 0}
                  className="text-xs font-mono text-purple-300 hover:text-white underline decoration-purple-500/40 cursor-pointer disabled:opacity-50"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Did not receive code? Resend email'}
                </button>
              </div>
            </form>
          )}

          {/* MODE 4: DIRECT RECOVERY (FROM EMAIL LINK) */}
          {mode === 'recovery_direct' && (
            <form onSubmit={handleDirectRecoverySubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Cryptographic recovery token validated by Supabase Auth.</span>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-purple-200 mb-1.5">
                  Choose New Administrator Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-400/60 hover:text-purple-300 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-purple-200 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving New Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Save New Password & Launch
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 5: SUCCESS CARD */}
          {mode === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Password Successfully Updated</h3>
                <p className="text-xs text-neutral-300">
                  Your administrator credentials have been securely stored in Supabase Auth.
                </p>
              </div>
              <button
                onClick={() => {
                  setPassword('');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 cursor-pointer"
              >
                Return to Administrator Login
              </button>
            </div>
          )}

          {/* Client Portal Link */}
          {onNavigateToClientPortal && (
            <div className="mt-6 pt-5 border-t border-purple-900/30 text-center">
              <button
                type="button"
                onClick={onNavigateToClientPortal}
                className="inline-flex items-center gap-1.5 text-xs text-purple-300/80 hover:text-purple-200 transition-colors cursor-pointer group"
              >
                <Building2 className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Access Enterprise Client Project Portal &rarr;</span>
              </button>
            </div>
          )}

          {/* Security Guarantee Footer */}
          <div className="mt-6 pt-5 border-t border-purple-900/30 flex items-center justify-center gap-4 text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Auth
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-purple-300">
              <Building2 className="w-3.5 h-3.5" /> Vixora Digital Hub
            </span>
            <span>&bull;</span>
            <span>TLS 1.3 Active</span>
          </div>

        </div>
      </div>
    </div>
  );
}
