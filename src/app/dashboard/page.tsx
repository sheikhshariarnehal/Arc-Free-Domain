"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Plus,
  Activity,
  ArrowUpRight,
  ChartColumn,
  Clock,
  Search,
  Lock,
  Settings,
  Check,
  Copy,
  ExternalLink,
  BookOpen,
  X,
  Radio,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SubdomainRecord {
  id: string;
  name: string;
  full_domain: string;
  status: "pending" | "active" | "suspended" | "deleted";
  created_at: string;
  dns_records?: Array<{ type: string; content: string }>;
}

const MAX_SUBDOMAINS = 5;

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 font-mono text-xs">
          <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5 inline-block" />
          Active
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 font-mono text-xs">
          <span className="size-1.5 rounded-full bg-amber-400 mr-1.5 inline-block" />
          Pending Review
        </Badge>
      );
    case "suspended":
      return (
        <Badge variant="destructive" className="font-mono text-xs">
          Suspended
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize font-mono text-xs">
          {status}
        </Badge>
      );
  }
}

// Custom Tooltip for Recharts
function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-primary mt-0.5">
          {payload[0].value} subdomain{payload[0].value === 1 ? "" : "s"} claimed
        </p>
      </div>
    );
  }
  return null;
}

export default function DashboardOverview() {
  const [subdomains, setSubdomains] = useState<SubdomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subdomains")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSubdomains(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (fullDomain: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://${fullDomain}`);
    setCopiedDomain(fullDomain);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  const activeCount = subdomains.filter((s) => s.status === "active").length;
  const pendingCount = subdomains.filter((s) => s.status === "pending").length;
  const usedSlots = subdomains.length;
  const usagePercent = Math.min((usedSlots / MAX_SUBDOMAINS) * 100, 100);

  const filtered = subdomains.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.full_domain.toLowerCase().includes(search.toLowerCase())
  );

  // Build weekly chart from real created_at data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  subdomains.forEach((s) => {
    if (s.created_at) {
      const d = dayNames[new Date(s.created_at).getDay()];
      dayMap[d] = (dayMap[d] || 0) + 1;
    }
  });
  const chartData = days.map((d) => ({ day: d, subdomains: dayMap[d] || 0 }));

  if (loading) {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-xl xl:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor your claimed .arc.bd subdomains, DNS routing, and platform health.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" asChild className="text-xs h-9 flex-1 sm:flex-initial whitespace-nowrap">
            <Link href="/docs" className="inline-flex items-center justify-center">
              <BookOpen className="size-3.5 mr-1.5 shrink-0" />
              <span>Documentation</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="text-xs h-9 font-semibold flex-1 sm:flex-initial whitespace-nowrap">
            <Link href="/dashboard/domains?action=claim" className="inline-flex items-center justify-center">
              <Plus className="size-3.5 mr-1.5 shrink-0" />
              <span>Claim Subdomain</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Pending Claims Notice */}
      {pendingCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xs text-amber-300 gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Clock className="size-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">
                  {pendingCount} Domain Claim{pendingCount > 1 ? "s" : ""} Pending Review
                </p>
                <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-mono text-[10px] py-0 h-4">
                  Awaiting Verification
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate sm:whitespace-normal">
                Your domain claims are undergoing anti-abuse verification. DNS controls will unlock immediately upon approval.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-semibold shrink-0"
            asChild
          >
            <Link href="/dashboard/domains">View Pending Domains</Link>
          </Button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Subdomains Quota */}
        <div className="rounded-xl border border-border/80 bg-card/70 backdrop-blur-xs p-5 space-y-3 hover:border-primary/40 transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Subdomains Used
            </span>
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Globe className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">{usedSlots}</span>
              <span className="text-sm font-medium text-muted-foreground font-mono">/ {MAX_SUBDOMAINS}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{MAX_SUBDOMAINS} free slots allocated</p>
          </div>
          <Progress value={usagePercent} className="h-1.5 bg-muted" />
        </div>

        {/* Metric 2: Active Subdomains */}
        <div className="rounded-xl border border-border/80 bg-card/70 backdrop-blur-xs p-5 space-y-3 hover:border-emerald-500/40 transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Active Domains
            </span>
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-foreground font-mono">{activeCount}</span>
            <p className="text-xs text-muted-foreground mt-0.5">Live on Cloudflare Edge</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>Operational</span>
          </div>
        </div>

        {/* Metric 3: DNS Records */}
        <div className="rounded-xl border border-border/80 bg-card/70 backdrop-blur-xs p-5 space-y-3 hover:border-cyan-500/40 transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              DNS Records
            </span>
            <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ChartColumn className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {subdomains.reduce((acc, s) => acc + (s.dns_records?.length || 0), 0)}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">A &amp; CNAME routing rules</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="size-3 text-cyan-400" />
            <span>Instant Edge sync</span>
          </div>
        </div>

        {/* Metric 4: Free Slots Remaining */}
        <div className="rounded-xl border border-border/80 bg-card/70 backdrop-blur-xs p-5 space-y-3 hover:border-amber-500/40 transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Available Slots
            </span>
            <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-foreground font-mono">{MAX_SUBDOMAINS - usedSlots}</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {usedSlots === MAX_SUBDOMAINS ? "Quota limit reached" : "Ready for deployment"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {usedSlots < MAX_SUBDOMAINS ? (
              <Link href="/dashboard/domains?action=claim" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                Claim another <ArrowUpRight className="size-3" />
              </Link>
            ) : (
              <span className="text-amber-400/80 font-mono text-xs">Maximum 5 reached</span>
            )}
          </div>
        </div>
      </div>

      {/* Charts + Platform Status Grid */}
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Activity Chart Card */}
        <div className="bg-card/70 backdrop-blur-xs flex min-w-0 flex-1 flex-col rounded-xl border border-border/80 shadow-xs">
          <div className="flex h-14 items-center justify-between border-b border-border/80 px-4 sm:px-5">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ChartColumn className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Domain Activity</h2>
                <p className="text-[11px] text-muted-foreground">Registrations over the last 7 days</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono bg-secondary/50">
              Live
            </Badge>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">{usedSlots}</p>
                <p className="text-xs text-muted-foreground">Total claimed subdomains</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                Supabase Synced
              </span>
            </div>
            <div className="h-[180px] mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="domainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="subdomains"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#domainGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Platform Status Panel */}
        <div className="bg-card/70 backdrop-blur-xs flex min-w-0 flex-col rounded-xl border border-border/80 shadow-xs xl:w-[360px]">
          <div className="flex h-14 items-center justify-between border-b border-border/80 px-4 sm:px-5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Radio className="size-4 text-emerald-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Infrastructure Status</h2>
            </div>
            <span className="size-2 rounded-full bg-emerald-400" />
          </div>
          <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {[
                { label: "Cloudflare Edge DNS API", status: "Operational", color: "text-emerald-400", dot: "bg-emerald-400" },
                { label: "Supabase PostgreSQL", status: "Operational", color: "text-emerald-400", dot: "bg-emerald-400" },
                { label: "Subdomain Registrar", status: "Active", color: "text-emerald-400", dot: "bg-emerald-400" },
                { label: "Edge SSL Termination", status: "Enabled", color: "text-emerald-400", dot: "bg-emerald-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${item.dot}`} />
                    <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button variant="outline" className="w-full text-xs h-9" asChild>
                <Link href="/subdomain-status">
                  <Activity className="size-3.5 mr-1.5 text-primary" /> View Detailed Status
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Subdomains Table Card */}
      <Card className="border-border/80 bg-card/70 backdrop-blur-xs shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/80 pb-4 gap-3 sm:gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Recent Subdomains</CardTitle>
            <CardDescription>Your claimed .arc.bd subdomains and DNS routing</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter subdomains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-8 h-8 w-full text-xs bg-card/60"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear filter"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs shrink-0" asChild>
              <Link href="/dashboard/domains">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
              <div className="size-12 rounded-xl bg-secondary flex items-center justify-center">
                <Globe className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {subdomains.length === 0 ? "No subdomains claimed yet" : "No matching subdomains"}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  {subdomains.length === 0
                    ? "Claim your free .arc.bd subdomain in seconds and point it to Vercel, GitHub Pages, Netlify, or any VPS."
                    : "Try searching with a different domain keyword."}
                </p>
              </div>
              {subdomains.length === 0 && (
                <Button asChild size="sm" className="mt-2 text-xs font-semibold">
                  <Link href="/dashboard/domains?action=claim">
                    <Plus className="size-3.5 mr-1.5" /> Claim Free Subdomain
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/80">
              {filtered.slice(0, 5).map((domain) => (
                <div
                  key={domain.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-muted/30 transition-colors group gap-2.5 sm:gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Globe className="size-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                          {domain.full_domain}
                        </span>
                        <button
                          onClick={(e) => handleCopy(domain.full_domain, e)}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-1 sm:p-0.5 rounded touch-manipulation shrink-0"
                          title="Copy URL"
                          aria-label={`Copy https://${domain.full_domain}`}
                        >
                          {copiedDomain === domain.full_domain ? (
                            <Check className="size-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                        {domain.dns_records && domain.dns_records.length > 0
                          ? `${domain.dns_records[0].type} → ${domain.dns_records[0].content}`
                          : domain.status === "pending"
                          ? "Pending admin approval"
                          : "No DNS record configured"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 shrink-0 pl-11 sm:pl-0">
                    <div className="flex items-center gap-2">
                      {statusBadge(domain.status)}
                      <span className="text-xs text-muted-foreground hidden md:block">
                        {formatDate(domain.created_at)}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 hover:bg-secondary" asChild>
                      <Link href={`/dashboard/domains/${domain.id}`}>
                        {domain.status === "active" ? (
                          <Settings className="size-3.5 text-muted-foreground" />
                        ) : (
                          <Lock className="size-3.5 text-amber-400" />
                        )}
                        <span>Manage</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
