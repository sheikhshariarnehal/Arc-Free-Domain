"use client";

import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Globe,
  Plus,
  Search,
  Loader2,
  Trash2,
  Lock,
  Settings,
  Copy,
  Check,
  X,
  AlertCircle,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface SubdomainRecord {
  id: string;
  name: string;
  full_domain: string;
  status: "pending" | "active" | "suspended" | "deleted";
  created_at: string;
  dns_records?: Array<{ type: string; content: string; name: string }>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-medium cursor-default select-none border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Live on Cloudflare Edge DNS with SSL termination
          </TooltipContent>
        </Tooltip>
      );
    case "pending":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-medium cursor-default select-none border border-amber-500/20">
              <span className="size-1.5 rounded-full bg-amber-400" />
              Pending Review
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Awaiting administrator verification for anti-abuse safeguards
          </TooltipContent>
        </Tooltip>
      );
    case "suspended":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive text-[11px] font-medium cursor-default select-none border border-destructive/20">
              Suspended
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Disabled due to policy or security violation
          </TooltipContent>
        </Tooltip>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium capitalize">
          {status}
        </span>
      );
  }
}

const MAX_SUBDOMAINS = 5;

function DomainsListInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [subdomains, setSubdomains] = useState<SubdomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "suspended">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [claimInput, setClaimInput] = useState("");
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubdomainRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [autoClaiming, setAutoClaiming] = useState(false);
  const [autoClaimMsg, setAutoClaimMsg] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  // Global '/' keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchSubdomains = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subdomains");
      if (!res.ok) throw new Error("Failed to load subdomains");
      const data = await res.json();
      setSubdomains(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load subdomains");
    } finally {
      setLoading(false);
    }
  };

  // Auto-claim or open dialog if action=claim
  useEffect(() => {
    const claimName = searchParams.get("claim");
    const action = searchParams.get("action");

    if (action === "claim") {
      setShowClaimDialog(true);
      router.replace("/dashboard/domains");
    }

    if (!claimName) {
      fetchSubdomains();
      return;
    }

    router.replace("/dashboard/domains");

    const autoClaim = async () => {
      setAutoClaiming(true);
      setAutoClaimMsg(`Submitting claim for ${claimName}.arc.bd...`);
      try {
        const res = await fetch("/api/subdomains/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: claimName }),
        });
        const data = await res.json();
        if (res.ok) {
          setAutoClaimMsg(`✓ ${claimName}.arc.bd claim submitted! A confirmation email has been sent to your address.`);
        } else {
          setAutoClaimMsg(`Could not claim ${claimName}.arc.bd. ${data.error || "This name is already registered."}`);
        }
      } catch {
        setAutoClaimMsg(`Could not claim ${claimName}.arc.bd. Please check your connection and try again.`);
      } finally {
        setAutoClaiming(false);
        fetchSubdomains();
        setTimeout(() => setAutoClaimMsg(null), 8000);
      }
    };

    autoClaim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (fullDomain: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://${fullDomain}`);
    setCopiedDomain(fullDomain);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  // Live input validation
  const cleanInput = claimInput.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const isValidLength = cleanInput.length >= 3 && cleanInput.length <= 32;
  const isHyphenValid = !cleanInput.startsWith("-") && !cleanInput.endsWith("-");
  const isDomainFormatValid = isValidLength && isHyphenValid;

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanInput.length < 3) {
      setClaimError("Subdomain name must be at least 3 characters long.");
      return;
    }
    if (cleanInput.length > 32) {
      setClaimError("Subdomain name cannot exceed 32 characters.");
      return;
    }
    if (!isHyphenValid) {
      setClaimError("Subdomain name cannot start or end with a hyphen.");
      return;
    }

    setClaiming(true);
    setClaimError(null);
    setClaimSuccessMsg(null);
    const domainToClaim = cleanInput;

    try {
      const res = await fetch("/api/subdomains/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: domainToClaim }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim subdomain");
      setClaimInput("");
      setShowClaimDialog(false);
      setClaimSuccessMsg(`Claim submitted. ${domainToClaim}.arc.bd will become active once an administrator approves it.`);
      fetchSubdomains();
      setTimeout(() => setClaimSuccessMsg(null), 10000);
    } catch (err: any) {
      setClaimError(err.message || "Failed to claim subdomain");
    } finally {
      setClaiming(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/subdomains/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchSubdomains();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return subdomains.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.full_domain.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subdomains, search, statusFilter]);

  const usedSlots = subdomains.length;
  const remainingSlots = Math.max(0, MAX_SUBDOMAINS - usedSlots);
  const isQuotaReached = usedSlots >= MAX_SUBDOMAINS;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">My Subdomains</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your .arc.bd subdomains, DNS records, and routing rules.
        </p>
      </div>

      {/* Success banner after claiming */}
      {claimSuccessMsg && (
        <div className="flex items-center justify-between p-3.5 rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-300 text-xs sm:text-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-amber-400 shrink-0" />
            <p className="font-medium">{claimSuccessMsg}</p>
          </div>
          <button
            onClick={() => setClaimSuccessMsg(null)}
            className="text-amber-400 hover:text-amber-200 p-1"
            aria-label="Dismiss message"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Auto-claim status banner (shown after OAuth redirect) */}
      {autoClaimMsg && (
        <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium border shadow-sm animate-in fade-in duration-200 ${
          autoClaiming
            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
            : autoClaimMsg.startsWith("✓")
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : "bg-destructive/10 border-destructive/30 text-destructive"
        }`}>
          {autoClaiming && <Loader2 className="size-3.5 animate-spin shrink-0" />}
          <p className="flex-1">{autoClaimMsg}</p>
          <button onClick={() => setAutoClaimMsg(null)} className="p-1" aria-label="Dismiss banner">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Control Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-2">
        {/* Search Input with '/' hotkey */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search subdomains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-10 h-9 w-full text-xs sm:text-sm bg-background/60 border border-border/60 shadow-none rounded-full focus-visible:ring-1 focus-visible:ring-ring transition-all placeholder:text-muted-foreground"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4.5 select-none items-center rounded-full border border-border/60 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground hidden sm:inline-flex">
              /
            </kbd>
          )}
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* Filter Dropdown Button */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`size-9 shrink-0 rounded-full border-border/60 bg-card hover:bg-secondary transition-colors ${
                        statusFilter !== "all" ? "border-primary text-primary" : "text-muted-foreground"
                      }`}
                      aria-label="Filter projects by status"
                    >
                      <SlidersHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Filter status ({statusFilter})
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent align="end" className="w-44 border-border shadow-xl">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Filter Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as any)}
                >
                  <DropdownMenuRadioItem value="all" className="text-xs cursor-pointer">
                    All ({subdomains.length})
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="active" className="text-xs cursor-pointer">
                    Active ({subdomains.filter((s) => s.status === "active").length})
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending" className="text-xs cursor-pointer">
                    Pending ({subdomains.filter((s) => s.status === "pending").length})
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="suspended" className="text-xs cursor-pointer">
                    Suspended ({subdomains.filter((s) => s.status === "suspended").length})
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Grid vs List View Mode Switcher */}
            <div className="flex items-center rounded-full border border-border/60 bg-card p-0.5 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex size-8 items-center justify-center rounded-full transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Switch to grid view"
                  >
                    <LayoutGrid className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Grid View
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex size-8 items-center justify-center rounded-full transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Switch to list view"
                  >
                    <List className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  List View
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Action Button: Add New */}
          {isQuotaReached ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    disabled
                    className="h-9 px-4 rounded-full font-semibold text-xs bg-muted text-muted-foreground cursor-not-allowed opacity-60 shrink-0 gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    <span>Add New</span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Quota reached ({usedSlots} of {MAX_SUBDOMAINS} subdomains claimed)
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={() => {
                setClaimError(null);
                setShowClaimDialog(true);
              }}
              className="h-9 px-4 rounded-full font-semibold text-xs bg-foreground text-background hover:bg-foreground/90 shrink-0 gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Add New</span>
            </Button>
          )}
        </div>
      </div>

      {/* Claim Subdomain Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-lg border-border bg-card shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Globe className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-lg">Claim a Free Subdomain</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Register a free <strong>.arc.bd</strong> domain for your project.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleClaim} className="space-y-4 pt-2">
            {claimError && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs p-3">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <p className="flex-1">{claimError}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Subdomain name
              </label>
              <div className="flex items-center rounded-lg border border-input bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                <Input
                  required
                  placeholder="my-project"
                  value={claimInput}
                  onChange={(e) =>
                    setClaimInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  className="flex-1 border-0 bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm placeholder:text-muted-foreground font-mono"
                  autoFocus
                />
                <span className="text-sm font-mono font-semibold text-muted-foreground shrink-0 pl-1 select-none">
                  .arc.bd
                </span>
              </div>
            </div>

            {/* Live Domain Preview & Validation Rules */}
            {cleanInput && (
              <div className="rounded-lg bg-secondary/60 border border-border p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Full Address:</span>
                  <span className="font-mono text-primary font-semibold">
                    https://{cleanInput}.arc.bd
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] pt-0.5">
                  <span className={isValidLength ? "text-emerald-400 font-medium" : "text-muted-foreground"}>
                    {isValidLength ? "✓" : "•"} 3–32 characters ({cleanInput.length}/32)
                  </span>
                  <span className={isHyphenValid ? "text-emerald-400 font-medium" : "text-amber-400"}>
                    {isHyphenValid ? "✓ No edge hyphens" : "• Cannot start/end with -"}
                  </span>
                </div>
              </div>
            )}

            {/* Quota reminder */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Account quota remaining:</span>
              <span className="font-mono font-semibold text-foreground">
                {remainingSlots} of {MAX_SUBDOMAINS} slot(s) free
              </span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowClaimDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={claiming || !isDomainFormatValid || remainingSlots === 0}
                className="flex-1 font-semibold"
              >
                {claiming && <Loader2 className="size-4 mr-2 animate-spin" />}
                Submit Claim
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete / Cancel Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              {deleteTarget?.status === "pending"
                ? `Cancel Claim for ${deleteTarget?.full_domain}?`
                : `Delete ${deleteTarget?.full_domain}?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {deleteTarget?.status === "pending" ? (
                <>This will withdraw your pending claim for <strong>{deleteTarget?.full_domain}</strong> and return the name to the available pool. You will immediately regain 1 free subdomain slot.</>
              ) : (
                <>This will permanently delete <strong>{deleteTarget?.full_domain}</strong> and remove all DNS records from Cloudflare Edge. Connected websites and services will stop resolving immediately. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {deleteTarget?.status === "pending" ? "Keep Claim" : "Keep Subdomain"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              {deleting && <Loader2 className="size-4 mr-2 animate-spin" />}
              {deleteTarget?.status === "pending" ? "Cancel Claim" : "Delete Subdomain"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content Area: Loading / Empty / Grid / List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center text-destructive text-sm rounded-xl border border-destructive/20 bg-destructive/5">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center px-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-xs">
          <div className="size-12 rounded-xl bg-secondary flex items-center justify-center">
            <Globe className="size-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {subdomains.length === 0 ? "No subdomains claimed" : "No results found"}
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            {subdomains.length === 0
              ? "Claim a free .arc.bd subdomain to start routing traffic to your projects."
              : `No subdomains match "${search}". Try a different term or clear the filter.`}
          </p>
          {subdomains.length === 0 ? (
            <Button
              onClick={() => setShowClaimDialog(true)}
              size="sm"
              className="mt-2 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="size-3.5 mr-1.5" /> Claim Your First Domain
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-2 text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((domain) => {
            const hasDns = domain.dns_records && domain.dns_records.length > 0;
            const target =
              domain.status === "pending"
                ? "Awaiting review"
                : domain.status === "suspended"
                ? "Suspended"
                : hasDns
                ? `${domain.dns_records![0].type} → ${domain.dns_records![0].content}`
                : "No DNS records";

            return (
              <div
                key={domain.id}
                className="border border-border/60 bg-card hover:border-border transition-all group flex flex-col justify-between rounded-xl shadow-xs overflow-hidden"
              >
                <div className="p-4 sm:p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-all border ${
                      domain.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20"
                        : domain.status === "pending"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      <Globe className="size-4" />
                    </div>
                    <StatusBadge status={domain.status} />
                  </div>
                  <div className="pt-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link
                        href={`/dashboard/domains/${domain.id}`}
                        className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors tracking-tight"
                      >
                        {domain.full_domain}
                      </Link>
                      <button
                        onClick={(e) => handleCopy(domain.full_domain, e)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-1 rounded-full touch-manipulation shrink-0"
                        aria-label={`Copy https://${domain.full_domain}`}
                      >
                        {copiedDomain === domain.full_domain ? (
                          <Check className="size-3 text-emerald-400" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-1 truncate">
                      {target}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/50 flex items-center justify-between gap-2 py-2.5 px-4 sm:px-5 bg-muted/20">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formatDate(domain.created_at)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 text-xs gap-1.5 px-3.5 rounded-full bg-transparent hover:bg-secondary border-border/60 transition-all font-medium ${
                        domain.status === "active"
                          ? "text-foreground"
                          : "text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                      }`}
                      asChild
                    >
                      <Link href={`/dashboard/domains/${domain.id}`}>
                        {domain.status === "active" ? (
                          <Settings className="size-3.5 text-muted-foreground" />
                        ) : (
                          <Lock className="size-3.5 text-amber-400" />
                        )}
                        <span>Configure</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => setDeleteTarget(domain)}
                      aria-label={`Delete ${domain.full_domain}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Table View */
        <div className="bg-card flex min-w-0 flex-col rounded-xl border border-border/60 shadow-xs overflow-hidden">
          {/* Mobile View: Clean Card Rows */}
          <div className="divide-y divide-border/50 sm:hidden">
            {filtered.map((domain) => {
              const hasDns = domain.dns_records && domain.dns_records.length > 0;
              const target =
                domain.status === "pending"
                  ? "Awaiting review"
                  : domain.status === "suspended"
                  ? "Suspended"
                  : hasDns
                  ? `${domain.dns_records![0].type} → ${domain.dns_records![0].content}`
                  : "No DNS records";

              return (
                <div key={domain.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors">
                  {/* Row 1: Domain + Status */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`size-8.5 rounded-full flex items-center justify-center shrink-0 transition-all border ${
                        domain.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : domain.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        <Globe className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Link
                            href={`/dashboard/domains/${domain.id}`}
                            className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors tracking-tight"
                          >
                            {domain.full_domain}
                          </Link>
                          <button
                            onClick={(e) => handleCopy(domain.full_domain, e)}
                            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-secondary transition-colors shrink-0"
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
                          {target}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <StatusBadge status={domain.status} />
                    </div>
                  </div>

                  {/* Row 2: Date + Actions */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs">
                    <span className="text-muted-foreground/70 font-mono text-[11px]">
                      {formatDate(domain.created_at)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 px-3.5 text-xs gap-1.5 font-medium rounded-full border border-border/60 bg-transparent hover:bg-secondary transition-all ${
                          domain.status === "active"
                            ? "text-foreground"
                            : "text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                        }`}
                        asChild
                      >
                        <Link href={`/dashboard/domains/${domain.id}`}>
                          {domain.status === "active" ? (
                            <Settings className="size-3.5 text-muted-foreground" />
                          ) : (
                            <Lock className="size-3.5 text-amber-400" />
                          )}
                          <span>Configure</span>
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => setDeleteTarget(domain)}
                        aria-label={`Delete ${domain.full_domain}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Full Data Table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60 bg-muted/20">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold py-3.5 px-5">Domain Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold py-3.5 px-5">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold py-3.5 px-5">DNS Target</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold hidden md:table-cell py-3.5 px-5">Created</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold text-right py-3.5 px-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((domain) => {
                  const hasDns = domain.dns_records && domain.dns_records.length > 0;
                  const target =
                    domain.status === "pending"
                      ? "—"
                      : domain.status === "suspended"
                      ? "Suspended"
                      : hasDns
                      ? `${domain.dns_records![0].type} → ${domain.dns_records![0].content}`
                      : "No records";

                  return (
                    <TableRow key={domain.id} className="border-border/50 hover:bg-muted/20 transition-colors group">
                      {/* Domain Name Cell */}
                      <TableCell className="font-medium text-foreground py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`size-8.5 rounded-full flex items-center justify-center shrink-0 transition-all border ${
                            domain.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20"
                              : domain.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            <Globe className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/dashboard/domains/${domain.id}`}
                                className="text-sm font-semibold truncate hover:text-primary transition-colors tracking-tight"
                              >
                                {domain.full_domain}
                              </Link>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => handleCopy(domain.full_domain, e)}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-1 rounded-full hover:bg-secondary touch-manipulation cursor-pointer"
                                    aria-label={`Copy https://${domain.full_domain}`}
                                  >
                                    {copiedDomain === domain.full_domain ? (
                                      <Check className="size-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="size-3" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {copiedDomain === domain.full_domain ? "Copied to clipboard!" : "Copy domain URL"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <span className="text-xs text-muted-foreground sm:hidden block truncate mt-0.5">
                              {target}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status Cell */}
                      <TableCell className="py-3.5 px-5">
                        <StatusBadge status={domain.status} />
                      </TableCell>

                      {/* DNS Target Cell */}
                      <TableCell className="text-xs max-w-[220px] truncate py-3.5 px-5">
                        {domain.status === "pending" ? (
                          <span className="text-amber-400/80 font-mono text-xs">Awaiting approval</span>
                        ) : hasDns ? (
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
                              {domain.dns_records![0].type}
                            </span>
                            <span className="text-muted-foreground truncate">{domain.dns_records![0].content}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-xs">No records configured</span>
                        )}
                      </TableCell>

                      {/* Created Date Cell */}
                      <TableCell className="text-[11px] text-muted-foreground hidden md:table-cell py-3.5 px-5">
                        {formatDate(domain.created_at)}
                      </TableCell>

                      {/* Actions Cell */}
                      <TableCell className="text-right py-3.5 px-5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Configure Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 text-xs gap-1.5 px-3.5 font-medium rounded-full border border-border/60 bg-transparent hover:bg-secondary transition-all ${
                              domain.status === "active"
                                ? "text-foreground"
                                : "text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                            }`}
                            asChild
                          >
                            <Link href={`/dashboard/domains/${domain.id}`}>
                              {domain.status === "active" ? (
                                <Settings className="size-3.5 text-muted-foreground" />
                              ) : (
                                <Lock className="size-3.5 text-amber-400" />
                              )}
                              <span>Configure</span>
                            </Link>
                          </Button>

                          {/* Delete Trigger */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full"
                                onClick={() => setDeleteTarget(domain)}
                                aria-label={`Delete ${domain.full_domain}`}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              Delete Subdomain
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DomainsList() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading subdomains...
        </div>
      }
    >
      <DomainsListInner />
    </Suspense>
  );
}
