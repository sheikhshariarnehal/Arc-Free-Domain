"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Eye,
  Flag,
  Search,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldAlert,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe
} from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AbuseReport {
  id: string;
  subdomain: string;
  reporter_email: string;
  category: string;
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function AdminReports() {
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<AbuseReport | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Search, Filters & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "pending" | "resolved" | "dismissed">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Keyboard shortcut '/' for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !viewReport &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewReport]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const fetchReports = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsRefreshing(true);
      setError(null);

      const res = await fetch("/api/admin/reports");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to load reports (${res.status})`);
      }

      setReports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load abuse queue");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(false);
  }, [fetchReports]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const updateStatus = async (id: string, newStatus: "resolved" | "dismissed" | "pending") => {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update report status");
      }

      setSuccessMsg(`Report marked as ${newStatus}.`);
      if (viewReport && viewReport.id === id) {
        setViewReport(null);
      }
      fetchReports(true);
    } catch (err: any) {
      setError(err.message || "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered & Paginated Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      const q = debouncedSearch.toLowerCase().trim();
      if (!q) return true;
      const subMatch = r.subdomain.toLowerCase().includes(q);
      const emailMatch = r.reporter_email.toLowerCase().includes(q);
      const catMatch = r.category.toLowerCase().includes(q);
      const detailsMatch = r.details ? r.details.toLowerCase().includes(q) : false;
      return subMatch || emailMatch || catMatch || detailsMatch;
    });
  }, [reports, statusFilter, debouncedSearch]);

  const pendingCount = useMemo(() => reports.filter((r) => r.status === "pending").length, [reports]);
  const resolvedCount = useMemo(() => reports.filter((r) => r.status === "resolved").length, [reports]);
  const dismissedCount = useMemo(() => reports.filter((r) => r.status === "dismissed").length, [reports]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const paginatedReports = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, page, pageSize]);

  return (
    <div className="space-y-5">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Flag className="size-5 text-primary" />
              Abuse &amp; Safety Queue
            </h1>
            <Badge
              variant="outline"
              className="px-2 py-0.5 border-border bg-muted/50 text-foreground text-[11px] font-medium"
            >
              {reports.length} Total Reports
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review user-submitted infringement, phishing, and terms of service reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchReports(false)}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="h-8 text-xs gap-1.5"
            aria-label="Refresh abuse reports"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-lg border border-border bg-card/40">
        {/* Status Filter Tabs */}
        <div role="tablist" aria-label="Report Status Filter" className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "ALL"}
            onClick={() => { setStatusFilter("ALL"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "ALL"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "pending"}
            onClick={() => { setStatusFilter("pending"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-amber-500 text-black font-semibold"
                : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            <Clock className="size-3" />
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "resolved"}
            onClick={() => { setStatusFilter("resolved"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "resolved"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "dismissed"}
            onClick={() => { setStatusFilter("dismissed"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "dismissed"
                ? "bg-secondary text-foreground font-semibold"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Dismissed ({dismissedCount})
          </button>
        </div>

        {/* Debounced Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search reports... (/)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-7 h-7 text-xs bg-background"
            aria-label="Search reports by domain or email"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Reports Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <p>No abuse reports found matching the current criteria.</p>
            {(search || statusFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(""); setStatusFilter("ALL"); setPage(1); }}
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
                  <TableHead className="font-semibold text-xs py-2.5">Target Subdomain</TableHead>
                  <TableHead className="w-[120px] font-semibold text-xs py-2.5">Category</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5">Reporter</TableHead>
                  <TableHead className="w-[100px] font-semibold text-xs py-2.5">Status</TableHead>
                  <TableHead className="w-[110px] font-semibold text-xs py-2.5">Reported</TableHead>
                  <TableHead className="w-[110px] text-right font-semibold text-xs py-2.5">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.map((report, idx) => {
                  const nameKey = `report-${report.id}-${idx}`;

                  return (
                    <TableRow key={report.id} className="border-border text-xs">
                      {/* Subdomain Name + Copy + Live link */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5 group">
                          <span className="font-mono font-semibold text-foreground truncate max-w-[180px] sm:max-w-xs">
                            {report.subdomain}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(report.subdomain, nameKey)}
                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground"
                            title="Copy subdomain"
                            aria-label={`Copy subdomain ${report.subdomain}`}
                          >
                            {copiedKey === nameKey ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          </button>
                          <a
                            href={`https://${report.subdomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-primary"
                            title={`Open https://${report.subdomain}`}
                            aria-label={`Visit https://${report.subdomain}`}
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </TableCell>

                      {/* Category Badge */}
                      <TableCell className="py-2.5">
                        <Badge
                          variant="secondary"
                          className={`capitalize font-mono text-[10px] font-bold px-1.5 py-0.5 border ${
                            report.category.toLowerCase().includes("phish") || report.category.toLowerCase().includes("malware")
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {report.category}
                        </Badge>
                      </TableCell>

                      {/* Reporter Email */}
                      <TableCell className="text-muted-foreground text-xs py-2.5 truncate max-w-[150px]">
                        {report.reporter_email}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-2.5">
                        <Badge
                          variant="secondary"
                          className={`capitalize font-mono text-[10px] font-bold px-2 py-0.5 border ${
                            report.status === "resolved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : report.status === "pending"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="text-muted-foreground text-xs py-2.5" title={report.created_at}>
                        {formatRelativeTime(report.created_at)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            onClick={() => setViewReport(report)}
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="View Incident Details"
                            aria-label={`Inspect report for ${report.subdomain}`}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          {report.status === "pending" && (
                            <>
                              <Button
                                onClick={() => updateStatus(report.id, "resolved")}
                                disabled={updatingId === report.id}
                                variant="ghost"
                                size="icon"
                                className="size-7 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                title="Mark Resolved"
                                aria-label={`Resolve report for ${report.subdomain}`}
                              >
                                {updatingId === report.id ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                              </Button>
                              <Button
                                onClick={() => updateStatus(report.id, "dismissed")}
                                disabled={updatingId === report.id}
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Dismiss Report"
                                aria-label={`Dismiss report for ${report.subdomain}`}
                              >
                                <X className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredReports.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-xs text-muted-foreground bg-card/40">
            <div className="flex items-center gap-2">
              <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredReports.length)} of {filteredReports.length}</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => { setPageSize(parseInt(val, 10)); setPage(1); }}
              >
                <SelectTrigger className="h-6 w-16 text-[11px] bg-background" aria-label="Items per page">
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3" />
              </Button>
              <span className="px-1 text-[11px]">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Report Details Inspection Dialog */}
      <Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-400" />
              Abuse Report Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Incident filed against subdomain <code className="font-mono text-foreground font-semibold">{viewReport?.subdomain}</code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg border border-border bg-muted/40">
              <div>
                <span className="text-muted-foreground text-[11px]">Category</span>
                <p className="font-semibold text-foreground capitalize mt-0.5">{viewReport?.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">Reported Date</span>
                <p className="font-semibold text-foreground mt-0.5">{viewReport ? formatRelativeTime(viewReport.created_at) : "—"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px]">Reporter Email</span>
              <p className="font-mono text-foreground p-2 rounded border border-border bg-background">
                {viewReport?.reporter_email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px]">Incident Details / Explanation</span>
              <div className="p-3 rounded-lg border border-border bg-background text-foreground font-mono text-xs max-h-40 overflow-y-auto whitespace-pre-wrap">
                {viewReport?.details || "No supplementary description submitted."}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <Button variant="outline" size="sm" asChild className="text-xs h-8 gap-1.5">
                <Link href={`/admin/subdomains?search=${encodeURIComponent(viewReport?.subdomain || "")}`}>
                  <Globe className="size-3.5 text-primary" />
                  Moderate in Subdomains
                </Link>
              </Button>

              {viewReport?.status === "pending" && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewReport && updateStatus(viewReport.id, "dismissed")}
                    className="text-xs h-8"
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => viewReport && updateStatus(viewReport.id, "resolved")}
                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <Check className="size-3.5" />
                    Resolve
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
