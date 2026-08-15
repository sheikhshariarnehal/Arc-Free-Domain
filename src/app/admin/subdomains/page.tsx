"use client";

import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  Clock,
  Check,
  X,
  User,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Globe,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

interface AdminSubdomain {
  id: string;
  name: string;
  full_domain: string;
  user_id: string;
  status: "active" | "suspended" | "pending" | "deleted";
  created_at: string;
  profiles?: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
  } | null;
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

function AdminSubdomainsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialStatus = searchParams.get("status") || "all";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [subdomains, setSubdomains] = useState<AdminSubdomain[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter & Search State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(25);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dialog State
  const [actionTarget, setActionTarget] = useState<{
    subdomain: AdminSubdomain;
    action: "approve" | "suspend" | "unsuspend" | "reject";
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

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
        !actionTarget &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actionTarget]);

  // Auto-dismiss success alert
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  // Fetch Subdomains
  const fetchSubdomains = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setIsRefreshing(true);
      }
      setError(null);

      const queryParams = new URLSearchParams();
      if (debouncedSearch) queryParams.set("search", debouncedSearch);
      if (statusFilter !== "all") queryParams.set("status", statusFilter);
      queryParams.set("page", String(page));
      queryParams.set("limit", String(pageSize));

      const res = await fetch(`/api/admin/subdomains?${queryParams.toString()}`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to fetch subdomains (${res.status})`);
      }

      setSubdomains(Array.isArray(data?.data) ? data.data : []);
      setTotalCount(typeof data?.count === "number" ? data.count : (data?.data?.length || 0));
    } catch (err: any) {
      setError(err.message || "Failed to load subdomains");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, statusFilter, page, pageSize]);

  useEffect(() => {
    fetchSubdomains(false);
  }, [fetchSubdomains]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStatusChange = async (sub: AdminSubdomain, newStatus: "active" | "suspended" | "pending", reason?: string) => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/subdomains", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sub.id,
          status: newStatus,
          reason: reason || undefined,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update subdomain status");
      }

      const actionText =
        newStatus === "active"
          ? "approved and unlocked"
          : newStatus === "suspended" && actionTarget?.action === "reject"
          ? "rejected"
          : newStatus === "suspended"
          ? "suspended"
          : "updated";

      setSuccessMsg(`Subdomain ${sub.full_domain} successfully ${actionText}.`);
      setActionTarget(null);
      setRejectReason("");
      fetchSubdomains(true);
    } catch (err: any) {
      setError(err.message || "Status update failed");
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = useMemo(() => {
    return subdomains.filter((s) => s.status === "pending").length;
  }, [subdomains]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-5">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Globe className="size-5 text-primary" />
              Subdomain Management
            </h1>
            <Badge
              variant="outline"
              className="px-2 py-0.5 border-border bg-muted/50 text-foreground text-[11px] font-medium"
            >
              {totalCount} Total Claims
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review claims, moderate active routes, and provision subdomains across ARC.BD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchSubdomains(false)}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="h-8 text-xs gap-1.5"
            aria-label="Refresh subdomains list"
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

      {/* 2. Unified Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-lg border border-border bg-card/40">
        {/* Status Filter Buttons with Semantic ARIA attributes */}
        <div role="tablist" aria-label="Status Filter" className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "all"}
            onClick={() => { setStatusFilter("all"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({totalCount})
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
            Pending Review
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black text-amber-400 font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "active"}
            onClick={() => { setStatusFilter("active"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "suspended"}
            onClick={() => { setStatusFilter("suspended"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "suspended"
                ? "bg-destructive text-destructive-foreground"
                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
            }`}
          >
            Suspended
          </button>
        </div>

        {/* Debounced Search */}
        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search subdomains... (/)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-7 h-7 text-xs bg-background"
            aria-label="Search subdomain name or prefix"
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

      {/* 3. Subdomains Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : subdomains.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <p>No subdomains found matching the current search/filter criteria.</p>
            {(search || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(""); setStatusFilter("all"); setPage(1); }}
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
                  <TableHead className="font-semibold text-xs py-2.5">Subdomain</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5">Owner / User</TableHead>
                  <TableHead className="w-[110px] font-semibold text-xs py-2.5">Status</TableHead>
                  <TableHead className="w-[120px] font-semibold text-xs py-2.5">Claimed</TableHead>
                  <TableHead className="w-[140px] text-right font-semibold text-xs py-2.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subdomains.map((sub, idx) => {
                  const userEmail = sub.profiles?.email || "Unknown user";
                  const userName = sub.profiles?.name;
                  const nameKey = `sub-${sub.id}-${idx}`;

                  return (
                    <TableRow
                      key={sub.id}
                      className={`border-border text-xs ${
                        sub.status === "pending" ? "bg-amber-500/5 hover:bg-amber-500/10" : ""
                      }`}
                    >
                      <TableCell className="font-medium text-foreground py-2.5">
                        <div className="flex items-center gap-1.5 group">
                          <span className="font-mono font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                            {sub.full_domain}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(sub.full_domain, nameKey)}
                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground"
                            title="Copy full domain"
                            aria-label={`Copy domain ${sub.full_domain}`}
                          >
                            {copiedKey === nameKey ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          </button>
                          <a
                            href={`https://${sub.full_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-primary"
                            title={`Open https://${sub.full_domain}`}
                            aria-label={`Visit https://${sub.full_domain}`}
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5">
                        <div className="flex flex-col">
                          <span className="text-xs text-foreground font-medium flex items-center gap-1">
                            <User className="size-3 text-muted-foreground" /> {userEmail}
                          </span>
                          {userName && (
                            <span className="text-[11px] text-muted-foreground">{userName}</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5">
                        <Badge
                          variant="secondary"
                          className={`capitalize font-mono text-[10px] font-bold px-2 py-0.5 border ${
                            sub.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : sub.status === "pending"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold"
                              : sub.status === "suspended"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {sub.status === "pending" ? "Review Required" : sub.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground text-xs py-2.5" title={sub.created_at}>
                        {formatRelativeTime(sub.created_at)}
                      </TableCell>

                      <TableCell className="text-right py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === "pending" ? (
                            <>
                              <Button
                                onClick={() => setActionTarget({ subdomain: sub, action: "approve" })}
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5 font-medium"
                                aria-label={`Approve claim for ${sub.full_domain}`}
                              >
                                <Check className="size-3.5" /> Approve
                              </Button>
                              <Button
                                onClick={() => { setRejectReason(""); setActionTarget({ subdomain: sub, action: "reject" }); }}
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 px-2"
                                aria-label={`Reject claim for ${sub.full_domain}`}
                              >
                                <X className="size-3.5" /> Reject
                              </Button>
                            </>
                          ) : sub.status === "suspended" ? (
                            <Button
                              onClick={() => setActionTarget({ subdomain: sub, action: "unsuspend" })}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1 px-2"
                              aria-label={`Unsuspend ${sub.full_domain}`}
                            >
                              <CheckCircle className="size-3.5" /> Unsuspend
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setActionTarget({ subdomain: sub, action: "suspend" })}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 px-2"
                              aria-label={`Suspend ${sub.full_domain}`}
                            >
                              <ShieldAlert className="size-3.5" /> Suspend
                            </Button>
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
        {totalCount > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-xs text-muted-foreground bg-card/40">
            <div className="flex items-center gap-2">
              <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}</span>
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

      {/* 4. Action Confirmation Modal with Reason Prompt */}
      <AlertDialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              {actionTarget?.action === "approve"
                ? "Approve Subdomain Claim"
                : actionTarget?.action === "reject"
                ? "Reject Subdomain Claim"
                : actionTarget?.action === "unsuspend"
                ? "Unsuspend Subdomain"
                : "Suspend Subdomain"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-xs text-muted-foreground pt-1">
                {actionTarget?.action === "approve" ? (
                  <div>
                    Are you sure you want to approve <strong className="text-foreground font-mono">{actionTarget.subdomain.full_domain}</strong> for{" "}
                    <strong className="text-foreground">{actionTarget.subdomain.profiles?.email || actionTarget.subdomain.user_id}</strong>?
                    <p className="pt-2 text-emerald-400">This activates the subdomain, unlocks DNS record management, and dispatches a confirmation email.</p>
                  </div>
                ) : actionTarget?.action === "reject" ? (
                  <div className="space-y-2">
                    <p>
                      Are you sure you want to reject the claim for <strong className="text-foreground font-mono">{actionTarget.subdomain.full_domain}</strong>?
                    </p>
                    <div className="space-y-1 pt-1">
                      <label htmlFor="reject-reason" className="font-medium text-foreground">
                        Rejection Reason (included in notification email):
                      </label>
                      <Input
                        id="reject-reason"
                        placeholder="e.g. Reserved brand name, suspicious target, or incomplete verification"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="text-xs h-8 bg-background font-sans"
                      />
                    </div>
                  </div>
                ) : actionTarget?.action === "unsuspend" ? (
                  <div>
                    Are you sure you want to restore and unlock <strong className="text-foreground font-mono">{actionTarget?.subdomain.full_domain}</strong>?
                  </div>
                ) : (
                  <div>
                    Are you sure you want to suspend <strong className="text-foreground font-mono">{actionTarget?.subdomain.full_domain}</strong>? Traffic and DNS routing will be deactivated.
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={processing} className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!actionTarget) return;
                const newStatus =
                  actionTarget.action === "approve" || actionTarget.action === "unsuspend"
                    ? "active"
                    : "suspended";
                handleStatusChange(actionTarget.subdomain, newStatus, rejectReason);
              }}
              disabled={processing}
              className={`text-xs h-8 gap-1.5 ${
                actionTarget?.action === "approve" || actionTarget?.action === "unsuspend"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }`}
            >
              {processing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : actionTarget?.action === "approve" ? (
                "Approve & Unlock"
              ) : actionTarget?.action === "reject" ? (
                "Reject Claim"
              ) : actionTarget?.action === "unsuspend" ? (
                "Restore Subdomain"
              ) : (
                "Suspend Subdomain"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminSubdomains() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <AdminSubdomainsInner />
    </Suspense>
  );
}
