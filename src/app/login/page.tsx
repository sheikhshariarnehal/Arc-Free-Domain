"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, Sparkles, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const claimName = searchParams.get("claim");

  const [isLogin, setIsLogin] = useState(true);
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
            console.error(e);
          }
        }
        router.push("/dashboard/domains");
        router.refresh();
      } else {
        setCheckingSession(false);
      }
    };
    checkUser();
  }, [supabase, router, claimName]);

  const handleClaimAfterAuth = async () => {
    if (claimName) {
      try {
        await fetch("/api/subdomains/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: claimName }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await handleClaimAfterAuth();
        router.push("/dashboard/domains");
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
          await handleClaimAfterAuth();
          router.push("/dashboard/domains");
          router.refresh();
        } else {
          // Immediately log in user without requiring email confirmation
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (loginError) throw loginError;
          await handleClaimAfterAuth();
          router.push("/dashboard/domains");
          router.refresh();
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
      // Build callback URL — include `claim` so the server-side callback
      // can auto-claim the domain immediately after OAuth completes.
      const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
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
        className="bg-card/95 p-8 rounded-xl text-center text-slate-300 flex items-center justify-center gap-3 border border-white/10"
        style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.2)" }}
      >
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        <span className="font-mono text-sm">Checking session...</span>
      </div>
    );
  }

  return (
    <div
      className="bg-card/95 p-5 sm:p-8 rounded-xl border border-white/10 backdrop-blur-xl transition-all"
      style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.2)" }}
    >
      {/* First-Timer Claim Banner */}
      {claimName && (
        <div
          className="mb-6 p-3.5 bg-blue-500/15 rounded-lg flex items-center gap-3 text-blue-400 text-sm animate-fade-in border border-blue-400/20"
          style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.2)" }}
        >
          <Sparkles className="h-4.5 w-4.5 shrink-0 text-blue-400" />
          <span>
            Sign in or create an account to claim <strong className="font-mono text-white">{claimName}.arc.bd</strong> free!
          </span>
        </div>
      )}

      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm font-medium">
          {isLogin
            ? "Sign in to manage your .arc.bd subdomains"
            : "Start claiming free subdomains in seconds"}
        </p>
      </div>

      {error && (
        <div
          className="mb-6 p-3.5 bg-destructive/15 rounded-lg flex items-start gap-3 text-destructive-foreground text-xs sm:text-sm border border-destructive/20"
          style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.2)" }}
        >
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div
          className="mb-6 p-3.5 bg-blue-500/15 rounded-lg flex items-start gap-3 text-blue-300 text-xs sm:text-sm border border-blue-400/20"
          style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.2)" }}
        >
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5 text-blue-400" />
          <span>{message}</span>
        </div>
      )}

      <div
        className="flex p-1 bg-background rounded-lg mb-5 border border-white/10"
        style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.15)" }}
      >
        <button
          type="button"
          className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
            isLogin
              ? "bg-white/12 text-white shadow-sm border border-white/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => {
            setIsLogin(true);
            setError(null);
            setMessage(null);
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
            !isLogin
              ? "bg-white/12 text-white shadow-sm border border-white/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => {
            setIsLogin(false);
            setError(null);
            setMessage(null);
          }}
        >
          Sign Up
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleAuth}>
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
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
          <label className="text-xs font-semibold text-slate-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-background border border-white/10 hover:border-white/20 rounded-lg py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-white/10 hover:border-white/20 rounded-lg py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full skeuo-button skeuo-button-primary py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all mt-4 active:scale-[0.98] flex items-center justify-center gap-2 text-white border-none cursor-pointer"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div className="mt-5 flex items-center">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="mx-4 text-xs font-mono text-slate-400">or continue with</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleOAuth("github")}
          className="skeuo-button skeuo-button-rect skeuo-button-surface w-full py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-white cursor-pointer disabled:opacity-50"
        >
          <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>GitHub</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleOAuth("google")}
          className="skeuo-button skeuo-button-rect skeuo-button-surface w-full py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-white cursor-pointer disabled:opacity-50"
        >
          <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google</span>
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-blue-500/20 selection:text-blue-400 overflow-y-auto">
      <Navbar />

      <div className="flex-1 flex items-start sm:items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-slide-up">
          <Suspense fallback={
            <div
              className="bg-card/95 p-6 rounded-xl text-center text-slate-400 border border-white/10"
              style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.25)" }}
            >
              Loading login form...
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
