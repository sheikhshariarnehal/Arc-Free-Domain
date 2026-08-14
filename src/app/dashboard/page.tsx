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
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 font-mono text-[11px]">
          <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse inline-block" />
          Active
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 font-mono text-[11px]">
          <span className="size-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse inline-block" />
          Pending Review
        </Badge>
      );
    case "suspended":
      return (
        <Badge variant="destructive" className="font-mono text-[11px]">
          Suspended
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize font-mono text-[11px]">
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
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
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
    <div className="space-y-6 max-w-6xl mx-auto">
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
          <Button variant="outline" size="sm" asChild className="text-xs h-9">
            <Link href="/docs">
              <BookOpen className="size-3.5 mr-1.5" /> Documentation
            </Link>
          </Button>
          <Button asChild size="sm" className="text-xs h-9 font-semibold">
            <Link href="/dashboard/domains?action=claim">
              <Plus className="size-3.5 mr-1.5" /> Claim Subdomain
            </Link>
          </Button>
        </div>
      </div>

      {/* Pending Claims Notice */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 gap-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <Clock className="size-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-300">
                {pendingCount} Domain Claim{pendingCount > 1 ? "s" : ""} Pending Review
              </p>
              <p className="text-xs text-amber-200/80 mt-0.5 truncate sm:whitespace-normal">
                Your domain claim is being reviewed by administrators. DNS controls will unlock immediately upon approval.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs shrink-0"
            asChild
          >
            <Link href="/dashboard/domains">View Domains</Link>
          </Button>
        </div>
      )}

      {/* Metric Cards Banner */}
      <div className="bg-card grid grid-cols-2 gap-3 rounded-xl border border-border p-4 sm:gap-4 sm:p-5 lg:grid-cols-4 lg:gap-6 lg:p-6 shadow-sm">
        {/* Metric 1: Subdomains Quota */}
        <div className="flex items-start">
          <div className="flex-1 space-y-1 sm:space-y-2 lg:space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="size-3.5 sm:size-4 text-primary" />
              <span className="text-[11px] font-medium sm:text-xs lg:text-sm truncate text-foreground">
                Subdomains Used
              </span>
            </div>
            <p className="text-muted-foreground/70 hidden text-[10px] sm:block sm:text-xs">
              {MAX_SUBDOMAINS} free slots allowed
            </p>
            <p className="text-xl leading-tight font-bold tracking-tight sm:text-2xl lg:text-[28px] text-foreground">
              {usedSlots}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ {MAX_SUBDOMAINS}</span>
            </p>
            <Progress value={usagePercent} className="h-1.5 mt-1" />
          </div>
          <div className="bg-border mx-4 hidden h-full w-px lg:block xl:mx-6" />
        </div>

        {/* Metric 2: Active Subdomains */}
        <div className="flex items-start">
          <div className="flex-1 space-y-1 sm:space-y-2 lg:space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="size-3.5 sm:size-4 text-emerald-400" />
              <span className="text-[11px] font-medium sm:text-xs lg:text-sm truncate text-foreground">
                Active Domains
              </span>
            </div>
            <p className="text-muted-foreground/70 hidden text-[10px] sm:block sm:text-xs">
              Live Edge DNS
            </p>
            <p className="text-xl leading-tight font-bold tracking-tight sm:text-2xl lg:text-[28px] text-foreground">
              {activeCount}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="text-emerald-400 font-semibold">Operational</span>
            </div>
          </div>
          <div className="bg-border mx-4 hidden h-full w-px lg:block xl:mx-6" />
        </div>

        {/* Metric 3: DNS Records */}
        <div className="flex items-start">
          <div className="flex-1 space-y-1 sm:space-y-2 lg:space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ChartColumn className="size-3.5 sm:size-4 text-primary" />
              <span className="text-[11px] font-medium sm:text-xs lg:text-sm truncate text-foreground">
                DNS Records
              </span>
            </div>
            <p className="text-muted-foreground/70 hidden text-[10px] sm:block sm:text-xs">
              Across all subdomains
            </p>
            <p className="text-xl leading-tight font-bold tracking-tight sm:text-2xl lg:text-[28px] text-foreground">
              {subdomains.reduce((acc, s) => acc + (s.dns_records?.length || 0), 0)}
            </p>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] sm:text-xs">
              <span className="text-emerald-400 font-semibold whitespace-nowrap">A &amp; CNAME</span>
              <span className="text-muted-foreground whitespace-nowrap">records synced</span>
            </div>
          </div>
          <div className="bg-border mx-4 hidden h-full w-px lg:block xl:mx-6" />
        </div>

        {/* Metric 4: Free Slots Remaining */}
        <div className="flex items-start">
          <div className="flex-1 space-y-1 sm:space-y-2 lg:space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5 sm:size-4 text-amber-400" />
              <span className="text-[11px] font-medium sm:text-xs lg:text-sm truncate text-foreground">
                Available Slots
              </span>
            </div>
            <p className="text-muted-foreground/70 hidden text-[10px] sm:block sm:text-xs">
              Ready to claim
            </p>
            <p className="text-xl leading-tight font-bold tracking-tight sm:text-2xl lg:text-[28px] text-foreground">
              {MAX_SUBDOMAINS - usedSlots}
            </p>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] sm:text-xs">
              <span className="text-muted-foreground whitespace-nowrap">
                {usedSlots === MAX_SUBDOMAINS ? "Quota limit reached" : "free slots remaining"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts + Platform Status Grid */}
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Activity Chart Card */}
        <div className="bg-card flex min-w-0 flex-1 flex-col rounded-xl border border-border shadow-sm">
          <div className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-5">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-secondary flex items-center justify-center">
                <ChartColumn className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Domain Activity</h2>
                <p className="text-[11px] text-muted-foreground">Registrations over the last 7 days</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
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
        <div className="bg-card flex min-w-0 flex-col rounded-xl border border-border shadow-sm xl:w-[360px]">
          <div className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Radio className="size-4 text-emerald-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Infrastructure Status</h2>
            </div>
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
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
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-4 gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Recent Subdomains</CardTitle>
            <CardDescription>Your claimed .arc.bd subdomains and DNS routing</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter subdomains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-8 h-8 w-full sm:w-56 text-xs"
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
            <div className="divide-y divide-border">
              {filtered.slice(0, 5).map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Globe className="size-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {domain.full_domain}
                        </span>
                        <button
                          onClick={(e) => handleCopy(domain.full_domain, e)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-0.5 rounded"
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

                  <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-3">
                    {statusBadge(domain.status)}
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {formatDate(domain.created_at)}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" asChild>
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
