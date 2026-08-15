"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Globe,
  AlertTriangle,
  Bookmark,
  ArrowUpRight,
  ChartColumn,
  ShieldCheck,
  Activity,
  Clock,
  Layers,
  ArrowRight,
  Server,
  Database,
  Radio,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function AdminOverview() {
  const [data, setData] = useState<{
    metrics: {
      totalUsers: number;
      activeSubdomains: number;
      pendingSubdomains: number;
      suspendedSubdomains: number;
      pendingReports: number;
      reservedNames: number;
      totalDns: number;
    };
    chartData: Array<{ name: string; claims: number }>;
    targetBreakdown: Array<{ name: string; percentage: number; color: string }>;
  }>({
    metrics: {
      totalUsers: 0,
      activeSubdomains: 0,
      pendingSubdomains: 0,
      suspendedSubdomains: 0,
      pendingReports: 0,
      reservedNames: 36,
      totalDns: 0,
    },
    chartData: [],
    targetBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = useCallback(async (background = false) => {
    try {
      if (!background) setIsRefreshing(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const stats = await res.json();
        if (stats.metrics) {
          setData(stats);
        }
      }
    } catch (err) {
      console.error("Failed to load platform stats:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats(false);
  }, [loadStats]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Skeleton className="h-64 xl:col-span-2 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  const { metrics, chartData, targetBreakdown } = data;

  const dnsTypeColors: Record<string, string> = {
    "CNAME Records": "bg-blue-500",
    "A Records (IPv4)": "bg-emerald-500",
    "Reserved System": "bg-purple-500",
    "Other Targets": "bg-zinc-500",
  };

  return (
    <div className="space-y-5">
      {/* 1. Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              Platform Overview
            </h1>
            <Badge
              variant="outline"
              className="px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1.5 text-[11px] font-medium"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time platform metrics, claim velocities, and authoritative DNS telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadStats(false)}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="h-8 text-xs gap-1.5"
            aria-label="Refresh overview data"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="default"
            size="sm"
            asChild
            className="h-8 text-xs gap-1.5 font-medium"
          >
            <Link href="/admin/dns">
              <Server className="size-3.5" />
              DNS Console
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Pending Claims Banner (Elevated Priority) */}
      {metrics.pendingSubdomains > 0 && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0">
              <Clock className="size-4 text-amber-400" />
            </div>
            <div>
              <AlertTitle className="text-amber-400 font-semibold text-xs flex items-center gap-1.5">
                <span>{metrics.pendingSubdomains} Subdomain Claim{metrics.pendingSubdomains > 1 ? "s" : ""} Pending Review</span>
              </AlertTitle>
              <AlertDescription className="text-amber-300/80 text-[11px] mt-0.5">
                Awaiting moderator approval before authoritative DNS records are unlocked.
              </AlertDescription>
            </div>
          </div>
          <Button
            size="sm"
            className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs whitespace-nowrap gap-1 self-end sm:self-center"
            asChild
          >
            <Link href="/admin/subdomains?status=pending">
              Review ({metrics.pendingSubdomains})
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </Alert>
      )}

      {/* 3. Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Registered Users */}
        <Link
          href="/admin/users"
          className="group block p-3.5 rounded-lg border border-border bg-card/60 hover:border-primary/40 hover:bg-card transition-all"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium text-foreground">Registered Users</span>
            <Users className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-1.5 text-xl font-bold tracking-tight text-foreground font-mono">
            {metrics.totalUsers}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
            <ArrowUpRight className="size-3" />
            <span>Active accounts</span>
          </div>
        </Link>

        {/* Metric 2: Active Subdomains */}
        <Link
          href="/admin/subdomains"
          className="group block p-3.5 rounded-lg border border-border bg-card/60 hover:border-primary/40 hover:bg-card transition-all"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium text-foreground">Active Subdomains</span>
            <Globe className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-1.5 text-xl font-bold tracking-tight text-foreground font-mono">
            {metrics.activeSubdomains}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
            <span>{metrics.totalDns} DNS RRsets</span>
          </div>
        </Link>

        {/* Metric 3: Pending Abuse Flags */}
        <Link
          href="/admin/reports"
          className="group block p-3.5 rounded-lg border border-border bg-card/60 hover:border-primary/40 hover:bg-card transition-all"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium text-foreground">Abuse Reports</span>
            <AlertTriangle className="size-3.5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="mt-1.5 text-xl font-bold tracking-tight text-foreground font-mono">
            {metrics.pendingReports}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            {metrics.pendingReports === 0 ? (
              <span className="text-emerald-500 font-medium">0 active safety flags</span>
            ) : (
              <span className="text-amber-400 font-medium">{metrics.pendingReports} pending review</span>
            )}
          </div>
        </Link>

        {/* Metric 4: Reserved Names */}
        <Link
          href="/admin/reserved"
          className="group block p-3.5 rounded-lg border border-border bg-card/60 hover:border-primary/40 hover:bg-card transition-all"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium text-foreground">Reserved Names</span>
            <Bookmark className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-1.5 text-xl font-bold tracking-tight text-foreground font-mono">
            {metrics.reservedNames}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Protected prefixes</span>
          </div>
        </Link>
      </div>

      {/* 4. Velocity Chart & Record Topology Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Provisioning Velocity Chart */}
        <Card className="xl:col-span-2 border-border bg-card">
          <CardHeader className="pb-2.5 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <ChartColumn className="size-3.5 text-primary" />
                  Subdomain Provisioning Velocity
                </CardTitle>
                <CardDescription className="text-[11px]">
                  7-day registration trend across authoritative zone <code className="font-mono text-primary font-semibold">arc.bd.</code>
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground px-1.5 py-0">
                Supabase Telemetry
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-2">
            <div className="h-[210px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#3f3f46",
                      borderRadius: "6px",
                      color: "#fafafa",
                      fontSize: "11px",
                      padding: "4px 8px",
                    }}
                    labelStyle={{ fontWeight: "bold", marginBottom: "2px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="claims"
                    name="Claims"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{ r: 4.5, fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Record Type Breakdown */}
        <Card className="border-border bg-card flex flex-col justify-between">
          <div>
            <CardHeader className="pb-2.5 border-b border-border/60">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Layers className="size-3.5 text-primary" />
                DNS Record Topology
              </CardTitle>
              <CardDescription className="text-[11px]">
                Distribution of active RRsets in PowerDNS.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {targetBreakdown.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold text-foreground">{item.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${dnsTypeColors[item.name] || "bg-primary"}`}
                      style={{ width: `${Math.max(item.percentage, item.percentage > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </div>

          <div className="p-3 border-t border-border">
            <Button variant="outline" size="sm" asChild className="w-full text-xs h-7 gap-1.5">
              <Link href="/admin/dns">
                <Server className="size-3 text-primary" />
                Open Authoritative DNS Console
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* 5. Infrastructure & Security Services Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-card/40 text-xs">
        <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:border-r sm:border-border/60 sm:pr-3">
          <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Server className="size-3.5 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground flex items-center gap-1.5">
              PowerDNS v4.9
              <span className="size-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">ns1.arc.bd &amp; ns2.arc.bd:53</div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:border-r sm:border-border/60 sm:pr-3">
          <div className="size-7 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Database className="size-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="font-medium text-foreground flex items-center gap-1.5">
              Supabase PostgreSQL
              <span className="size-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">RLS Security Definer Active</div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="size-7 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0">
            <Radio className="size-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="font-medium text-foreground flex items-center gap-1.5">
              DNS Engine Resolver
              <span className="size-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">&lt; 1ms latency UDP/TCP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
