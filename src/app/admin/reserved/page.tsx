"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  Bookmark,
  Search,
  Copy,
  Check,
  RefreshCw,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ShieldAlert
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

interface ReservedName {
  id: string;
  name: string;
  reason?: string;
  created_at?: string;
}

export default function AdminReserved() {
  const [reserved, setReserved] = useState<ReservedName[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Add Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<ReservedName | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Keyboard shortcut '/' for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !isAddOpen &&
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
  }, [isAddOpen, deleteTarget]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const fetchReserved = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsRefreshing(true);
      setError(null);

      const res = await fetch("/api/admin/reserved");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to fetch reserved names (${res.status})`);
      }

      setReserved(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load reserved names");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReserved(false);
  }, [fetchReserved]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleanName) {
      setFormError("Subdomain prefix is required.");
      return;
    }

    setAdding(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/reserved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          reason: reasonInput.trim() || "System reserved keyword",
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to add reserved name");
      }

      setSuccessMsg(`Reserved prefix "${cleanName}" added successfully.`);
      setIsAddOpen(false);
      setNameInput("");
      setReasonInput("");
      fetchReserved(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to reserve name");
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setError(null);

      const res = await fetch(`/api/admin/reserved?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to unblock reserved name");
      }

      setSuccessMsg(`Subdomain prefix "${deleteTarget.name}" unblocked.`);
      setDeleteTarget(null);
      fetchReserved(true);
    } catch (err: any) {
      setError(err.message || "Failed to remove reserved restriction");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered & Paginated Records
  const filteredReserved = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return reserved;
    return reserved.filter((r) => {
      const nameMatch = r.name.toLowerCase().includes(q);
      const reasonMatch = r.reason ? r.reason.toLowerCase().includes(q) : false;
      return nameMatch || reasonMatch;
    });
  }, [reserved, search]);

  const totalPages = Math.max(1, Math.ceil(filteredReserved.length / pageSize));
  const paginatedReserved = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReserved.slice(start, start + pageSize);
  }, [filteredReserved, page, pageSize]);

  return (
    <div className="space-y-5">
      {/* 1. Header & Consolidated Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Bookmark className="size-5 text-primary" />
              Reserved Names Registry
            </h1>
            <Badge
              variant="outline"
              className="px-2 py-0.5 border-border bg-muted/50 text-foreground text-[11px] font-medium"
            >
              {reserved.length} Protected Prefixes
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Prevent registration of system endpoints, protocols, and high-value brand names across ARC.BD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchReserved(false)}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="h-8 text-xs gap-1.5"
            aria-label="Refresh reserved registry"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={() => { setFormError(null); setIsAddOpen(true); }}
            variant="default"
            size="sm"
            className="h-8 text-xs gap-1.5 font-medium ml-1"
          >
            <Plus className="size-3.5" />
            Add Reserved Name
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

      {/* 2. Full-Width Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-lg border border-border bg-card/40">
        <div className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{filteredReserved.length}</strong> of {reserved.length} protected keywords
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Filter keywords... (/)"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 pr-7 h-7 text-xs bg-background"
            aria-label="Search reserved keyword"
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

      {/* 3. Full-Width Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : filteredReserved.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <p>No reserved keywords found matching your search query.</p>
            {search && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearch("")}
                className="h-7 text-xs"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent text-xs">
                  <TableHead className="w-[200px] font-semibold text-xs py-2.5">Blocked Prefix</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5">Protection Scope / Reason</TableHead>
                  <TableHead className="w-[80px] text-right font-semibold text-xs py-2.5">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReserved.map((resItem, idx) => {
                  const nameKey = `res-${resItem.id}-${idx}`;

                  return (
                    <TableRow key={resItem.id} className="border-border text-xs">
                      {/* Subdomain Prefix Badge */}
                      <TableCell className="py-2.5 font-mono">
                        <div className="flex items-center gap-1.5 group">
                          <Badge
                            variant="secondary"
                            className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-mono font-bold px-2 py-0.5"
                          >
                            {resItem.name}.arc.bd
                          </Badge>
                          <button
                            type="button"
                            onClick={() => handleCopy(resItem.name, nameKey)}
                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground"
                            title="Copy prefix"
                            aria-label={`Copy prefix ${resItem.name}`}
                          >
                            {copiedKey === nameKey ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                      </TableCell>

                      {/* Reason Description */}
                      <TableCell className="text-muted-foreground text-xs py-2.5">
                        {resItem.reason || "System reserved keyword"}
                      </TableCell>

                      {/* Delete Button */}
                      <TableCell className="text-right py-2.5">
                        <Button
                          onClick={() => setDeleteTarget(resItem)}
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label={`Unblock ${resItem.name}`}
                          title={`Unblock ${resItem.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredReserved.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-xs text-muted-foreground bg-card/40">
            <div className="flex items-center gap-2">
              <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredReserved.length)} of {filteredReserved.length}</span>
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

      {/* 4. Add Reserved Name Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Reserve Subdomain Prefix</DialogTitle>
              <DialogDescription className="text-xs">
                Block a keyword from public registration across ARC.BD.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              {formError && (
                <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="res-name" className="font-medium text-foreground">
                  Subdomain Prefix
                </label>
                <div className="relative">
                  <Input
                    id="res-name"
                    placeholder="e.g. root, vpn, or api"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="font-mono text-xs h-8 pr-16"
                    required
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-[10px] pointer-events-none">
                    .arc.bd
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="res-reason" className="font-medium text-foreground">
                  Reason / Protection Category
                </label>
                <Input
                  id="res-reason"
                  placeholder="e.g. System endpoint, security protocol, or brand protection"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-muted-foreground">Quick Presets:</span>
                <div className="flex flex-wrap gap-1">
                  {["System Endpoint", "Security Protocol", "Brand Protection", "Reserved Keyword"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReasonInput(preset)}
                      className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-[10px] text-foreground transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adding}
                size="sm"
                className="text-xs h-8 gap-1.5 font-medium"
              >
                {adding ? <Loader2 className="size-3.5 animate-spin" /> : "Save Reserved Name"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">Unblock Subdomain Prefix?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-xs text-muted-foreground pt-1">
                <p>
                  Are you sure you want to unblock <strong className="text-foreground font-mono">{deleteTarget?.name}.arc.bd</strong>?
                </p>
                <p className="text-amber-400">Users will immediately be allowed to claim and register this subdomain.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={deleting} className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="text-xs h-8 bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
            >
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              Unblock Name
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
