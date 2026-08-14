"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  Globe, 
  Server, 
  GitBranch, 
  Lock, 
  Clock,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DNSRecord {
  id: string;
  type: "A" | "CNAME" | "TXT";
  name?: string;
  content: string;
  ttl: number;
}

interface SubdomainDetail {
  id: string;
  name: string;
  full_domain: string;
  status: "pending" | "active" | "suspended" | "deleted";
  created_at: string;
  dns_records?: DNSRecord[];
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium cursor-default select-none shadow-2xs">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium cursor-default select-none shadow-2xs">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium cursor-default select-none">
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium capitalize">
          {status}
        </span>
      );
  }
}

export default function DomainDetail() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;

  const [subdomain, setSubdomain] = useState<SubdomainDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedRecordId, setCopiedRecordId] = useState<string | null>(null);

  // New DNS Record form
  const [recordType, setRecordType] = useState<"A" | "CNAME" | "TXT">("CNAME");
  const [recordName, setRecordName] = useState("@");
  const [recordTarget, setRecordTarget] = useState("");
  const [addingRecord, setAddingRecord] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Deletion dialogs
  const [deleteSubdomainOpen, setDeleteSubdomainOpen] = useState(false);
  const [deletingSubdomain, setDeletingSubdomain] = useState(false);
  const [deleteRecordTarget, setDeleteRecordTarget] = useState<DNSRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState(false);

  const fetchDomain = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/subdomains/${domainId}`);
      if (!res.ok) {
        throw new Error("Failed to load subdomain details");
      }
      const data = await res.json();
      setSubdomain(data);
    } catch (err: any) {
      setError(err.message || "Failed to load subdomain details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (domainId) fetchDomain();
  }, [domainId]);

  const isPending = subdomain?.status === "pending";
  const isSuspended = subdomain?.status === "suspended";
  const isLocked = isPending || isSuspended;

  const handleCopyDomain = () => {
    if (!subdomain?.full_domain) return;
    navigator.clipboard.writeText(`https://${subdomain.full_domain}`);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleCopyRecord = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedRecordId(id);
    setTimeout(() => setCopiedRecordId(null), 2000);
  };

  const handleAddDNS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain || !recordTarget.trim()) return;
    if (isLocked) {
      setError("DNS management is locked until your domain claim is verified by an administrator.");
      return;
    }

    setAddingRecord(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain_id: subdomain.id,
          type: recordType,
          name: recordName.trim() || "@",
          content: recordTarget.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add DNS record");
      }
      setRecordTarget("");
      setRecordName("@");
      setShowAddForm(false);
      setSuccessMsg("DNS record created and synced to Cloudflare Edge.");
      fetchDomain();
    } catch (err: any) {
      setError(err.message || "Failed to add DNS record");
    } finally {
      setAddingRecord(false);
    }
  };

  const handleDeleteDNS = async () => {
    if (!deleteRecordTarget || isLocked) return;
    setDeletingRecord(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/dns/${deleteRecordTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete record");
      }
      setSuccessMsg("DNS record removed from Cloudflare Edge.");
      setDeleteRecordTarget(null);
      fetchDomain();
    } catch (err: any) {
      setError(err.message || "Failed to delete DNS record");
    } finally {
      setDeletingRecord(false);
    }
  };

  const handleDeleteSubdomain = async () => {
    if (!subdomain) return;
    setDeletingSubdomain(true);
    try {
      const res = await fetch(`/api/subdomains/${subdomain.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete subdomain");
      }
      router.push("/dashboard/domains");
    } catch (err: any) {
      setError(err.message || "Failed to delete subdomain");
      setDeletingSubdomain(false);
    }
  };

  const applyPreset = (type: "A" | "CNAME" | "TXT", target: string, name: string = "@") => {
    if (isLocked) return;
    setRecordType(type);
    setRecordName(name);
    setRecordTarget(target);
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error && !subdomain) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 py-8">
        <Alert variant="destructive" className="rounded-xl">
          <AlertTitle>Error Loading Subdomain</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/domains">
            <ArrowLeft className="size-4 mr-2" /> Back to My Subdomains
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/domains"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium mb-3 group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to My Subdomains</span>
        </Link>

        {/* Domain Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-10 rounded-xl bg-secondary/80 flex items-center justify-center shrink-0 border border-border/80">
              <Globe className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                  {subdomain?.full_domain}
                </h1>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleCopyDomain}
                      className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors"
                      aria-label="Copy subdomain URL to clipboard"
                    >
                      {copiedDomain ? (
                        <Check className="size-4 text-emerald-400" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {copiedDomain ? "Copied to clipboard!" : "Copy domain URL"}
                  </TooltipContent>
                </Tooltip>

                {subdomain?.status === "active" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://${subdomain?.full_domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors"
                        aria-label="Open live site in new tab"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Visit live site
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cloudflare Edge DNS &amp; Traffic Routing Configuration
              </p>
            </div>
          </div>
          <StatusBadge status={subdomain?.status || "pending"} />
        </div>
      </div>

      {/* Security Status Banner for Pending Review */}
      {isPending && (
        <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-300 p-4 sm:p-5 shadow-sm rounded-xl">
          <div className="flex items-start gap-3.5">
            <div className="size-9 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="size-4.5 text-amber-400" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <AlertTitle className="text-amber-300 font-semibold text-sm sm:text-base">
                  Domain Claim Pending Administrator Approval
                </AlertTitle>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] px-2 py-0.5">
                  <Clock className="size-3 mr-1 inline" /> Under Review
                </Badge>
              </div>
              <AlertDescription className="text-amber-200/90 text-xs sm:text-sm leading-relaxed">
                Your claim for <strong>{subdomain?.full_domain}</strong> is queued for security verification. For anti-abuse safeguards, <strong>DNS record management is locked</strong> until approved.
                <span className="block mt-1 text-amber-300/80 text-xs">
                  Reviews are typically processed within 24 hours. Controls unlock automatically once approved.
                </span>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Security Status Banner for Suspended */}
      {isSuspended && (
        <Alert variant="destructive" className="p-4 sm:p-5 shadow-sm rounded-xl">
          <div className="flex items-start gap-3.5">
            <div className="size-9 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="size-4.5 text-destructive" />
            </div>
            <div className="space-y-1">
              <AlertTitle className="font-semibold text-sm sm:text-base">Domain Suspended</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                This domain has been suspended for policy or security reasons. DNS routing is disabled. Contact <a href="mailto:admin@arc.bd" className="underline font-semibold">admin@arc.bd</a> for assistance.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Action Notifications */}
      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="size-4" />
          <AlertTitle>Action Failed</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <AlertTitle className="text-emerald-400 font-semibold">Success</AlertTitle>
          <AlertDescription className="text-xs">{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Quick Setup Presets (Distilled) */}
      <div className={`space-y-2.5 ${isLocked ? "opacity-60 pointer-events-none select-none" : ""}`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Setup Presets
          </p>
          {isLocked && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Lock className="size-3" /> Unlocks upon verification
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Preset 1: Vercel */}
          <button
            onClick={() => applyPreset("CNAME", "cname.vercel-dns.com", "@")}
            disabled={isLocked}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/80 bg-card hover:bg-secondary/60 hover:border-border transition-all text-left group disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Server className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs text-foreground">Vercel</h3>
              <p className="text-[11px] text-muted-foreground truncate font-mono">cname.vercel-dns.com</p>
            </div>
          </button>

          {/* Preset 2: GitHub Pages */}
          <button
            onClick={() => applyPreset("CNAME", "username.github.io", "@")}
            disabled={isLocked}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/80 bg-card hover:bg-secondary/60 hover:border-border transition-all text-left group disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <GitBranch className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs text-foreground">GitHub Pages</h3>
              <p className="text-[11px] text-muted-foreground truncate font-mono">username.github.io</p>
            </div>
          </button>

          {/* Preset 3: Netlify */}
          <button
            onClick={() => applyPreset("CNAME", "site.netlify.app", "@")}
            disabled={isLocked}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/80 bg-card hover:bg-secondary/60 hover:border-border transition-all text-left group disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Globe className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs text-foreground">Netlify</h3>
              <p className="text-[11px] text-muted-foreground truncate font-mono">site.netlify.app</p>
            </div>
          </button>

          {/* Preset 4: Custom VPS */}
          <button
            onClick={() => applyPreset("A", "185.199.108.153", "@")}
            disabled={isLocked}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/80 bg-card hover:bg-secondary/60 hover:border-border transition-all text-left group disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Layers className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs text-foreground">Custom Server</h3>
              <p className="text-[11px] text-muted-foreground truncate font-mono">IPv4 Address</p>
            </div>
          </button>
        </div>
      </div>

      {/* DNS Records Card */}
      <Card className="border-border/80 shadow-xs rounded-xl overflow-hidden bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/70 pb-3.5 p-4 sm:p-5 gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              DNS Records
              {isLocked && (
                <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px] font-mono">
                  <Lock className="size-3 mr-1" /> Controls Locked
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {isLocked 
                ? "DNS record management is locked while your claim is pending review."
                : "Active edge routing records synchronized with Cloudflare."}
            </CardDescription>
          </div>
          <Button 
            onClick={() => !isLocked && setShowAddForm(!showAddForm)} 
            disabled={isLocked}
            className="h-8.5 px-3.5 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-md gap-1.5 shadow-xs transition-all w-full sm:w-auto"
          >
            <Plus className="size-3.5" />
            <span>{showAddForm ? "Close Form" : "Add Record"}</span>
          </Button>
        </CardHeader>

        {showAddForm && !isLocked && (
          <form onSubmit={handleAddDNS} className="p-4 bg-muted/20 border-b border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Record Type</label>
                <Select value={recordType} onValueChange={(val) => setRecordType(val as "A" | "CNAME" | "TXT")}>
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNAME">CNAME (Hostname Alias)</SelectItem>
                    <SelectItem value="A">A (IPv4 Address)</SelectItem>
                    <SelectItem value="TXT">TXT (Verification String)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Host / Name</label>
                <Input
                  placeholder="@ or _vercel"
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {recordType === "A" ? "Target IPv4 Address" : recordType === "TXT" ? "Verification Text Value" : "Target Hostname"}
                </label>
                <Input
                  required
                  placeholder={
                    recordType === "A" ? "185.199.108.153" :
                    recordType === "TXT" ? "vc-domain-verify=..." :
                    "cname.vercel-dns.com"
                  }
                  value={recordTarget}
                  onChange={(e) => setRecordTarget(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" disabled={addingRecord} className="h-9 w-full text-xs font-semibold bg-foreground text-background hover:bg-foreground/90">
                  {addingRecord ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                  Save Record
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tip: Use <code className="text-foreground bg-muted px-1 py-0.5 rounded font-mono">@</code> for root domain, or a prefix like <code className="text-foreground bg-muted px-1 py-0.5 rounded font-mono">_vercel</code> for domain verification.
            </p>
          </form>
        )}

        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/70 bg-muted/20">
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold py-3 px-4 whitespace-nowrap">Type</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold py-3 px-4 whitespace-nowrap">Host / Name</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold py-3 px-4 whitespace-nowrap">Target Content</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold py-3 px-4 whitespace-nowrap">TTL</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold text-right py-3 px-4 whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-sm">
                    <div className="flex flex-col items-center justify-center gap-2 py-6">
                      <div className="size-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Lock className="size-4.5 text-amber-400" />
                      </div>
                      <p className="font-semibold text-foreground text-sm">DNS Management Locked (Pending Approval)</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        You will be able to create and manage DNS routing records as soon as an administrator approves your domain claim.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : subdomain?.dns_records && subdomain.dns_records.length > 0 ? (
                subdomain.dns_records.map((rec) => (
                  <TableRow key={rec.id} className="border-border/60 hover:bg-muted/30 group">
                    <TableCell className="font-semibold text-primary whitespace-nowrap py-3.5 px-4">
                      <Badge variant="outline" className="font-mono text-[11px] bg-primary/10 text-primary border-primary/20">
                        {rec.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground font-medium whitespace-nowrap py-3.5 px-4">
                      {rec.name || subdomain?.full_domain}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-xs truncate whitespace-nowrap py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{rec.content}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleCopyRecord(rec.content, rec.id)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-0.5 rounded"
                              aria-label={`Copy ${rec.content}`}
                            >
                              {copiedRecordId === rec.id ? (
                                <Check className="size-3 text-emerald-400" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {copiedRecordId === rec.id ? "Copied!" : "Copy content"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-3.5 px-4">Auto (Edge)</TableCell>
                    <TableCell className="text-right py-3.5 px-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLocked}
                            className="size-7.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 whitespace-nowrap disabled:opacity-50"
                            onClick={() => setDeleteRecordTarget(rec)}
                            aria-label={`Delete ${rec.type} record`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Delete Record
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-xs">
                    <p className="font-medium text-foreground text-sm mb-1">No DNS records configured</p>
                    Click &quot;Add Record&quot; or select a Quick Setup Preset above to configure traffic routing for this subdomain.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Danger Zone (Distilled) */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5 gap-3">
          <div>
            <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <ShieldAlert className="size-4" /> Delete Subdomain
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete <strong className="text-foreground">{subdomain?.full_domain}</strong> and release all active Cloudflare DNS records.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteSubdomainOpen(true)}
            className="h-8.5 px-3.5 text-xs font-semibold rounded-md shrink-0 gap-1.5"
          >
            <Trash2 className="size-3.5" />
            <span>Delete Subdomain</span>
          </Button>
        </div>
      </div>

      {/* Delete Record Alert Dialog */}
      <AlertDialog open={!!deleteRecordTarget} onOpenChange={() => setDeleteRecordTarget(null)}>
        <AlertDialogContent className="border-border bg-card shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Delete {deleteRecordTarget?.type} Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Removing this record will immediately stop traffic routing to <strong>{deleteRecordTarget?.content}</strong> on Cloudflare Edge. Connected services will become unreachable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Record</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDNS}
              disabled={deletingRecord}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              {deletingRecord && <Loader2 className="size-4 mr-2 animate-spin" />}
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Subdomain Alert Dialog */}
      <AlertDialog open={deleteSubdomainOpen} onOpenChange={setDeleteSubdomainOpen}>
        <AlertDialogContent className="border-border bg-card shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Delete {subdomain?.full_domain}?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This will permanently delete <strong>{subdomain?.full_domain}</strong> and release all DNS records from Cloudflare. Visitors will see an error, and the name will become available for others to claim. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subdomain</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubdomain}
              disabled={deletingSubdomain}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              {deletingSubdomain && <Loader2 className="size-4 mr-2 animate-spin" />}
              Delete Subdomain
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
