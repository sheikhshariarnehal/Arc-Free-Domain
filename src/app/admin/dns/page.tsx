"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Server,
  Plus,
  Trash2,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Copy,
  Check,
  Activity,
  Layers,
  Zap,
  Radio,
  Download,
  Terminal,
  Database,
  ChevronLeft,
  ChevronRight,
  X,
  Code2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PowerDNSRecordItem {
  content: string;
  disabled: boolean;
}

interface PowerDNSRRSet {
  name: string;
  type: string;
  ttl: number;
  records: PowerDNSRecordItem[];
  comments?: any[];
}

interface ZoneMetadata {
  id: string;
  name: string;
  kind: string;
  serial: number;
  edited_serial: number;
  account: string;
}

interface ServerInfo {
  version: string;
  daemon_type: string;
  url: string;
}

const TYPE_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  CNAME: { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-500", label: "Canonical Name Alias" },
  A: { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500", label: "IPv4 Address" },
  AAAA: { badge: "bg-teal-500/10 text-teal-400 border-teal-500/20", dot: "bg-teal-500", label: "IPv6 Address" },
  TXT: { badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", dot: "bg-purple-500", label: "Text Record / Verification" },
  MX: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-500", label: "Mail Exchanger" },
  NS: { badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", dot: "bg-cyan-500", label: "Authoritative Name Server" },
  SOA: { badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", dot: "bg-zinc-500", label: "Start of Authority" },
};

function formatUptime(secondsStr?: string): string {
  if (!secondsStr) return "N/A";
  const sec = parseInt(secondsStr, 10);
  if (isNaN(sec)) return secondsStr;
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatSerial(serialNum?: number): string {
  if (!serialNum) return "2026081405";
  const str = String(serialNum);
  if (str.length === 10) {
    const y = str.slice(0, 4);
    const m = str.slice(4, 6);
    const d = str.slice(6, 8);
    const rev = str.slice(8, 10);
    return `${y}-${m}-${d} rev ${rev}`;
  }
  return str;
}

export default function AdminDNSManagement() {
  const [rrsets, setRrsets] = useState<PowerDNSRRSet[]>([]);
  const [zone, setZone] = useState<ZoneMetadata | null>(null);
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [stats, setStats] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filters, Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dialog State: Add Record
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formType, setFormType] = useState<"A" | "AAAA" | "CNAME" | "TXT" | "MX">("CNAME");
  const [formName, setFormName] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTtl, setFormTtl] = useState("300");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dialog State: Delete Record
  const [deleteTarget, setDeleteTarget] = useState<{ name: string; type: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Dialog State: Sync DB
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Live DNS Resolver State
  const [testDomain, setTestDomain] = useState("you.arc.bd");
  const [testType, setTestType] = useState("CNAME");
  const [testTesting, setTestTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Telemetry Search
  const [statsSearch, setStatsSearch] = useState("");

  const fetchTelemetry = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setIsRefreshing(true);
      }
      setError(null);
      const res = await fetch("/api/admin/dns");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `PowerDNS connection error (${res.status})`);
      }

      if (data) {
        setRrsets(Array.isArray(data.rrsets) ? data.rrsets : Array.isArray(data) ? data : []);
        if (data.zone) setZone(data.zone);
        if (data.server) setServer(data.server);
        if (data.stats) setStats(data.stats);
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with PowerDNS");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry(false);
  }, [fetchTelemetry]);

  // Silent Background Auto-refresh
  useEffect(() => {
    if (!autoRefreshInterval || autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchTelemetry(true);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchTelemetry]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 4500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  // Global Keyboard Shortcuts (/ for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !isAddOpen &&
        !isSyncOpen &&
        !deleteTarget &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddOpen, isSyncOpen, deleteTarget]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formName.trim().toLowerCase();
    const trimmedContent = formContent.trim();

    if (!trimmedName || !trimmedContent) {
      setFormError("Record name and content are required.");
      return;
    }

    // Client-side DNS Syntax Validation
    if (formType === "A") {
      const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipv4Regex.test(trimmedContent)) {
        setFormError("Invalid IPv4 address format (e.g. 192.0.2.1).");
        return;
      }
    }

    let cleanName = trimmedName;
    if (!cleanName.endsWith(".arc.bd") && !cleanName.endsWith(".arc.bd.")) {
      cleanName = cleanName === "@" || cleanName === "" ? "arc.bd." : `${cleanName}.arc.bd.`;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          name: cleanName,
          content: trimmedContent,
          ttl: parseInt(formTtl, 10) || 300,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create DNS record");
      }

      setSuccessMsg(`Created ${formType} record for ${cleanName}`);
      setIsAddOpen(false);
      setFormName("");
      setFormContent("");
      fetchTelemetry(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to create DNS record");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteRecord = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch(
        `/api/admin/dns?name=${encodeURIComponent(deleteTarget.name)}&type=${encodeURIComponent(deleteTarget.type)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete record");
      }

      setSuccessMsg(`Deleted ${deleteTarget.name} (${deleteTarget.type}) from PowerDNS.`);
      setDeleteTarget(null);
      fetchTelemetry(true);
    } catch (err: any) {
      setError(err.message || "Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  const confirmSyncSupabase = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch("/api/admin/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-supabase" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to synchronize Supabase records");
      }

      setSuccessMsg(`Synchronized ${data.syncedCount} subdomains from Supabase into PowerDNS.`);
      setIsSyncOpen(false);
      fetchTelemetry(true);
    } catch (err: any) {
      setError(err.message || "Database synchronization failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleRunDnsTest = async () => {
    if (!testDomain.trim()) return;
    setTestTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-resolve",
          name: testDomain.trim(),
          type: testType,
        }),
      });
      const data = await res.json().catch(() => null);
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        domain: testDomain,
        type: testType,
        error: err.message || "DNS query failed",
      });
    } finally {
      setTestTesting(false);
    }
  };

  const handleExportBindZone = () => {
    let zoneText = `; Zone file for ${zone?.name || "arc.bd."}\n`;
    zoneText += `; Exported from ARC.BD PowerDNS Console\n`;
    zoneText += `$TTL 300\n\n`;

    rrsets.forEach((rr) => {
      rr.records.forEach((rec) => {
        zoneText += `${rr.name.padEnd(36)} ${rr.ttl.toString().padEnd(6)} IN  ${rr.type.padEnd(6)} ${rec.content}\n`;
      });
    });

    const blob = new Blob([zoneText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(zone?.name || "arc.bd").replace(/\.+$/, "")}.zone`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Distribution Breakdown
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { CNAME: 0, A: 0, TXT: 0, MX: 0, NS: 0, SOA: 0, OTHER: 0 };
    rrsets.forEach((r) => {
      if (counts[r.type] !== undefined) {
        counts[r.type]++;
      } else {
        counts.OTHER++;
      }
    });
    return counts;
  }, [rrsets]);

  // Filtered & Paginated Records
  const filteredRecords = useMemo(() => {
    return rrsets.filter((r) => {
      if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const nameMatch = r.name.toLowerCase().includes(q);
      const typeMatch = r.type.toLowerCase().includes(q);
      const contentMatch = r.records.some((rec) => rec.content.toLowerCase().includes(q));
      return nameMatch || typeMatch || contentMatch;
    });
  }, [rrsets, searchQuery, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Telemetry KPIs
  const totalUdpQueries = parseInt(stats["udp-queries"] || "0", 10);
  const totalTcpQueries = parseInt(stats["tcp-queries"] || "0", 10);
  const totalQueries = totalUdpQueries + totalTcpQueries;
  const packetCacheHits = parseInt(stats["packetcache-hit"] || "0", 10);
  const packetCacheMisses = parseInt(stats["packetcache-miss"] || "0", 10);
  const totalCacheRequests = packetCacheHits + packetCacheMisses;
  const cacheHitRatio = totalCacheRequests > 0 ? Math.round((packetCacheHits / totalCacheRequests) * 100) : 100;
  const backendLatency = stats["backend-latency"] ? `${stats["backend-latency"]} μs` : "< 1ms";

  return (
    <div className="space-y-5">
      {/* 1. Header & Consolidated Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Server className="size-5 text-primary" />
              Authoritative DNS
            </h1>
            <Badge
              variant="outline"
              className="px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1.5 text-[11px] font-medium"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PowerDNS {server?.version || "4.9.17"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Zone <code className="font-mono text-foreground font-semibold">{zone?.name || "arc.bd."}</code> · Bound to <span className="font-mono text-muted-foreground">ns1.arc.bd &amp; ns2.arc.bd:53</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Refresh */}
          <Select
            value={String(autoRefreshInterval)}
            onValueChange={(val) => setAutoRefreshInterval(parseInt(val, 10))}
          >
            <SelectTrigger className="w-[105px] h-8 text-xs bg-background" aria-label="Auto refresh interval">
              <SelectValue placeholder="Refresh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Manual</SelectItem>
              <SelectItem value="10">Auto 10s</SelectItem>
              <SelectItem value="30">Auto 30s</SelectItem>
              <SelectItem value="60">Auto 60s</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSyncOpen(true)}
            className="h-8 text-xs gap-1.5"
            title="Sync all subdomains from Supabase database to PowerDNS"
          >
            <Database className="size-3.5 text-primary" />
            Sync DB
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBindZone}
            disabled={rrsets.length === 0}
            className="h-8 text-xs gap-1.5"
            title="Download BIND zone file"
          >
            <Download className="size-3.5" />
            Export
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchTelemetry(false)}
            disabled={isRefreshing}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Refresh DNS state"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => { setFormError(null); setIsAddOpen(true); }}
            className="h-8 text-xs gap-1.5 font-medium ml-1"
          >
            <Plus className="size-3.5" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-xs font-semibold">Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="py-2.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-4" />
          <AlertTitle className="text-xs font-semibold">Success</AlertTitle>
          <AlertDescription className="text-xs">{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* 2. Unified Status Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-lg border border-border bg-card/60 text-xs">
        <div className="space-y-0.5">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Zone &amp; Serial</span>
          </div>
          <div className="font-mono font-semibold text-foreground truncate">
            {zone?.name || "arc.bd."}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {formatSerial(zone?.serial)}
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Layers className="size-3.5 text-primary" />
            <span>Active RRsets</span>
          </div>
          <div className="font-mono font-semibold text-primary text-base">
            {loading ? "..." : rrsets.length}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {totalQueries} queries ({totalUdpQueries} UDP)
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-500" />
            <span>Cache Hit &amp; Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-foreground">{cacheHitRatio}%</span>
            <Progress value={cacheHitRatio} className="h-1.5 w-16" />
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            Backend: {backendLatency}
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Activity className="size-3.5 text-emerald-500" />
            <span>Engine Uptime</span>
          </div>
          <div className="font-mono font-semibold text-foreground truncate">
            {formatUptime(stats["uptime"])}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            FD usage: {stats["fd-usage"] || "27"} · 0 errors
          </div>
        </div>
      </div>

      {/* 3. Main Tabs Navigation */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-sm bg-muted/60 h-8 p-0.5">
          <TabsTrigger value="records" className="text-xs gap-1.5 h-7">
            <Layers className="size-3.5" />
            Records ({rrsets.length})
          </TabsTrigger>
          <TabsTrigger value="tester" className="text-xs gap-1.5 h-7">
            <Radio className="size-3.5" />
            DNS Tester
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="text-xs gap-1.5 h-7">
            <Terminal className="size-3.5" />
            Telemetry
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: DNS Records Table & Filtering */}
        <TabsContent value="records" className="space-y-3">
          {/* Segmented Distribution Bar & Filter Controls */}
          <div className="space-y-2.5 p-3 rounded-lg border border-border bg-card/40">
            {/* Color Distribution Line */}
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex gap-0.5" title="Zone record type distribution">
              {typeCounts.CNAME > 0 && (
                <div
                  style={{ width: `${(typeCounts.CNAME / Math.max(rrsets.length, 1)) * 100}%` }}
                  className="bg-blue-500 h-full transition-all"
                />
              )}
              {typeCounts.A > 0 && (
                <div
                  style={{ width: `${(typeCounts.A / Math.max(rrsets.length, 1)) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                />
              )}
              {typeCounts.TXT > 0 && (
                <div
                  style={{ width: `${(typeCounts.TXT / Math.max(rrsets.length, 1)) * 100}%` }}
                  className="bg-purple-500 h-full transition-all"
                />
              )}
              {typeCounts.MX > 0 && (
                <div
                  style={{ width: `${(typeCounts.MX / Math.max(rrsets.length, 1)) * 100}%` }}
                  className="bg-amber-500 h-full transition-all"
                />
              )}
              {typeCounts.NS > 0 && (
                <div
                  style={{ width: `${(typeCounts.NS / Math.max(rrsets.length, 1)) * 100}%` }}
                  className="bg-cyan-500 h-full transition-all"
                />
              )}
              {typeCounts.SOA > 0 && (
                <div
                  style={{ width: `${(typeCounts.SOA / Math.max(rrsets.length, 1)) * 100}%` }}
                  className="bg-zinc-500 h-full transition-all"
                />
              )}
            </div>

            {/* Filter Pills + Search in a Single Balanced Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setTypeFilter("ALL"); setCurrentPage(1); }}
                  className={`h-6 px-2 text-[11px] rounded font-medium transition-colors ${
                    typeFilter === "ALL" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({rrsets.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setTypeFilter("CNAME"); setCurrentPage(1); }}
                  className={`h-6 px-2 text-[11px] rounded font-medium transition-colors ${
                    typeFilter === "CNAME" ? "bg-blue-500 text-white" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                  }`}
                >
                  CNAME ({typeCounts.CNAME})
                </button>
                <button
                  type="button"
                  onClick={() => { setTypeFilter("A"); setCurrentPage(1); }}
                  className={`h-6 px-2 text-[11px] rounded font-medium transition-colors ${
                    typeFilter === "A" ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  A ({typeCounts.A})
                </button>
                <button
                  type="button"
                  onClick={() => { setTypeFilter("TXT"); setCurrentPage(1); }}
                  className={`h-6 px-2 text-[11px] rounded font-medium transition-colors ${
                    typeFilter === "TXT" ? "bg-purple-500 text-white" : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                  }`}
                >
                  TXT ({typeCounts.TXT})
                </button>
                <button
                  type="button"
                  onClick={() => { setTypeFilter("NS"); setCurrentPage(1); }}
                  className={`h-6 px-2 text-[11px] rounded font-medium transition-colors ${
                    typeFilter === "NS" ? "bg-cyan-500 text-white" : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                  }`}
                >
                  NS ({typeCounts.NS})
                </button>
                <button
                  type="button"
                  onClick={() => { setTypeFilter("SOA"); setCurrentPage(1); }}
                  className={`h-6 px-2 text-[11px] rounded font-medium transition-colors ${
                    typeFilter === "SOA" ? "bg-zinc-500 text-white" : "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20"
                  }`}
                >
                  SOA ({typeCounts.SOA})
                </button>
              </div>

              {/* Search Bar with Keyboard / Shortcut Indicator */}
              <div className="relative w-full sm:w-56">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search records... (/)"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-8 pr-7 h-7 text-xs bg-background"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-2.5">
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-full" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-xs space-y-2">
                <p>No DNS records matched your filter criteria.</p>
                {(searchQuery || typeFilter !== "ALL") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSearchQuery(""); setTypeFilter("ALL"); setCurrentPage(1); }}
                    className="h-7 text-xs"
                  >
                    Reset filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent text-xs">
                      <TableHead className="w-[85px] font-semibold text-xs py-2">Type</TableHead>
                      <TableHead className="font-semibold text-xs py-2">Record Name</TableHead>
                      <TableHead className="font-semibold text-xs py-2">Content / Target</TableHead>
                      <TableHead className="w-[80px] font-semibold text-xs py-2">TTL</TableHead>
                      <TableHead className="w-[60px] text-right font-semibold text-xs py-2">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((rr, idx) => {
                      const typeStyle = TYPE_STYLES[rr.type] || { badge: "bg-muted text-foreground border-border", dot: "bg-muted-foreground", label: rr.type };
                      const nameKey = `name-${rr.name}-${idx}`;
                      const contentKey = `content-${rr.name}-${idx}`;

                      return (
                        <TableRow key={`${rr.name}-${rr.type}-${idx}`} className="border-border text-xs">
                          <TableCell className="py-2">
                            <Badge
                              variant="secondary"
                              title={typeStyle.label}
                              className={`font-mono text-[10px] font-bold px-1.5 py-0 border ${typeStyle.badge}`}
                            >
                              {rr.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-medium text-foreground py-2">
                            <div className="flex items-center gap-1 group">
                              <span className="truncate max-w-[180px] sm:max-w-xs">{rr.name}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(rr.name, nameKey)}
                                className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground"
                                title="Copy record name"
                                aria-label={`Copy record name ${rr.name}`}
                              >
                                {copiedKey === nameKey ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground py-2">
                            <div className="flex items-center gap-1 group">
                              <div className="max-w-xs sm:max-w-md truncate">
                                {rr.records.map((r, rIdx) => (
                                  <span key={rIdx} className="block truncate">
                                    {r.content}
                                  </span>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(rr.records.map((r) => r.content).join(", "), contentKey)}
                                className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground"
                                title="Copy record content"
                                aria-label="Copy record content"
                              >
                                {copiedKey === contentKey ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground py-2">
                            {rr.ttl}s
                          </TableCell>
                          <TableCell className="text-right py-2">
                            {rr.type !== "SOA" && (rr.name !== "arc.bd." || rr.type !== "NS") ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteTarget({ name: rr.name, type: rr.type })}
                                aria-label={`Delete record ${rr.name}`}
                                title={`Delete ${rr.name}`}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            ) : (
                              <Badge variant="outline" className="text-[9px] text-muted-foreground font-normal px-1 py-0" title="Core Authoritative Zone Record">
                                Core
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredRecords.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 border-t border-border text-xs text-muted-foreground bg-card/40">
                <div className="flex items-center gap-2">
                  <span>Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => { setPageSize(parseInt(val, 10)); setCurrentPage(1); }}
                  >
                    <SelectTrigger className="h-6 w-16 text-[11px] bg-background" aria-label="Records per page">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-3" />
                  </Button>
                  <span className="px-1 text-[11px]">Page {currentPage} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: Live DNS Tester */}
        <TabsContent value="tester" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Radio className="size-4 text-primary" />
                    Live Nameserver DNS Query Tester
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Send real-time DNS queries directly against authoritative nameserver <code className="font-mono text-primary">ns1.arc.bd:53</code>.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(`dig @98.84.25.233 ${testDomain} ${testType} +short`, "dig-cmd")}
                  className="h-7 text-[11px] gap-1 font-mono hidden sm:flex"
                  title="Copy terminal dig command"
                >
                  <Code2 className="size-3" />
                  {copiedKey === "dig-cmd" ? "Copied dig!" : "Copy dig cmd"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="test-type" className="text-xs font-medium text-foreground">Type</label>
                  <Select value={testType} onValueChange={(val) => setTestType(val)}>
                    <SelectTrigger id="test-type" className="w-full bg-background font-mono text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="AAAA">AAAA</SelectItem>
                      <SelectItem value="CNAME">CNAME</SelectItem>
                      <SelectItem value="TXT">TXT</SelectItem>
                      <SelectItem value="MX">MX</SelectItem>
                      <SelectItem value="NS">NS</SelectItem>
                      <SelectItem value="SOA">SOA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-7 space-y-1">
                  <label htmlFor="test-domain" className="text-xs font-medium text-foreground">Hostname / Subdomain</label>
                  <Input
                    id="test-domain"
                    placeholder="e.g. you.arc.bd"
                    value={testDomain}
                    onChange={(e) => setTestDomain(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRunDnsTest(); }}
                    className="bg-background font-mono text-xs h-8"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Button
                    onClick={handleRunDnsTest}
                    disabled={testTesting || !testDomain.trim()}
                    className="w-full font-medium text-xs h-8 gap-1.5"
                  >
                    {testTesting ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
                    Query ns1
                  </Button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                <span className="text-muted-foreground text-[11px]">Presets:</span>
                <button
                  type="button"
                  onClick={() => { setTestDomain("arc.bd"); setTestType("A"); }}
                  className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-mono text-[11px]"
                >
                  arc.bd (A)
                </button>
                <button
                  type="button"
                  onClick={() => { setTestDomain("you.arc.bd"); setTestType("CNAME"); }}
                  className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-mono text-[11px]"
                >
                  you.arc.bd (CNAME)
                </button>
                <button
                  type="button"
                  onClick={() => { setTestDomain("ns1.arc.bd"); setTestType("A"); }}
                  className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-mono text-[11px]"
                >
                  ns1.arc.bd (A)
                </button>
                <button
                  type="button"
                  onClick={() => { setTestDomain("arc.bd"); setTestType("NS"); }}
                  className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-mono text-[11px]"
                >
                  arc.bd (NS)
                </button>
              </div>

              {/* Result Container */}
              {testResult && (
                <div
                  aria-live="polite"
                  className="mt-3 p-3.5 rounded-lg border border-border bg-card/80 space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between border-b border-border pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Status:</span>
                      {testResult.success ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          NOERROR (RESOLVED)
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          {testResult.code || "ERROR"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                      <span>Latency: <strong className="text-primary">{testResult.latencyMs}ms</strong></span>
                    </div>
                  </div>

                  <div className="text-foreground font-semibold">
                    {testResult.domain} IN {testResult.type}
                  </div>

                  {testResult.success && testResult.answers ? (
                    <div className="p-2 rounded bg-muted/40 border border-border space-y-0.5">
                      {testResult.answers.map((ans: string, aIdx: number) => (
                        <div key={aIdx} className="text-emerald-400 flex items-center gap-2 truncate">
                          <span>↳</span>
                          <span className="font-bold">{ans}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-[11px]">
                      {testResult.error || "No authoritative answer returned."}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Telemetry & Engine Counters */}
        <TabsContent value="telemetry" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Group 1: Traffic & Query Volume */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Query Traffic &amp; Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">UDP Queries:</span>
                  <span className="font-bold text-foreground">{stats["udp-queries"] || "0"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">TCP Queries:</span>
                  <span className="font-bold text-foreground">{stats["tcp-queries"] || "0"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">UDP4 Answers:</span>
                  <span className="font-bold text-emerald-400">{stats["udp4-answers"] || "0"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Backend Queries:</span>
                  <span className="font-bold text-foreground">{stats["backend-queries"] || "0"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Group 2: Cache & Latency */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cache &amp; Latency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Packet Cache Hits:</span>
                  <span className="font-bold text-emerald-400">{stats["packetcache-hit"] || "0"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Packet Cache Misses:</span>
                  <span className="font-bold text-foreground">{stats["packetcache-miss"] || "0"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Backend Latency:</span>
                  <span className="font-bold text-primary">{stats["backend-latency"] ? `${stats["backend-latency"]} μs` : "0 μs"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Cache Latency:</span>
                  <span className="font-bold text-foreground">{stats["cache-latency"] ? `${stats["cache-latency"]} μs` : "0 μs"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Group 3: System & Memory */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Daemon &amp; Memory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">File Descriptors (FD):</span>
                  <span className="font-bold text-foreground">{stats["fd-usage"] || "27"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-bold text-foreground">{formatUptime(stats["uptime"])}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">CPU IO Wait:</span>
                  <span className="font-bold text-foreground">{stats["cpu-iowait"] || "0"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">CPU Steal:</span>
                  <span className="font-bold text-foreground">{stats["cpu-steal"] || "0"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Group 4: Integrity & Anomaly Signals */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Integrity &amp; Error Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Corrupt Packets:</span>
                  <span className="font-bold text-emerald-400">{stats["corrupt-packets"] || "0"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Refused Updates:</span>
                  <span className="font-bold text-foreground">{stats["dnsupdate-refused"] || "0"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">UDP In Errors:</span>
                  <span className="font-bold text-foreground">{stats["udp-in-errors"] || "0"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Deferred Inserts:</span>
                  <span className="font-bold text-foreground">{stats["deferred-packetcache-inserts"] || "0"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expandable Raw Counters Search Explorer */}
          <div className="p-3.5 rounded-lg border border-border bg-card/40 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-foreground">Raw Counter Explorer ({Object.keys(stats).length} metrics)</span>
              <div className="relative w-48">
                <Search className="size-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter keys..."
                  value={statsSearch}
                  onChange={(e) => setStatsSearch(e.target.value)}
                  className="pl-6 h-6 text-[11px] bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(stats)
                .filter(([k]) => !statsSearch || k.toLowerCase().includes(statsSearch.toLowerCase()))
                .map(([statKey, statValue]) => (
                  <div key={statKey} className="p-1.5 rounded border border-border/60 bg-background/50 text-[11px] font-mono truncate">
                    <span className="text-muted-foreground block truncate" title={statKey}>{statKey}</span>
                    <span className="font-bold text-foreground">{statValue}</span>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 4. Add DNS Record Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddRecord}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Add Authoritative DNS Record</DialogTitle>
              <DialogDescription className="text-xs">
                Directly provision an RRset record into PowerDNS zone <code className="font-mono text-primary">arc.bd.</code>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              {formError && (
                <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label htmlFor="form-type" className="font-medium text-foreground">Type</label>
                  <Select value={formType} onValueChange={(val: any) => setFormType(val)}>
                    <SelectTrigger id="form-type" className="font-mono text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNAME">CNAME</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="AAAA">AAAA</SelectItem>
                      <SelectItem value="TXT">TXT</SelectItem>
                      <SelectItem value="MX">MX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label htmlFor="form-ttl" className="font-medium text-foreground">TTL (Seconds)</label>
                  <Select value={formTtl} onValueChange={setFormTtl}>
                    <SelectTrigger id="form-ttl" className="font-mono text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60s (1 min - Dev)</SelectItem>
                      <SelectItem value="300">300s (5 mins - Standard)</SelectItem>
                      <SelectItem value="3600">3600s (1 hour)</SelectItem>
                      <SelectItem value="86400">86400s (1 day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="form-name" className="font-medium text-foreground">Record Name</label>
                <div className="relative">
                  <Input
                    id="form-name"
                    placeholder="e.g. portfolio or @"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="font-mono text-xs h-8 pr-16"
                    required
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-[10px] pointer-events-none">
                    .arc.bd
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="form-content" className="font-medium text-foreground">
                  Content / Target {formType === "A" ? "(IPv4)" : formType === "CNAME" ? "(Hostname)" : "(Value)"}
                </label>
                <Input
                  id="form-content"
                  placeholder={
                    formType === "CNAME" ? "cname.vercel-dns.com" :
                    formType === "A" ? "192.0.2.1" :
                    formType === "TXT" ? "v=spf1 include:... ~all" : "Target"
                  }
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="font-mono text-xs h-8"
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} size="sm" className="text-xs h-8 gap-1.5">
                {submitting ? <Loader2 className="size-3.5 animate-spin" /> : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">Delete Authoritative DNS Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs space-y-1">
              <span>Are you sure you want to delete <strong className="font-mono text-foreground">{deleteTarget?.name}</strong> ({deleteTarget?.type}) from PowerDNS?</span>
              <span className="block text-destructive pt-1">This will immediately stop resolving traffic for this subdomain.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecord}
              disabled={deleting}
              className="text-xs h-8 bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
            >
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 6. Sync Supabase Confirmation AlertDialog */}
      <AlertDialog open={isSyncOpen} onOpenChange={setIsSyncOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">Synchronize Database with PowerDNS?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs space-y-1">
              <span>This operation will query all active subdomain records in Supabase and provision/update their RRsets in PowerDNS authoritative zone <strong className="font-mono text-foreground">arc.bd.</strong></span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSyncSupabase}
              disabled={syncing}
              className="text-xs h-8 gap-1.5"
            >
              {syncing ? <Loader2 className="size-3.5 animate-spin" /> : <Database className="size-3.5" />}
              Start Sync
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
