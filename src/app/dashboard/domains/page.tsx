"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Globe, Plus, Search, Loader2, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 capitalize">Active</Badge>;
    case "pending":
      return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 capitalize">Pending</Badge>;
    case "suspended":
      return <Badge variant="destructive" className="capitalize">Suspended</Badge>;
    default:
      return <Badge variant="outline" className="capitalize">{status}</Badge>;
  }
}

const MAX_SUBDOMAINS = 5;

function DomainsListInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subdomains, setSubdomains] = useState<SubdomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [claimInput, setClaimInput] = useState("");
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [autoClaiming, setAutoClaiming] = useState(false);
  const [autoClaimMsg, setAutoClaimMsg] = useState<string | null>(null);

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

  // Auto-claim a domain passed via ?claim= after OAuth redirect
  useEffect(() => {
    const claimName = searchParams.get("claim");
    if (!claimName) {
      fetchSubdomains();
      return;
    }

    // Remove ?claim= from URL immediately so refresh doesn't re-trigger
    router.replace("/dashboard/domains");

    const autoClaim = async () => {
      setAutoClaiming(true);
      setAutoClaimMsg(`Claiming ${claimName}.arc.bd for you...`);
      try {
        const res = await fetch("/api/subdomains/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: claimName }),
        });
        const data = await res.json();
        if (res.ok) {
          setAutoClaimMsg(`✓ ${claimName}.arc.bd claimed successfully!`);
        } else {
          setAutoClaimMsg(`Could not claim ${claimName}.arc.bd: ${data.error || "Already taken"}`);
        }
      } catch {
        setAutoClaimMsg(`Could not claim ${claimName}.arc.bd. Please try again.`);
      } finally {
        setAutoClaiming(false);
        fetchSubdomains();
        // Clear message after 5 seconds
        setTimeout(() => setAutoClaimMsg(null), 5000);
      }
    };

    autoClaim();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput.trim()) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const res = await fetch("/api/subdomains/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: claimInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim subdomain");
      setClaimInput("");
      setShowClaimDialog(false);
      fetchSubdomains();
    } catch (err: any) {
      setClaimError(err.message || "Failed to claim subdomain");
    } finally {
      setClaiming(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/subdomains/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchSubdomains();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = subdomains.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.full_domain.toLowerCase().includes(search.toLowerCase())
  );

  const usedSlots = subdomains.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Subdomains</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your .arc.bd subdomains and DNS records.
          </p>
        </div>
        <Button
          onClick={() => setShowClaimDialog(true)}
          disabled={usedSlots >= MAX_SUBDOMAINS}
        >
          <Plus className="size-4 mr-1.5" />
          {usedSlots >= MAX_SUBDOMAINS ? "Limit Reached" : "Claim New"}

        </Button>
      </div>

      {/* Auto-claim status banner (shown after OAuth redirect) */}
      {autoClaimMsg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border ${
          autoClaiming
            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
            : autoClaimMsg.startsWith("✓")
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-destructive/10 border-destructive/30 text-destructive"
        }`}>
          {autoClaiming && <Loader2 className="size-4 animate-spin shrink-0" />}
          {autoClaimMsg}
        </div>
      )}

      {/* Claim Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim a New Subdomain</DialogTitle>
            <DialogDescription>
              Enter a subdomain name to register under <strong>.arc.bd</strong>. You have{" "}
              {MAX_SUBDOMAINS - usedSlots} slot(s) remaining.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClaim} className="space-y-4 pt-2">
            {claimError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">
                {claimError}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                required
                placeholder="my-cool-site"
                value={claimInput}
                onChange={(e) =>
                  setClaimInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground font-mono whitespace-nowrap">.arc.bd</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowClaimDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={claiming}>
                {claiming && <Loader2 className="size-4 mr-2 animate-spin" />}
                Claim Free
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subdomain?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the subdomain and all its DNS records from Cloudflare. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="size-4 mr-2 animate-spin" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subdomains Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-base font-semibold">All Subdomains</CardTitle>
            <CardDescription>
              {usedSlots} of {MAX_SUBDOMAINS} slots used
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search domains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-48 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Globe className="size-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No subdomains found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {subdomains.length === 0
                  ? "You haven't claimed any .arc.bd subdomains yet. Click \"Claim New\" to get started!"
                  : "No results match your search."}
              </p>
              {subdomains.length === 0 && (
                <Button onClick={() => setShowClaimDialog(true)} size="sm" className="mt-1">
                  <Plus className="size-3.5 mr-1.5" /> Claim Your First Domain
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Domain Name</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold hidden sm:table-cell">Target / DNS</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold hidden md:table-cell">Claimed</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((domain) => {
                  const target =
                    domain.dns_records && domain.dns_records.length > 0
                      ? `${domain.dns_records[0].type}: ${domain.dns_records[0].content}`
                      : "No DNS records";
                  return (
                    <TableRow key={domain.id} className="border-border hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
                            <Globe className="size-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-sm">{domain.full_domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={domain.status} />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell max-w-[200px] truncate">
                        {target}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                        {formatDate(domain.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                            <Link href={`/dashboard/domains/${domain.id}`}>
                              <ExternalLink className="size-3 mr-1" /> Manage
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(domain.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DomainsList() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-5 animate-spin mr-2" /> Loading...
      </div>
    }>
      <DomainsListInner />
    </Suspense>
  );
}
