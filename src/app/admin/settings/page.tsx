"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Save,
  CheckCircle2,
  Settings,
  ShieldAlert,
  Server,
  RefreshCw,
  Sliders,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function AdminSettings() {
  const [maxSubdomains, setMaxSubdomains] = useState<number>(5);
  const [minLength, setMinLength] = useState<number>(3);
  const [maxLength, setMaxLength] = useState<number>(63);
  const [maintenance, setMaintenance] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSettings = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsRefreshing(true);
      setError(null);

      const res = await fetch("/api/admin/settings");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to load settings (${res.status})`);
      }

      if (Array.isArray(data)) {
        data.forEach((setting: { key: string; value: any }) => {
          let val = setting.value;
          if (typeof val === "string") {
            try {
              val = JSON.parse(val);
            } catch {
              // keep as string
            }
          }
          if (setting.key === "max_subdomains_per_user") setMaxSubdomains(Number(val));
          if (setting.key === "min_name_length") setMinLength(Number(val));
          if (setting.key === "max_name_length") setMaxLength(Number(val));
          if (setting.key === "maintenance_mode") setMaintenance(Boolean(val));
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load platform settings");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings(false);
  }, [fetchSettings]);

  // Auto-dismiss success alert
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const results = await Promise.all([
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "max_subdomains_per_user", value: maxSubdomains }),
        }),
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "min_name_length", value: minLength }),
        }),
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "max_name_length", value: maxLength }),
        }),
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "maintenance_mode", value: maintenance }),
        }),
      ]);

      const hasError = results.some((r) => !r.ok);
      if (hasError) {
        throw new Error("One or more settings failed to persist");
      }

      setSuccessMsg("System settings updated successfully.");
      fetchSettings(true);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-72 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Compact Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="size-4.5 text-primary" />
              System Settings
            </h1>
            <Badge
              variant="outline"
              className="px-2 py-0.5 border-border bg-muted/50 text-foreground text-[10px] font-medium"
            >
              Configuration
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure global quotas, syntax limits, and authoritative DNS parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchSettings(false)}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="h-7 text-xs gap-1.5"
            aria-label="Reload settings"
          >
            <RefreshCw className={`size-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="h-7 text-xs gap-1.5 font-medium px-3"
          >
            {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-xs font-semibold">Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="py-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-4" />
          <AlertTitle className="text-xs font-semibold">Success</AlertTitle>
          <AlertDescription className="text-xs">{successMsg}</AlertDescription>
        </Alert>
      )}

      {maintenance && (
        <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-300 py-2">
          <ShieldAlert className="size-4 text-amber-400" />
          <AlertTitle className="text-xs font-semibold">Maintenance Mode Active</AlertTitle>
          <AlertDescription className="text-[11px] text-amber-300/80">
            Public subdomain claims and DNS edits are currently paused for regular users.
          </AlertDescription>
        </Alert>
      )}

      {/* 2. Cohesive 2-Column Distilled Layout */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Limits & Maintenance */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2.5 border-b border-border/60">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Sliders className="size-3.5 text-primary" />
                Quota Limits &amp; Domain Validation
              </CardTitle>
              <CardDescription className="text-[11px]">
                Global constraints enforced across all new subdomain claims.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3 text-xs">
              {/* Max Subdomains */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label htmlFor="max-subdomains" className="font-medium text-foreground text-xs">
                    Max Subdomains Per User
                  </label>
                  <p className="text-muted-foreground text-[11px]">
                    Maximum claims per account
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Input
                    id="max-subdomains"
                    type="number"
                    min={1}
                    max={100}
                    value={maxSubdomains}
                    onChange={(e) => setMaxSubdomains(parseInt(e.target.value, 10) || 1)}
                    className="w-20 text-right font-mono text-xs h-7 bg-background"
                    required
                  />
                  <span className="text-muted-foreground text-[11px]">domains</span>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Min Length */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label htmlFor="min-length" className="font-medium text-foreground text-xs">
                    Minimum Subdomain Length
                  </label>
                  <p className="text-muted-foreground text-[11px]">
                    Minimum characters (e.g. 3 chars prevents hoarding)
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Input
                    id="min-length"
                    type="number"
                    min={1}
                    max={20}
                    value={minLength}
                    onChange={(e) => setMinLength(parseInt(e.target.value, 10) || 1)}
                    className="w-20 text-right font-mono text-xs h-7 bg-background"
                    required
                  />
                  <span className="text-muted-foreground text-[11px]">chars</span>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Max Length */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label htmlFor="max-length" className="font-medium text-foreground text-xs">
                    Maximum Subdomain Length
                  </label>
                  <p className="text-muted-foreground text-[11px]">
                    RFC 1035 limits single labels to 63 chars
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Input
                    id="max-length"
                    type="number"
                    min={10}
                    max={63}
                    value={maxLength}
                    onChange={(e) => setMaxLength(parseInt(e.target.value, 10) || 63)}
                    className="w-20 text-right font-mono text-xs h-7 bg-background"
                    required
                  />
                  <span className="text-muted-foreground text-[11px]">chars</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode Card */}
          <Card className="border-border bg-card">
            <CardContent className="p-3.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                    <ShieldAlert className="size-3.5 text-amber-400" />
                    Maintenance Mode
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Temporarily pause public registration and DNS editing
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge
                    variant="outline"
                    className={`font-mono text-[9px] px-1.5 py-0 ${
                      maintenance
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {maintenance ? "MAINTENANCE" : "ACTIVE"}
                  </Badge>
                  <Switch
                    id="maintenance-switch"
                    checked={maintenance}
                    onCheckedChange={setMaintenance}
                    aria-label="Toggle maintenance mode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Authoritative Infrastructure Info */}
        <div className="space-y-4">
          <Card className="border-border bg-card/60 h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-2.5 border-b border-border/60">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Server className="size-3 text-primary" />
                  Authoritative DNS Runtime
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Zone:</span>
                  <span className="font-bold text-foreground">arc.bd.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Nameservers:</span>
                  <span className="font-bold text-foreground">ns1 &amp; ns2.arc.bd</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Default TTL:</span>
                  <span className="font-bold text-foreground">300s</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">PDNS REST API:</span>
                  <span className="font-bold text-emerald-400 truncate max-w-[130px]" title="http://arc-powerdns:8081">
                    :8081
                  </span>
                </div>
              </CardContent>
            </div>

            <div className="p-3 border-t border-border bg-card/30">
              <Button
                type="submit"
                disabled={saving}
                className="w-full text-xs h-8 gap-1.5 font-medium"
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Save All Settings
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
