"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle, Shield, EyeOff, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Suspense } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/admin";
  // Only allow internal /admin paths as redirect target
  const redirect =
    rawRedirect.startsWith("/admin") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // If already authenticated as admin, redirect immediately
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          router.replace(redirect);
          return;
        }
        // Logged in but not admin — show an error, don't redirect
        setError(
          "Your account does not have administrator privileges. Contact the platform owner."
        );
      }

      setCheckingSession(false);
    };

    checkUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verify admin role before proceeding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Authentication failed — no session returned.");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        // Sign them back out — wrong account type
        await supabase.auth.signOut();
        setError(
          "This account does not have administrator privileges. Use the regular sign-in page to access your dashboard."
        );
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div
        className="bg-card/95 p-8 rounded-xl border border-white/10 w-full animate-pulse space-y-5 min-h-[340px] flex flex-col justify-center"
        style={{ boxShadow: "inset 0 1px 0px 0 rgba(255,255,255,0.12)" }}
        aria-busy="true"
        aria-label="Verifying admin session"
      >
        <div className="h-7 w-40 bg-white/10 rounded-md mx-auto" />
        <div className="h-4 w-56 bg-white/5 rounded-md mx-auto" />
        <div className="space-y-3">
          <div className="h-10 bg-background rounded-lg border border-white/10" />
          <div className="h-10 bg-background rounded-lg border border-white/10" />
        </div>
        <div className="h-11 bg-white/10 rounded-lg" />
      </div>
    );
  }

  return (
    <div
      className="bg-card/95 p-8 rounded-xl border border-white/10"
      style={{ boxShadow: "inset 0 1px 0px 0 rgba(255,255,255,0.12)" }}
    >
      {/* Header */}
      <div className="text-center mb-7">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Shield className="size-5 text-amber-400" />
          </div>
          <Image
            src="/ARC.webp"
            alt="ARC.BD"
            width={28}
            height={28}
            className="size-7 object-contain rounded-md opacity-80"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1.5 tracking-tight">
          Admin Access
        </h1>
        <p className="text-slate-400 text-sm">
          Restricted to platform administrators only
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mb-5 p-3 bg-destructive/10 rounded-lg flex items-start gap-2.5 text-destructive text-xs border border-destructive/20"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-1">
          <label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@arc.bd"
              className="w-full bg-background border border-white/10 hover:border-white/20 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="admin-password" className="text-xs font-semibold text-slate-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-white/10 hover:border-white/20 rounded-lg py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-500"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.985] text-black font-semibold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Shield className="h-4 w-4" />
          <span>Sign In to Admin Panel</span>
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-slate-500">
        Regular user?{" "}
        <a
          href="/login"
          className="text-slate-400 hover:text-white transition-colors underline underline-offset-2"
        >
          Go to sign in
        </a>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 selection:bg-amber-500/20 selection:text-amber-300">
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-sm relative">
        <Suspense
          fallback={
            <div
              className="bg-card/95 p-8 rounded-xl border border-white/10 w-full animate-pulse space-y-5 min-h-[340px]"
              style={{ boxShadow: "inset 0 1px 0px 0 rgba(255,255,255,0.12)" }}
            />
          }
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
