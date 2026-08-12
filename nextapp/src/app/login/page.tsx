"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-white/10 text-center text-slate-400 flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        <span>Checking session...</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-2xl border border-white/10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-slate-400">
          {isLogin
            ? "Sign in to manage your .arc.bd subdomains"
            : "Start claiming free subdomains in seconds"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex p-1 bg-slate-900/50 rounded-xl mb-6 border border-white/5">
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            isLogin
              ? "bg-white/10 text-white shadow-sm"
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
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            !isLogin
              ? "bg-white/10 text-white shadow-sm"
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

      <form className="space-y-4" onSubmit={handleAuth}>
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold transition-all mt-6 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div className="mt-6 flex items-center">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="mx-4 text-sm text-slate-500">or continue with</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => handleOAuth("github")}
        className="w-full mt-6 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 text-white py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        GitHub
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <Suspense fallback={
            <div className="glass-card p-8 rounded-2xl border border-white/10 text-center text-slate-400">
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


