import React, { useState, useEffect } from 'react';
import { 
  Certificate, 
  StudentProfile, 
  StudentCourse 
} from '../data/academyPortalData';
import { supabase } from '../lib/supabaseClient';
import { CertificateDocument } from '../components/CertificateDocument';
import { CertificateVerificationWidget } from '../components/CertificateVerificationWidget';
import { IssueCertificatePanel } from '../components/IssueCertificatePanel';
import { 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  Send, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Download,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Check
} from 'lucide-react';

interface StudentPortalPageProps {
  initialTab?: 'dashboard' | 'certificates' | 'verify' | 'issue';
  initialCertId?: string;
  onNavigateToCourse?: (courseSlug: string) => void;
}

export const StudentPortalPage: React.FC<StudentPortalPageProps> = ({
  initialTab = 'dashboard',
  initialCertId,
  onNavigateToCourse
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'certificates' | 'verify' | 'issue'>(
    initialCertId ? 'certificates' : initialTab
  );

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [studentCertificates, setStudentCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Login form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(5);

  // Forgot Password / Password Recovery states
  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'verify_otp' | 'recovery_direct' | 'reset_success'>('login');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoverySuccessMessage, setRecoverySuccessMessage] = useState<string | null>(null);
  const [recoveryErrorMessage, setRecoveryErrorMessage] = useState<string | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState<number>(0);
  const [isRecoveryActive, setIsRecoveryActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      return hash.includes('type=recovery') || search.includes('type=recovery');
    }
    return false;
  });

  // Auto-detect recovery link hash, error parameters, or Supabase auth event on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      // Check for Supabase expired link or access denied error in URL
      if (hash.includes('error=') || search.includes('error=')) {
        const rawParams = search || (hash.startsWith('#') ? `?${hash.slice(1)}` : `?${hash}`);
        const urlParams = new URLSearchParams(rawParams.includes('?') ? rawParams.split('?')[1] : rawParams);
        const errorCode = urlParams.get('error_code') || urlParams.get('error');
        if (errorCode === 'otp_expired' || errorCode === 'access_denied') {
          setRecoveryErrorMessage('Your secure password setup link has expired or has already been used. Please enter your email below to receive a fresh 6-digit verification code.');
        } else {
          setRecoveryErrorMessage('The authentication link could not be verified. Please request a new verification code below.');
        }
        setAuthMode('forgot');
        setActiveTab('dashboard');
        setIsRecoveryActive(false);
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch {
          // ignore history update failures
        }
        return;
      }

      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setIsRecoveryActive(true);
        setAuthMode('recovery_direct');
        setActiveTab('dashboard');
      }
    }

    if (supabase) {
      const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryActive(true);
          setAuthMode('recovery_direct');
          setActiveTab('dashboard');
        }
      });
      return () => {
        authSub?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Cooldown countdown timer for resending reset code
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  // Email sending state
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Session Restoration via Supabase Auth
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        if (!supabase) {
          if (isMounted) setIsRestoringSession(false);
          return;
        }

        // If a password recovery session is actively being established, do NOT prematurely
        // restore regular dashboard session. The student must set their password first.
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const search = typeof window !== 'undefined' ? window.location.search : '';
        if (isRecoveryActive || hash.includes('type=recovery') || search.includes('type=recovery')) {
          if (isMounted) setIsRestoringSession(false);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.access_token) {
          if (isMounted) setIsRestoringSession(false);
          return;
        }

        const res = await fetch('/api/student/profile', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.student) {
            setIsLoggedIn(true);
            setCurrentStudent(data.student);
            const certs = data.certificates || [];
            setStudentCertificates(certs);
            if (certs.length > 0) {
              setSelectedCertificate(certs[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Could not restore student session:', err);
      } finally {
        if (isMounted) {
          setIsRestoringSession(false);
        }
      }
    };

    restoreSession();

    const { data: authListener } = supabase ? supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) {
          setIsLoggedIn(false);
          setCurrentStudent(null);
          setStudentCertificates([]);
          setSelectedCertificate(null);
        }
      }
    }) : { data: { subscription: null } };

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Check rate limit status on mount and when email changes
  const checkRateLimitStatus = async (email: string) => {
    try {
      const res = await fetch(`/api/student/rate-limit-status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.remaining !== undefined) {
        setRemainingAttempts(data.remaining);
      }
      if (data.isLimited && data.resetInSeconds) {
        setRateLimitCooldown(data.resetInSeconds);
      }
    } catch (e) {
      // Ignore network errors in status probe
    }
  };

  useEffect(() => {
    checkRateLimitStatus(emailInput);
  }, [emailInput]);

  // Rate limit countdown timer
  useEffect(() => {
    if (rateLimitCooldown === null || rateLimitCooldown <= 0) return;
    const interval = setInterval(() => {
      setRateLimitCooldown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setLoginError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitCooldown]);

  // Set default selected certificate from seed or initial
  useEffect(() => {
    if (initialCertId) {
      const found = studentCertificates.find(c => c.id === initialCertId);
      if (found) {
        setSelectedCertificate(found);
        setActiveTab('certificates');
      }
    } else if (!selectedCertificate && studentCertificates.length > 0) {
      setSelectedCertificate(studentCertificates[0]);
    }
  }, [initialCertId, studentCertificates]);

  // Handle student login with Supabase Auth
  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (overrideEmail || emailInput).trim().toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      setLoginError('Please enter a valid student email address.');
      return;
    }

    if (!passwordInput) {
      setLoginError('Please enter your student account password.');
      return;
    }

    if (rateLimitCooldown && rateLimitCooldown > 0) {
      setLoginError(`Rate limit reached. Please wait ${rateLimitCooldown}s before trying again.`);
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      // Step 0: Check & record login attempt against rate limiter
      try {
        const rlRes = await fetch('/api/student/record-login-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail })
        });
        const rlData = await rlRes.json();
        if (rlData.remaining !== undefined) {
          setRemainingAttempts(rlData.remaining);
        }
        if (!rlData.allowed || rlRes.status === 429) {
          const cooldown = rlData.resetInSeconds || 900;
          setRateLimitCooldown(cooldown);
          setRemainingAttempts(0);
          setLoginError(`Adaptive security active: Maximum login attempts reached (5/5). Please wait ${cooldown}s before trying again.`);
          setLoginLoading(false);
          return;
        }
      } catch {
        // Proceed if network probe fails
      }

      let accessToken: string | null = null;

      // Step 1: Direct client-side Supabase authentication if available
      if (supabase) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password: passwordInput
          });
          if (!authError && authData.session?.access_token) {
            accessToken = authData.session.access_token;
          } else if (authError) {
            if (authError.message?.toLowerCase().includes('invalid login credentials')) {
              setLoginError('Invalid student email or password. Please verify your credentials or reset your password.');
              setLoginLoading(false);
              return;
            }
          }
        } catch {
          // Proceed to server proxy fallback
        }
      }

      // Step 1b: Server proxy fallback if client-side SDK is unavailable or blocked
      if (!accessToken) {
        const loginRes = await fetch('/api/auth/student-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, password: passwordInput })
        });
        const loginData = await loginRes.json().catch(() => ({}));
        if (!loginRes.ok || !loginData.session?.access_token) {
          if (loginData.remaining !== undefined) {
            setRemainingAttempts(loginData.remaining);
          }
          if (loginRes.status === 429 || loginData.code === 'RATE_LIMIT_EXCEEDED') {
            const cooldown = loginData.resetInSeconds || 900;
            setRateLimitCooldown(cooldown);
            setRemainingAttempts(0);
            setLoginError(`Adaptive security active: Maximum login attempts reached (5/5). Please wait ${cooldown}s before trying again.`);
          } else {
            setLoginError(loginData.error || 'Login failed. Invalid student credentials.');
          }
          setLoginLoading(false);
          return;
        }
        accessToken = loginData.session.access_token;
      }

      // Step 2: Query protected student profile with verified Supabase JWT
      const res = await fetch('/api/student/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Failed to retrieve your student profile.');
        setLoginLoading(false);
        return;
      }

      // Step 3: Establish authenticated UI state and reset rate limiter
      fetch('/api/student/reset-rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      }).catch(() => {});

      setIsLoggedIn(true);
      setCurrentStudent(data.student);
      const certs = data.certificates || [];
      setStudentCertificates(certs);
      if (certs.length > 0) {
        setSelectedCertificate(certs[0]);
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Network error connecting to Vixora Academy Authentication Gateway.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error signing out from Supabase:', err);
    } finally {
      setIsLoggedIn(false);
      setCurrentStudent(null);
      setStudentCertificates([]);
      setSelectedCertificate(null);
    }
  };

  // Request password reset link & OTP for student
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setRecoveryErrorMessage('Please enter your valid student email address.');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryErrorMessage(null);
    setRecoverySuccessMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          portal: 'student',
          redirectOrigin: typeof window !== 'undefined' ? window.location.origin : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRecoveryErrorMessage(data.error || 'Failed to dispatch reset email. Please ensure your student email is registered.');
        return;
      }

      setRecoverySuccessMessage(data.message || `A password reset link and 6-digit verification code have been dispatched to ${cleanEmail}.`);
      setForgotCooldown(60);
      setAuthMode('verify_otp');
    } catch (err: any) {
      setRecoveryErrorMessage(err?.message || 'Network error requesting password reset.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Verify OTP and update password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanOtp = recoveryOtp.trim();

    if (!cleanEmail) {
      setRecoveryErrorMessage('Student email is missing. Please go back and enter your email.');
      return;
    }

    if (!cleanOtp || cleanOtp.length < 6) {
      setRecoveryErrorMessage('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setRecoveryErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryErrorMessage('New password and confirm password do not match.');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryErrorMessage(null);
    setRecoverySuccessMessage(null);

    try {
      let token: string | null = null;
      if (supabase) {
        const { data: vData, error: vErr } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: 'recovery'
        });

        if (!vErr && vData?.session) {
          const { error: uErr } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (!uErr) {
            token = vData.session.access_token;
          }
        }
      }

      if (!token) {
        const res = await fetch('/api/auth/reset-password-with-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            otp: cleanOtp,
            newPassword
          })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          const rawErr = data.error || '';
          if (rawErr.toLowerCase().includes('expired') || rawErr.toLowerCase().includes('invalid')) {
            setRecoveryErrorMessage('Your 6-digit verification code has expired or is invalid. Please request a fresh code below.');
          } else {
            setRecoveryErrorMessage(rawErr || 'Failed to update password. Please check your verification code and try again.');
          }
          return;
        }

        if (supabase) {
          const { data: loginData } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: newPassword
          });
          token = loginData?.session?.access_token || null;
        }
      }

      if (token) {
        const profileRes = await fetch('/api/student/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const pData = await profileRes.json();
          setIsLoggedIn(true);
          setCurrentStudent(pData.student);
          const certs = pData.certificates || [];
          setStudentCertificates(certs);
          if (certs.length > 0) {
            setSelectedCertificate(certs[0]);
          }
          setAuthMode('login');
          return;
        }
      }

      setRecoverySuccessMessage('Password updated successfully! You can now log in with your new credentials.');
      setPasswordInput(newPassword);
      setAuthMode('reset_success');
    } catch (err: any) {
      setRecoveryErrorMessage(err?.message || 'Error processing password reset.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Direct Recovery when arrived from email link
  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setRecoveryErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryErrorMessage('New password and confirmation do not match.');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryErrorMessage(null);
    setRecoverySuccessMessage(null);

    try {
      let updated = false;

      // 1. Primary: client-side Supabase updateUser
      if (supabase) {
        try {
          const { error: uErr } = await supabase.auth.updateUser({
            password: newPassword
          });
          if (!uErr) {
            updated = true;
          }
        } catch {
          // Proceed to token-based server fallback
        }
      }

      // 2. Secondary fallback: Extract access_token from URL hash/search and update securely via server
      if (!updated) {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const search = typeof window !== 'undefined' ? window.location.search : '';
        const match = hash.match(/access_token=([^&]+)/) || search.match(/access_token=([^&]+)/);
        const accessToken = match ? decodeURIComponent(match[1]) : null;

        if (accessToken) {
          const res = await fetch('/api/auth/reset-password-with-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken, newPassword })
          });
          const resData = await res.json().catch(() => ({}));
          if (res.ok && resData.success) {
            updated = true;
          } else if (resData.error) {
            setRecoveryErrorMessage(resData.error);
            if (resData.code === 'TOKEN_EXPIRED') {
              setAuthMode('forgot');
            }
            return;
          }
        }
      }

      if (!updated) {
        setRecoveryErrorMessage('Your password setup session has expired or has already been used. Please enter your email below to receive a fresh 6-digit verification code.');
        setAuthMode('forgot');
        return;
      }

      setIsRecoveryActive(false);
      try {
        window.history.replaceState({}, '', window.location.pathname);
      } catch {
        // ignore
      }

      if (supabase) {
        const { data: sData } = await supabase.auth.getSession();
        const token = sData?.session?.access_token;
        if (token) {
          const profileRes = await fetch('/api/student/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const pData = await profileRes.json();
            setIsLoggedIn(true);
            setCurrentStudent(pData.student);
            const certs = pData.certificates || [];
            setStudentCertificates(certs);
            if (certs.length > 0) {
              setSelectedCertificate(certs[0]);
            }
            setAuthMode('login');
            return;
          }
        }
      }

      setRecoverySuccessMessage('Password updated successfully! Please sign in with your new credentials.');
      setPasswordInput(newPassword);
      setAuthMode('reset_success');
    } catch (err: any) {
      setRecoveryErrorMessage(err?.message || 'Error updating password.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Automated Certificate Email Sender
  const handleSendCertificateEmail = async (certId: string, email: string) => {
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/certificates/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId: certId,
          customRecipientEmail: email
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Failed to dispatch email.',
          remaining: data.remaining,
          delivery: data.delivery
        };
      }
      return {
        success: true,
        message: data.message,
        delivery: data.delivery,
        emailLog: data.emailLog,
        remaining: data.rateLimit?.remaining
      };
    } catch (e: any) {
      return {
        success: false,
        message: 'Network error communicating with the mail server.'
      };
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Dynamic Student Overview Progress Metrics
  const coursesCompletedCount = currentStudent?.courses.filter(
    (c) => c.status === 'completed' || c.progressPercent >= 100
  ).length ?? 0;

  const activeEnrollmentsCount = currentStudent?.courses.filter(
    (c) => c.status !== 'completed' && c.progressPercent < 100
  ).length ?? 0;

  const certificatesEarnedCount = (studentCertificates && studentCertificates.length > 0)
    ? studentCertificates.length
    : (currentStudent?.courses.filter((c) => Boolean(c.certificateId)).length ?? 0);

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#000048] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Academy Branding */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          
          {/* Subtle logo emblem in background */}
          <div 
            className="absolute -right-8 -bottom-10 w-72 h-72 opacity-10 pointer-events-none rounded-full bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: `url('/images/vixora-academy-logo.jpg')` }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-2xl shadow-md shrink-0">
                <img 
                  src="/images/vixora-academy-logo.jpg" 
                  alt="Vixora Academy" 
                  className="h-14 sm:h-16 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-white/15 text-purple-200 backdrop-blur-xs mb-2">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Student & Certificate Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  Vixora Academy Academic Directorate
                </h1>
                <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
                  Official portal for coursework tracking, cryptographic credential verification, and automated graduate certificate dispatch under Dean <strong className="text-white">Sarumi Hammad</strong>.
                </p>
              </div>
            </div>

            {/* Authenticated user status or quick login reminder */}
            {isLoggedIn && currentStudent ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between md:flex-col md:items-end gap-3">
                <div className="text-left md:text-right">
                  <div className="text-xs text-purple-200 font-medium">Logged in as</div>
                  <div className="text-sm font-bold text-white">{currentStudent.name}</div>
                  <div className="text-[11px] font-mono text-purple-300">{currentStudent.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">Protected by Adaptive Rate Limiter</div>
                  <div className="text-purple-200 text-[11px]">Sliding-window brute-force mitigation active</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs Pill Bar */}
          <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#000048] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'certificates'
                  ? 'bg-white text-[#000048] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Certificate Portal & Viewer</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'verify'
                  ? 'bg-white text-[#000048] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Credential ID</span>
            </button>

            <button
              onClick={() => setActiveTab('issue')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'issue'
                  ? 'bg-white text-[#000048] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Issue & Auto-Email Certificates</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area Based on Active Tab */}
      <div className="max-w-6xl mx-auto">
        
        {/* ==================================================== */}
        {/* TAB 1: STUDENT DASHBOARD (WITH EMAIL LOGIN)          */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div>
            {isRestoringSession ? (
              <div className="max-w-md mx-auto bg-white rounded-3xl border border-purple-100 shadow-sm p-12 text-center my-8">
                <div className="w-10 h-10 border-3 border-[#7000F8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-[#000048]">Restoring student session...</p>
                <p className="text-xs text-neutral-400 mt-1">Verifying student credentials</p>
              </div>
            ) : (!isLoggedIn || isRecoveryActive || authMode === 'recovery_direct') ? (
              /* Student Authentication Card with Multi-Mode (Login & Forgot Password Flow) */
              <div className="max-w-lg mx-auto bg-white rounded-3xl border border-purple-100 shadow-xl p-8">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#000048] to-[#7000F8] flex items-center justify-center text-white mx-auto mb-3 shadow-md">
                    {authMode === 'login' && <Lock className="w-7 h-7 text-amber-300" />}
                    {authMode === 'forgot' && <KeyRound className="w-7 h-7 text-amber-300" />}
                    {authMode === 'verify_otp' && <ShieldCheck className="w-7 h-7 text-amber-300" />}
                    {authMode === 'recovery_direct' && <Sparkles className="w-7 h-7 text-amber-300" />}
                    {authMode === 'reset_success' && <Check className="w-7 h-7 text-emerald-300" />}
                  </div>
                  <h2 className="text-2xl font-black text-[#000048] tracking-tight">
                    {authMode === 'login' && 'Student Portal Login'}
                    {authMode === 'forgot' && 'Reset Student Password'}
                    {authMode === 'verify_otp' && 'Verify 6-Digit Code'}
                    {authMode === 'recovery_direct' && 'Set New Student Password'}
                    {authMode === 'reset_success' && 'Password Updated!'}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    {authMode === 'login' && 'Sign in with your registered academy email to access courses and certifications'}
                    {authMode === 'forgot' && 'Enter your registered student email address to receive a secure password recovery link and code'}
                    {authMode === 'verify_otp' && 'Enter the 6-digit code sent to your email along with your new password'}
                    {authMode === 'recovery_direct' && 'Supabase recovery link confirmed. Enter your new password below'}
                    {authMode === 'reset_success' && 'Your student account credentials have been updated securely'}
                  </p>
                </div>

                {/* Rate Limiting Status Indicator (shown on login mode) */}
                {authMode === 'login' && (
                  <div className={`mb-6 p-3 rounded-2xl text-xs flex items-center justify-between border ${
                    rateLimitCooldown && rateLimitCooldown > 0
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-purple-50 border-purple-100 text-[#000048]'
                  }`}>
                    <div className="flex items-center gap-2">
                      {rateLimitCooldown && rateLimitCooldown > 0 ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-[#7000F8] shrink-0" />
                      )}
                      <span>
                        {rateLimitCooldown && rateLimitCooldown > 0
                          ? `Rate Limiter Active: Cooldown in progress`
                          : `Adaptive Security Active`}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[11px] bg-white px-2 py-0.5 rounded-lg border">
                      {rateLimitCooldown && rateLimitCooldown > 0
                        ? `${rateLimitCooldown}s left`
                        : `${remainingAttempts}/5 attempts left`}
                    </span>
                  </div>
                )}

                {/* Authentication / Recovery Error Messages */}
                {(loginError && authMode === 'login') && (
                  <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Authentication Error</div>
                      <div className="mt-0.5">{loginError}</div>
                    </div>
                  </div>
                )}

                {recoveryErrorMessage && authMode !== 'login' && (
                  <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Recovery Notice</div>
                      <div className="mt-0.5">{recoveryErrorMessage}</div>
                    </div>
                  </div>
                )}

                {recoverySuccessMessage && (
                  <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Success</div>
                      <div className="mt-0.5">{recoverySuccessMessage}</div>
                    </div>
                  </div>
                )}

                {/* MODE 1: STANDARD STUDENT LOGIN */}
                {authMode === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                        Student Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="student@vixora.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                          required
                          disabled={loginLoading || (rateLimitCooldown !== null && rateLimitCooldown > 0)}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#000048]">
                          Password or Access Code
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginError(null);
                            setRecoveryErrorMessage(null);
                            setRecoverySuccessMessage(null);
                            setAuthMode('forgot');
                          }}
                          className="text-xs font-semibold text-[#7000F8] hover:text-[#000048] underline decoration-purple-300 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-11 py-3 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                          disabled={loginLoading || (rateLimitCooldown !== null && rateLimitCooldown > 0)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading || (rateLimitCooldown !== null && rateLimitCooldown > 0)}
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {loginLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span>
                        {rateLimitCooldown && rateLimitCooldown > 0
                          ? `Locked (${rateLimitCooldown}s cooldown)`
                          : loginLoading
                          ? 'Authenticating...'
                          : 'Sign In to Student Portal'}
                      </span>
                    </button>
                  </form>
                )}

                {/* MODE 2: FORGOT PASSWORD REQUEST FORM */}
                {authMode === 'forgot' && (
                  <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                        Registered Student Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="student@vixora.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                          required
                          disabled={recoveryLoading}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-neutral-500 leading-relaxed">
                        We will dispatch a secure recovery link and 6-digit verification code to this address.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryErrorMessage(null);
                          setRecoverySuccessMessage(null);
                          setAuthMode('login');
                        }}
                        className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        Back to Sign In
                      </button>
                      <button
                        type="submit"
                        disabled={recoveryLoading || forgotCooldown > 0}
                        className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#000048] to-[#7000F8] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {recoveryLoading ? (
                          <>
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Dispatching Email...
                          </>
                        ) : forgotCooldown > 0 ? (
                          `Wait ${forgotCooldown}s to Resend`
                        ) : (
                          <>
                            Send Reset Email
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryErrorMessage(null);
                          setAuthMode('verify_otp');
                        }}
                        className="text-xs text-[#7000F8] hover:text-[#000048] underline decoration-purple-300 cursor-pointer"
                      >
                        Already have a 6-digit code? Enter it here
                      </button>
                    </div>
                  </form>
                )}

                {/* MODE 3: ENTER 6-DIGIT OTP AND NEW PASSWORD */}
                {authMode === 'verify_otp' && (
                  <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1">
                        Student Email
                      </label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-xs text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={recoveryOtp}
                        onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full px-4 py-2.5 rounded-xl border border-purple-300 bg-purple-50/40 text-[#000048] text-center text-lg font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                        required
                      />
                      <p className="text-[11px] text-neutral-500 mt-1 text-center">
                        Check your inbox for the 6-digit code sent by Vixora Academy.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-xs text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-xs text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryErrorMessage(null);
                          setAuthMode('login');
                        }}
                        className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={recoveryLoading}
                        className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {recoveryLoading ? (
                          <>
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Set New Password
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleRequestPasswordReset}
                        disabled={forgotCooldown > 0}
                        className="text-xs text-[#7000F8] hover:text-[#000048] underline decoration-purple-300 cursor-pointer disabled:opacity-50"
                      >
                        {forgotCooldown > 0 ? `Resend code in ${forgotCooldown}s` : 'Did not receive code? Resend email'}
                      </button>
                    </div>
                  </form>
                )}

                {/* MODE 4: DIRECT RECOVERY (FROM EMAIL LINK) */}
                {authMode === 'recovery_direct' && (
                  <form onSubmit={handleDirectPasswordReset} className="space-y-4">
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-[#000048] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#7000F8] shrink-0" />
                      <span>Your identity has been verified. Please choose a new password for your Vixora student account.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-3.5 pr-10 py-3 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {recoveryLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Save New Password & Launch</span>
                    </button>
                  </form>
                )}

                {/* MODE 5: RESET SUCCESS CARD */}
                {authMode === 'reset_success' && (
                  <div className="text-center py-4 space-y-5">
                    <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                      <Check className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#000048] mb-1">Password Successfully Updated</h3>
                      <p className="text-xs text-neutral-500">
                        You can now sign in to your Vixora Academy student account with your new credentials.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setRecoveryErrorMessage(null);
                        setRecoverySuccessMessage(null);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] text-white font-bold text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
                    >
                      Sign In Now
                    </button>
                  </div>
                )}

                {/* Onboarding Credentials Guidance for Real Students */}
                <div className="mt-6 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-[#5F6078] space-y-1">
                  <div className="font-bold text-[#000048] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#7000F8]" />
                    <span>How do students get login details?</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Upon admission, students receive an official welcome email containing their Student ID and a secure link to set their permanent password. If you ever need to create or reset your password, enter your registered email above to receive a 6-digit code or reset link.
                  </p>
                </div>

              </div>
            ) : (
              /* Authenticated Student Dashboard */
              <div className="space-y-8">
                {/* Student Profile Overview Card */}
                <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#000048] to-[#7000F8] text-white flex items-center justify-center font-bold text-2xl shadow-md">
                      {currentStudent?.name.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-[#000048]">{currentStudent?.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#480878] uppercase tracking-wider">
                          {currentStudent?.role || 'Student'}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        Student ID: <span className="font-mono font-bold text-[#000048]">{currentStudent?.id}</span> • Member since {currentStudent?.enrolledDate}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono mt-0.5">
                        {currentStudent?.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('certificates')}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#000048] hover:bg-[#480878] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>View My Certificates ({studentCertificates.length})</span>
                    </button>
                  </div>
                </div>

                {/* Student Overview Summary (Grid Layout with Cards) */}
                <div id="student-overview-section" className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-[#000048] flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[#7000F8]" />
                        <span>Student Overview</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Real-time academic progression, active coursework, and verified credentials
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full w-fit">
                      Current Academic Cohort
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {/* Card 1: Courses Completed */}
                    <div 
                      id="metric-courses-completed"
                      className="p-5 rounded-2xl bg-[#FCFCFF] border border-neutral-200/80 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Completed
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-3xl sm:text-4xl font-black text-[#000048] tracking-tight">
                          {coursesCompletedCount}
                        </div>
                        <div className="text-sm font-bold text-[#000048] mt-1">
                          Courses Completed
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          100% curriculum fulfilled
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Active Enrollments */}
                    <div 
                      id="metric-active-enrollments"
                      className="p-5 rounded-2xl bg-[#FCFCFF] border border-neutral-200/80 hover:border-blue-200 hover:bg-blue-50/10 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          In Progress
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-3xl sm:text-4xl font-black text-[#000048] tracking-tight">
                          {activeEnrollmentsCount}
                        </div>
                        <div className="text-sm font-bold text-[#000048] mt-1">
                          Active Enrollments
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Ongoing cohort coursework
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Certificates Earned */}
                    <div 
                      id="metric-certificates-earned"
                      onClick={() => setActiveTab('certificates')}
                      className="p-5 rounded-2xl bg-[#FCFCFF] border border-neutral-200/80 hover:border-purple-300 hover:bg-purple-50/20 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-[#7000F8] flex items-center justify-center">
                          <Award className="w-5 h-5 text-[#7000F8]" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7000F8] border border-purple-100 group-hover:bg-[#7000F8] group-hover:text-white transition-colors">
                          Verified
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-3xl sm:text-4xl font-black text-[#000048] tracking-tight flex items-baseline justify-between">
                          <span>{certificatesEarnedCount}</span>
                          <span className="text-xs font-semibold text-[#7000F8] group-hover:underline">View &rarr;</span>
                        </div>
                        <div className="text-sm font-bold text-[#000048] mt-1">
                          Certificates Earned
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Cryptographically validated
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses & Progress Section */}
                <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8">
                  <h3 className="text-lg font-black text-[#000048] mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#7000F8]" />
                    <span>My Enrolled Academic Programs</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStudent?.courses.map((course, idx) => (
                      <div 
                        key={idx}
                        className="p-5 rounded-2xl border border-neutral-200 hover:border-purple-300 bg-[#FCFCFF] hover:bg-purple-50/20 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-[#480878]">
                              {course.badge}
                            </span>
                            <span className={`text-xs font-bold inline-flex items-center gap-1 ${
                              course.status === 'completed' ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              {course.status === 'completed' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Completed</span>
                                </>
                              ) : (
                                'In Progress'
                              )}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-[#000048]">{course.title}</h4>
                          <p className="text-xs text-neutral-500 mt-1">
                            Instructor: {course.instructor} • Cohort: {course.cohort}
                          </p>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span>Curriculum Progress</span>
                              <span className="text-[#7000F8]">{course.progressPercent}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-neutral-200 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-[#480878] to-[#7000F8]"
                                style={{ width: `${course.progressPercent}%` }}
                              />
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-1">
                              {course.completedModules} of {course.totalModules} production modules fulfilled
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-neutral-200/70 flex items-center justify-between">
                          {course.certificateId ? (
                            <button
                              onClick={() => {
                                const cert = studentCertificates.find(c => c.id === course.certificateId);
                                if (cert) {
                                  setSelectedCertificate(cert);
                                  setActiveTab('certificates');
                                }
                              }}
                              className="text-xs font-bold text-[#7000F8] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Official Certificate &rarr;</span>
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-400">
                              Certificate awarded upon capstone completion
                            </span>
                          )}

                          {onNavigateToCourse && (
                            <button
                              onClick={() => onNavigateToCourse(course.courseId)}
                              className="text-xs font-semibold text-neutral-600 hover:text-[#000048] flex items-center gap-1 cursor-pointer"
                            >
                              <span>Course Portal</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificates Earned Preview */}
                {studentCertificates.length > 0 && (
                  <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-[#000048] flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>Earned Professional Credentials</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('certificates')}
                        className="text-xs font-bold text-[#7000F8] hover:underline cursor-pointer"
                      >
                        Inspect Full Credentials &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentCertificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-5 rounded-2xl border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/40 hover:border-purple-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-purple-100 text-[#480878]">
                                {cert.id}
                              </span>
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Active & Verified
                              </span>
                            </div>
                            <div className="text-base font-extrabold text-[#000048]">{cert.courseTitle}</div>
                            <div className="text-xs text-neutral-500 mt-1">Conferred on {cert.issueDate} • {cert.grade}</div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedCertificate(cert);
                                setActiveTab('certificates');
                              }}
                              className="text-xs font-bold text-[#7000F8] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Document</span>
                            </button>

                            <a
                              href={`/api/certificates/${cert.id}/pdf`}
                              download={`Vixora-Academy-Certificate-${cert.id}.pdf`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
                              title="Download official PDF certificate"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download PDF</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: CERTIFICATE PORTAL & VIEWER                  */}
        {/* ==================================================== */}
        {activeTab === 'certificates' && (
          <div>
            {/* Certificate Selector Strip */}
            <div className="mb-6 bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Select Graduate Certificate:
                </span>
                <div className="flex flex-wrap gap-2">
                  {studentCertificates.length > 0 ? (
                    studentCertificates.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCertificate(c)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedCertificate?.id === c.id
                            ? 'bg-[#000048] text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-purple-100'
                        }`}
                      >
                        {c.studentName.split(' ')[0]} ({c.id})
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-500 italic">
                      No issued certificates found for your account.
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('verify')}
                className="text-xs font-bold text-[#7000F8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Another Credential ID</span>
              </button>
            </div>

            {selectedCertificate ? (
              <CertificateDocument
                certificate={selectedCertificate}
                onSendEmail={handleSendCertificateEmail}
                isSendingEmail={isSendingEmail}
              />
            ) : (
              <div className="p-12 text-center text-neutral-500">
                No certificate selected.
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: CREDENTIAL VERIFICATION GATEWAY               */}
        {/* ==================================================== */}
        {activeTab === 'verify' && (
          <CertificateVerificationWidget
            onViewCertificate={(cert) => {
              setSelectedCertificate(cert);
              setActiveTab('certificates');
            }}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 4: ISSUE & AUTO-EMAIL CERTIFICATES (ADMIN/INSTRUCTOR) */}
        {/* ==================================================== */}
        {activeTab === 'issue' && (
          <IssueCertificatePanel
            onCertificateIssued={(newCert) => {
              setSelectedCertificate(newCert);
              setStudentCertificates(prev => [newCert, ...prev]);
            }}
          />
        )}

      </div>
    </div>
  );
};
