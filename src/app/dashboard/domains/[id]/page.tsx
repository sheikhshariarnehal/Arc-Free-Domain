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
  Code, 
  GitBranch, 
  Lock, 
  Clock 
} from "lucide-react";
import Link from "next/link";
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
      return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 capitalize">Active</Badge>;
    case "pending":
      return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 capitalize">Pending Review</Badge>;
    case "suspended":
      return <Badge variant="destructive" className="capitalize">Suspended</Badge>;
    default:
      return <Badge variant="outline" className="capitalize">{status}</Badge>;
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

  // New DNS Record form
  const [recordType, setRecordType] = useState<"A" | "CNAME" | "TXT">("CNAME");
  const [recordName, setRecordName] = useState("@");
  const [recordTarget, setRecordTarget] = useState("");
  const [addingRecord, setAddingRecord] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Deletion dialogs
  const [deleteSubdomainOpen, setDeleteSubdomainOpen] = useState(false);
  const [deletingSubdomain, setDeletingSubdomain] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
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
      setError(err.message || "Failed to load subdomain");
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

  const handleAddDNS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain || !recordTarget.trim()) return;
    if (isLocked) {
      setError("DNS management is locked until your domain claim is approved by an administrator.");
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
      setSuccessMsg("DNS record added successfully!");
      fetchDomain();
    } catch (err: any) {
      setError(err.message || "Failed to add DNS record");
    } finally {
      setAddingRecord(false);
    }
  };

  const handleDeleteDNS = async () => {
    if (!deleteRecordId || isLocked) return;
    setDeletingRecord(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/dns/${deleteRecordId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete record");
      }
      setSuccessMsg("DNS record deleted successfully.");
      setDeleteRecordId(null);
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

  const applyPreset = async (type: "A" | "CNAME" | "TXT", target: string, name: string = "@") => {
    if (isLocked) return;
    setRecordType(type);
    setRecordName(name);
    setRecordTarget(target);
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error && !subdomain) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Subdomain</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/dashboard/domains">
            <ArrowLeft className="size-4 mr-2" /> Back to My Subdomains
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation & Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/domains">
            <ArrowLeft className="size-4 mr-1.5" /> Back to domains
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
              <Globe className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words">{subdomain?.full_domain}</h1>
              <p className="text-xs text-muted-foreground">Manage Cloudflare DNS and routing configuration</p>
            </div>
          </div>
          <StatusBadge status={subdomain?.status || "pending"} />
        </div>
      </div>

      {/* Security Status Banner for Pending Review */}
      {isPending && (
        <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-300 p-5">
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="size-5 text-amber-400" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertTitle className="text-amber-300 font-semibold text-base">
                  Domain Claim Pending Administrator Approval
                </AlertTitle>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] px-2 py-0.5">
                  <Clock className="size-3 mr-1 inline" /> Under Review
                </Badge>
              </div>
              <AlertDescription className="text-amber-200/90 text-sm leading-relaxed">
                Your claim for <strong>{subdomain?.full_domain}</strong> has been received and is queued for verification. For platform security and anti-abuse safeguards, <strong>DNS record management is locked</strong> until an administrator confirms your request.
                <br />
                <span className="text-xs text-amber-300/80 mt-1 block">
                  ✓ A confirmation email has been sent to your address. You will receive another notification as soon as DNS management is unlocked.
                </span>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Security Status Banner for Suspended */}
      {isSuspended && (
        <Alert variant="destructive" className="p-5">
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="size-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <AlertTitle className="font-semibold text-base">Domain Suspended</AlertTitle>
              <AlertDescription className="text-sm">
                This domain has been suspended by administrators. DNS routing and record modifications are locked. Contact <a href="mailto:admin@arc.bd" className="underline font-semibold">admin@arc.bd</a> for assistance.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Notifications */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Action Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <AlertTitle className="text-emerald-400 font-semibold">Success</AlertTitle>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Setup Presets */}
      <Card className={`border-border transition-opacity ${isLocked ? "opacity-60 pointer-events-none select-none" : ""}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Quick Setup Presets
                {isLocked && <Lock className="size-3.5 text-muted-foreground" />}
              </CardTitle>
              <CardDescription>
                {isLocked 
                  ? "Presets will unlock once this domain claim is approved."
                  : "One-click presets for popular hosting platforms."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => applyPreset("CNAME", "cname.vercel-dns.com", "@")}
            disabled={isLocked}
            className="flex flex-col items-start gap-2.5 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all text-left group disabled:cursor-not-allowed"
          >
            <div className="size-8 rounded-md bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
              <Server className="size-4 text-primary" />
            </div>
            <div className="w-full">
              <h3 className="font-semibold text-sm text-foreground">Vercel</h3>
              <p className="text-[11px] text-muted-foreground mt-1 break-words font-mono">@ → cname.vercel-dns.com</p>
            </div>
          </button>

          <button
            onClick={() => applyPreset("TXT", "vc-domain-verify=...", "_vercel")}
            disabled={isLocked}
            className="flex flex-col items-start gap-2.5 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all text-left group disabled:cursor-not-allowed"
          >
            <div className="size-8 rounded-md bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
              <Code className="size-4 text-primary" />
            </div>
            <div className="w-full">
              <h3 className="font-semibold text-sm text-foreground">Vercel Verification</h3>
              <p className="text-[11px] text-muted-foreground mt-1 break-words font-mono">_vercel → verification code</p>
            </div>
          </button>

          <button
            onClick={() => applyPreset("CNAME", "your-username.github.io", "@")}
            disabled={isLocked}
            className="flex flex-col items-start gap-2.5 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all text-left group disabled:cursor-not-allowed"
          >
            <div className="size-8 rounded-md bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
              <GitBranch className="size-4 text-primary" />
            </div>
            <div className="w-full">
              <h3 className="font-semibold text-sm text-foreground">GitHub Pages</h3>
              <p className="text-[11px] text-muted-foreground mt-1 break-words font-mono">@ → username.github.io</p>
            </div>
          </button>

          <button
            onClick={() => applyPreset("CNAME", "your-site.netlify.app", "@")}
            disabled={isLocked}
            className="flex flex-col items-start gap-2.5 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all text-left group disabled:cursor-not-allowed"
          >
            <div className="size-8 rounded-md bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
              <Globe className="size-4 text-primary" />
            </div>
            <div className="w-full">
              <h3 className="font-semibold text-sm text-foreground">Netlify</h3>
              <p className="text-[11px] text-muted-foreground mt-1 break-words font-mono">@ → your-site.netlify.app</p>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* DNS Records Card */}
      <Card className="border-border">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-4 gap-4">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              DNS Records
              {isLocked && (
                <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-[11px] font-normal">
                  <Lock className="size-3 mr-1" /> Controls Locked
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isLocked 
                ? "DNS record management is locked while your claim is pending review."
                : "Manage active DNS routing entries for this domain."}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => !isLocked && setShowAddForm(!showAddForm)} 
            disabled={isLocked}
            className="w-full sm:w-auto"
          >
            <Plus className="size-4 mr-1.5" /> {showAddForm ? "Close Form" : "Add Record"}
          </Button>
        </CardHeader>

        {showAddForm && !isLocked && (
          <form onSubmit={handleAddDNS} className="p-4 bg-muted/20 border-b border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Record Type</label>
                <Select value={recordType} onValueChange={(val) => setRecordType(val as "A" | "CNAME" | "TXT")}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNAME">CNAME (Hostname)</SelectItem>
                    <SelectItem value="A">A (IPv4 Address)</SelectItem>
                    <SelectItem value="TXT">TXT (Verification)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name / Host</label>
                <Input
                  placeholder="@ or _vercel"
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {recordType === "A" ? "IPv4 Address" : recordType === "TXT" ? "TXT Value" : "Target Hostname"}
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
                <Button type="submit" disabled={addingRecord} className="h-9 w-full">
                  {addingRecord ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                  Save Record
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tip: Use <code className="text-foreground bg-muted px-1 py-0.5 rounded font-mono">@</code> for root ({subdomain?.full_domain}), or prefix like <code className="text-foreground bg-muted px-1 py-0.5 rounded font-mono">_vercel</code> for TXT verification.
            </p>
          </form>
        )}

        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold whitespace-nowrap">Type</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold whitespace-nowrap">Name / Host</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold whitespace-nowrap">Target Content</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold whitespace-nowrap">TTL</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-sm">
                    <div className="flex flex-col items-center justify-center gap-2 py-6">
                      <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Lock className="size-5 text-amber-400" />
                      </div>
                      <p className="font-medium text-foreground text-sm">DNS Management Locked (Pending Approval)</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        You will be able to create and manage DNS routing records as soon as an administrator verifies and approves your domain claim.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : subdomain?.dns_records && subdomain.dns_records.length > 0 ? (
                subdomain.dns_records.map((rec) => (
                  <TableRow key={rec.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-semibold text-primary whitespace-nowrap">{rec.type}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground font-medium whitespace-nowrap">
                      {rec.name || subdomain?.full_domain}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-xs truncate whitespace-nowrap">{rec.content}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">Auto</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLocked}
                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 whitespace-nowrap disabled:opacity-50"
                        onClick={() => setDeleteRecordId(rec.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                    No DNS records configured. Click &quot;Add Record&quot; to configure routing.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
            <ShieldAlert className="size-5" /> Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete <strong className="text-foreground">{subdomain?.full_domain}</strong> and release all active Cloudflare DNS records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setDeleteSubdomainOpen(true)}
          >
            <Trash2 className="size-4 mr-2" /> Delete Subdomain
          </Button>
        </CardContent>
      </Card>

      {/* Delete Record Alert Dialog */}
      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete DNS Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the DNS record from Cloudflare. Traffic to this target will stop routing immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDNS}
              disabled={deletingRecord}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingRecord && <Loader2 className="size-4 mr-2 animate-spin" />}
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Subdomain Alert Dialog */}
      <AlertDialog open={deleteSubdomainOpen} onOpenChange={setDeleteSubdomainOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{subdomain?.full_domain}</strong> and remove all DNS records from Cloudflare. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubdomain}
              disabled={deletingSubdomain}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
