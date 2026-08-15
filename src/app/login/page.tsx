"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, Sparkles, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/dashboard/domains";
  const redirect = (rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")) ? rawRedirect : "/dashboard/domains";
  const claimName = searchParams.get("claim");

  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (claimName) {
          try {
            await fetch("/api/subdomains/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: claimName }),
            });
          } catch (e) {
            console.error("Auto-claim error:", e);
          }
        }
        router.push(redirect);
        router.refresh();
      } else {
        setCheckingSession(false);
      }
    };
    checkUser();
  }, [supabase, router, claimName, redirect]);

  const handleClaimAfterAuth = async (): Promise<{ success: boolean; error?: string }> => {
    if (claimName) {
      try {
        const res = await fetch("/api/subdomains/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: claimName }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { success: false, error: data.error || "Failed to auto-claim subdomain" };
        }
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message || "Network error during claim" };
      }
    }
    return { success: true };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isResetPassword) {
        const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://arc.bd";
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/dashboard/settings`,
        });
        if (error) throw error;
        setMessage("Password reset email sent! Please check your inbox for the link.");
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const claimResult = await handleClaimAfterAuth();
        const targetUrl = claimResult.success
          ? redirect
          : `${redirect}?claim_error=${encodeURIComponent(claimResult.error || "Claim error")}`;

        router.push(targetUrl);
        router.refresh();
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;

        if (data.session) {
          const claimResult = await handleClaimAfterAuth();
          const targetUrl = claimResult.success
            ? redirect
            : `${redirect}?claim_error=${encodeURIComponent(claimResult.error || "Claim error")}`;
          router.push(targetUrl);
          router.refresh();
        } else {
          // Immediately log in user without requiring email confirmation if configured
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (loginError) {
            setMessage("Account created! Please check your email to confirm your registration.");
          } else {
            const claimResult = await handleClaimAfterAuth();
            const targetUrl = claimResult.success
              ? redirect
              : `${redirect}?claim_error=${encodeURIComponent(claimResult.error || "Claim error")}`;
            router.push(targetUrl);
            router.refresh();
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    setLoading(true);
    setError(null);
    try {
      const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://arc.bd";
      const callbackUrl = new URL(`${origin}/auth/callback`);
      callbackUrl.searchParams.set("next", redirect);
      if (claimName) callbackUrl.searchParams.set("claim", claimName);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl.toString() },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div
        className="bg-card/95 p-5 sm:p-8 rounded-xl border border-white/10 w-full animate-pulse space-y-5 min-h-[460px] flex flex-col justify-center"
        style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.2)" }}
        aria-busy="true"
        aria-label="Checking active session"
      >
        <div className="text-center space-y-2">
          <div className="h-7 w-48 bg-white/10 rounded-md mx-auto" />
          <div className="h-4 w-64 bg-white/5 rounded-md mx-auto" />
        </div>
        <div className="h-10 bg-background/80 rounded-lg border border-white/10" />
        <div className="space-y-3">
          <div className="h-10 bg-background rounded-lg border border-white/10" />
          <div className="h-10 bg-background rounded-lg border border-white/10" />
        </div>
        <div className="h-11 bg-white/10 rounded-lg" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-10 bg-white/5 rounded-lg border border-white/10" />
          <div className="h-10 bg-white/5 rounded-lg border border-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card/95 p-5 sm:p-8 rounded-xl border border-white/10 transition-colors"
      style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.2)" }}
    >
      {/* First-Timer Claim Banner */}
      {claimName && (
        <div
          className="mb-5 p-3 bg-blue-500/10 rounded-lg flex items-center gap-2.5 text-blue-300 text-xs sm:text-sm animate-fade-in border border-blue-400/20"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-blue-400" />
          <span>
            Sign in or create an account to claim <strong className="font-mono text-white">{claimName}.arc.bd</strong> free!
          </span>
        </div>
      )}

      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 tracking-tight">
          {isResetPassword ? "Reset password" : isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          {isResetPassword
            ? "Enter your email to receive a password reset link"
            : isLogin
            ? "Sign in to manage your .arc.bd subdomains"
            : "Start claiming free subdomains in seconds"}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 p-3 bg-destructive/10 rounded-lg flex items-start gap-2.5 text-destructive text-xs sm:text-sm border border-destructive/20"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mb-5 p-3 bg-blue-500/10 rounded-lg flex items-start gap-2.5 text-blue-300 text-xs sm:text-sm border border-blue-400/20"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Mode Switcher Tabs (Hidden when in password reset) */}
      {!isResetPassword ? (
        <div
          role="tablist"
          aria-label="Authentication modes"
          className="grid grid-cols-2 p-1 bg-white/[0.04] rounded-lg mb-5 border border-white/[0.08]"
        >
          <button
            type="button"
            role="tab"
            id="tab-signin"
            aria-selected={isLogin}
            aria-controls="auth-panel"
            className={`py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
              isLogin
                ? "bg-white/12 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => {
              setIsLogin(true);
              setIsResetPassword(false);
              setError(null);
              setMessage(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            id="tab-signup"
            aria-selected={!isLogin}
            aria-controls="auth-panel"
            className={`py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
              !isLogin
                ? "bg-white/12 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => {
              setIsLogin(false);
              setIsResetPassword(false);
              setError(null);
              setMessage(null);
            }}
          >
            Sign Up
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              setIsResetPassword(false);
              setError(null);
              setMessage(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to sign in</span>
          </button>
        </div>
      )}

      <form id="auth-panel" role="tabpanel" aria-labelledby={isLogin ? "tab-signin" : "tab-signup"} className="space-y-3" onSubmit={handleAuth}>
        {!isLogin && !isResetPassword && (
          <div className="space-y-1">
            <label htmlFor="user-name" className="text-xs font-semibold text-slate-300">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="user-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-background border border-white/10 hover:border-white/20 rounded-lg py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="user-email" className="text-xs font-semibold text-slate-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="user-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-background border border-white/10 hover:border-white/20 rounded-lg py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {!isResetPassword && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="user-password" className="text-xs font-semibold text-slate-300">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPassword(true);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="user-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-white/10 hover:border-white/20 rounded-lg py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.985] text-white font-medium py-2.5 rounded-lg text-xs sm:text-sm transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isResetPassword ? (
            <>
              <KeyRound className="h-4 w-4" />
              <span>Send Reset Link</span>
            </>
          ) : isLogin ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {!isResetPassword && (
        <>
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="text-[11px] font-mono text-slate-400">or continue with</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuth("github")}
              className="w-full py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-lg text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuth("google")}
              className="w-full py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-lg text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-blue-500/20 selection:text-blue-400 overflow-y-auto">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-24 sm:pt-28 pb-12">
        <div className="w-full max-w-md animate-slide-up">
          <Suspense fallback={
            <div
              className="bg-card/95 p-5 sm:p-8 rounded-xl border border-white/10 w-full animate-pulse space-y-5 min-h-[460px] flex flex-col justify-center"
              style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.2)" }}
            >
              <div className="text-center space-y-2">
                <div className="h-7 w-48 bg-white/10 rounded-md mx-auto" />
                <div className="h-4 w-64 bg-white/5 rounded-md mx-auto" />
              </div>
              <div className="h-10 bg-background/80 rounded-lg border border-white/10" />
              <div className="space-y-3">
                <div className="h-10 bg-background rounded-lg border border-white/10" />
                <div className="h-10 bg-background rounded-lg border border-white/10" />
              </div>
              <div className="h-11 bg-white/10 rounded-lg" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-10 bg-white/5 rounded-lg border border-white/10" />
                <div className="h-10 bg-white/5 rounded-lg border border-white/10" />
              </div>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}


