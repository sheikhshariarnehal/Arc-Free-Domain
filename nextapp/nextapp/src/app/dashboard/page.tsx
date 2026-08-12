"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Plus,
  Activity,
  Loader2,
  ArrowUpRight,
  ChartColumn,
  ExternalLink,
  Clock,
  Search,
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
      return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Active</Badge>;
    case "pending":
      return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">Pending</Badge>;
    case "suspended":
      return <Badge variant="destructive">Suspended</Badge>;
    default:
      return <Badge variant="outline" className="capitalize">{status}</Badge>;
  }
}

export default function DashboardOverview() {
  const [subdomains, setSubdomains] = useState<SubdomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/subdomains")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setSubdomains(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount = subdomains.filter((s) => s.status === "active").length;
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
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's an overview of your ARC.BD subdomains.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/domains">
            <Plus className="size-4 mr-1.5" /> Claim New Domain
          </Link>
        </Button>
      </div>

      {/* Metric Banner — matching admin grid style */}
      <div className="bg-card grid grid-cols-2 gap-3 rounded-xl border border-border p-4 sm:gap-4 sm:p-5 lg:grid-cols-4 lg:gap-6 lg:p-6 shadow-sm">
        {/* 1 */}
        <div className="flex items-start">
          <div className="flex-1 space-y-1 sm:space-y-2 lg:space-y-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="size-3.5 sm:size-4" />
              <span className="text-[10px] font-medium sm:text-xs lg:text-sm truncate">Subdomains Used</span>
            </div>
            <p className="text-muted-foreground/70 hidden text-[10px] sm:block sm:text-xs">{MAX_SUBDOMAINS} max allowed</p>
            <p className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl lg:text-[28px] text-foreground">
              {usedSlots} <span className="text-sm font-normal text-muted-foreground">/ {MAX_SUBDOMAINS}</span>
            </p>
            <Progress value={usagePercent} className="h-1.5 mt-1" />
          </div>
          <div className="bg-border mx-4 hidden h-full w-px lg:block xl:mx-6" />
        </div>

        {/* 2 */}
        <div className="flex items-start">
          <div className="flex-1 space-y-1 sm:space-y-2 lg:space-y-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="size-3.5 sm:size-4" />
              <span className="text-[10px] font-medium sm:text-xs lg:text-sm truncate">Active Subdomains</span>
            </div>
            <p className="text-muted-foreground/70 hidden text-[10px] sm:block sm:text-xs">Live Cloudflare DNS</p>
            <p className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl lg:text-[28px] text-foreground">
              {activeCount}
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="text-emerald-400 font-semibold">Operational</span>
            </div>
          </div>
          <div className="bg-border mx-4 hidden h-full w-px lg:block xl:mx-6" />
        </div>

        {/* 3 */}
        <div className="flex items-start">
          <div className="flex-1 space-y-1 sm:space-y-2 lg:space-y-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ChartColumn className="size-3.5 sm:size-4" />
              <span className="text-[10px] font-medium sm:text-xs lg:text-sm truncate">DNS Records</span>
            </div>
            <p className="text-muted-foreground/70 hidden text-[10px] sm:block sm:text-xs">Across all subdomains</p>
            <p className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl lg:text-[28px] text-foreground">
              {subdomains.reduce((acc, s) => acc + (s.dns_records?.length || 0), 0)}
            </p>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] sm:text-xs">
              <ArrowUpRight className="size-3 shrink-0 text-emerald-500 sm:size-3.5" />
              <span className="text-emerald-500 font-semibold whitespace-nowrap">A &amp; CNAME</span>
              <span className="text-muted-foreground whitespace-nowrap">records active</span>
            </div>
          </div>
          <div className="bg-border mx-4 hidden h-full w-px lg:block xl:mx-6" />
        </div>

        {/* 4 */}
        <div className="flex items-start">
          <div className="flex-1 space-y-1 sm:space-y-2 lg:space-y-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5 sm:size-4" />
              <span className="text-[10px] font-medium sm:text-xs lg:text-sm truncate">Slots Available</span>
            </div>
            <p className="text-muted-foreground/70 hidden text-[10px] sm:block sm:text-xs">Free to claim</p>
            <p className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl lg:text-[28px] text-foreground">
              {MAX_SUBDOMAINS - usedSlots}
            </p>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] sm:text-xs">
              <span className="text-muted-foreground whitespace-nowrap">remaining free slots</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts + Recent */}
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Activity Chart */}
        <div className="bg-card flex min-w-0 flex-1 flex-col rounded-xl border border-border shadow-sm">
          <div className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-5">
            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="icon" className="size-7 sm:size-8 border-border">
                <ChartColumn className="size-4 text-muted-foreground" />
              </Button>
              <h2 className="text-sm font-medium sm:text-base text-foreground">Domain Activity</h2>
            </div>
            <span className="text-xs text-muted-foreground">This week</span>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-xl font-semibold tracking-tight sm:text-2xl text-foreground">{usedSlots} Total Claims</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">REAL SUPABASE DATA</p>
            <div className="h-[180px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fafafa" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#fafafa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                  <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#fafafa" }} />
                  <Area type="monotone" dataKey="subdomains" stroke="#fafafa" strokeWidth={2} fill="url(#subGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Status Panel */}
        <div className="bg-card flex min-w-0 flex-col rounded-xl border border-border shadow-sm xl:w-[340px]">
          <div className="flex h-14 items-center border-b border-border px-4 sm:px-5">
            <h2 className="text-sm font-medium sm:text-base text-foreground">Platform Status</h2>
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {[
              { label: "Cloudflare DNS API", status: "Operational", color: "text-emerald-400", dot: "bg-emerald-400" },
              { label: "Supabase Database", status: "Operational", color: "text-emerald-400", dot: "bg-emerald-400" },
              { label: "Subdomain Registration", status: "Active", color: "text-emerald-400", dot: "bg-emerald-400" },
              { label: "SSL Certificate", status: "Valid", color: "text-emerald-400", dot: "bg-emerald-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full ${item.dot} animate-pulse`} />
                  <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button variant="outline" className="w-full text-xs" asChild>
                <Link href="/dashboard/domains">
                  <Plus className="size-3.5 mr-1.5" /> Claim New Subdomain
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Subdomains Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Recent Subdomains</CardTitle>
            <CardDescription>Your latest claimed .arc.bd subdomains</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-48 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/domains">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Globe className="size-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">No subdomains yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Claim your first free .arc.bd subdomain to get started.
              </p>
              <Button asChild size="sm" className="mt-1">
                <Link href="/dashboard/domains">
                  <Plus className="size-3.5 mr-1.5" /> Claim Free Subdomain
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.slice(0, 5).map((domain) => (
                <div key={domain.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      <Globe className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{domain.full_domain}</p>
                      <p className="text-xs text-muted-foreground">
                        {domain.dns_records && domain.dns_records.length > 0
                          ? `${domain.dns_records[0].type} → ${domain.dns_records[0].content}`
                          : "No DNS record"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {statusBadge(domain.status)}
                    <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(domain.created_at)}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                      <Link href={`/dashboard/domains/${domain.id}`}>
                        <ExternalLink className="size-3 mr-1" /> Manage
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
