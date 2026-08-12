"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, ShieldAlert, Loader2, CheckCircle2, Globe, Server, Code } from "lucide-react";
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
      return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 capitalize">Pending</Badge>;
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
  const [recordTarget, setRecordTarget] = useState("");
  const [recordName, setRecordName] = useState("");
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

  const handleAddDNS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain || !recordTarget.trim()) return;
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
          content: recordTarget.trim(),
          // For TXT records, allow a name prefix (e.g. "_vercel")
          ...(recordType === "TXT" && recordName.trim() ? { name_prefix: recordName.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add DNS record");
      }
      setRecordTarget("");
      setRecordName("");
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
    if (!deleteRecordId) return;
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

  const applyPreset = async (type: "A" | "CNAME", target: string) => {
    setRecordType(type);
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
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
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{subdomain?.full_domain}</h1>
              <p className="text-xs text-muted-foreground">Manage Cloudflare DNS and routing configuration</p>
            </div>
          </div>
          <StatusBadge status={subdomain?.status || "pending"} />
        </div>
      </div>

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
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Setup Presets</CardTitle>
          <CardDescription>One-click presets for popular hosting platforms.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => applyPreset("CNAME", "cname.vercel-dns.com")}
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left group"
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20">
              <Server className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Vercel Deployment</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Points CNAME to <code className="text-foreground">cname.vercel-dns.com</code></p>
            </div>
          </button>

          <button
            onClick={() => applyPreset("CNAME", "your-username.github.io")}
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left group"
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20">
              <Code className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">GitHub Pages</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Points CNAME to <code className="text-foreground">username.github.io</code></p>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* DNS Records */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-base font-semibold">DNS Records</CardTitle>
            <CardDescription>Manage active DNS routing entries for this domain.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="size-4 mr-1.5" /> {showAddForm ? "Close Form" : "Add Record"}
          </Button>
        </CardHeader>

        {showAddForm && (
          <form onSubmit={handleAddDNS} className="p-4 bg-muted/20 border-b border-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Record Type</label>
                <Select value={recordType} onValueChange={(val) => { setRecordType(val as "A" | "CNAME" | "TXT"); setRecordName(""); }}>
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

              {/* Name field — only shown for TXT to allow prefixes like _vercel */}
              {recordType === "TXT" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name <span className="text-muted-foreground/60">(optional prefix)</span></label>
                  <Input
                    placeholder="_vercel"
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {recordType === "A" ? "IPv4 Target Address" : recordType === "TXT" ? "TXT Record Value" : "Target Hostname"}
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
                  className="h-9"
                />
              </div>

              <Button type="submit" disabled={addingRecord} className="h-9">
                {addingRecord ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                Save Record
              </Button>
            </div>

          </form>
        )}

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Type</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Name</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Target Content</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold">TTL</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subdomain?.dns_records && subdomain.dns_records.length > 0 ? (
                subdomain.dns_records.map((rec) => (
                  <TableRow key={rec.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-semibold text-primary">{rec.type}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{rec.name || subdomain.full_domain}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground">{rec.content}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Auto</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteRecordId(rec.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">
                    No DNS records configured. Click "Add Record" to configure routing.
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
