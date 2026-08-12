"use client";

import { useEffect, useState } from "react";
import { Layers, Plus, Trash2, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface CloudflareRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

export default function AdminRootDNS() {
  const [records, setRecords] = useState<CloudflareRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<"A" | "CNAME" | "TXT">("TXT");
  const [name, setName] = useState("_vercel.arc.bd");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dns");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch Cloudflare DNS records");
      }
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim(),
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create record");
      }
      setSuccessMsg(`Root DNS record ${name} created successfully!`);
      setContent("");
      fetchRecords();
    } catch (err: any) {
      setError(err.message || "Failed to create DNS record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this root DNS record from Cloudflare?")) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/dns?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete record");
      }
      setSuccessMsg("Root DNS record deleted successfully.");
      fetchRecords();
    } catch (err: any) {
      setError(err.message || "Failed to delete record");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers className="size-6 text-primary" /> Root Zone DNS Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Cloudflare zone records directly for <code className="text-foreground font-mono">arc.bd</code> (e.g. root TXT verification records like <code className="text-foreground font-mono">_vercel.arc.bd</code>).
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
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

      {/* Add Record Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Add Root / Verification DNS Record</CardTitle>
          <CardDescription>
            Add TXT, CNAME, or A records directly to the Cloudflare root zone for domain verification or system routing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddRecord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Record Type</label>
                <Select value={type} onValueChange={(val) => setType(val as "A" | "CNAME" | "TXT")}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TXT">TXT (Verification / SPF)</SelectItem>
                    <SelectItem value="CNAME">CNAME (Hostname Alias)</SelectItem>
                    <SelectItem value="A">A (IPv4 Address)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name / Host</label>
                <Input
                  required
                  placeholder="_vercel.arc.bd or arc.bd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content / Value</label>
                <Input
                  required
                  placeholder="vc-domain-verify=arc.bd,..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting} className="h-9 w-full">
                  {submitting ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Plus className="size-4 mr-1.5" />}
                  Add Record
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Cloudflare Zone Records Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Active Cloudflare Zone Records</CardTitle>
            <CardDescription>Live DNS entries in your Cloudflare zone.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
            Refresh Records
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Type</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Name</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Content</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Proxied</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length > 0 ? (
                  records.map((rec) => (
                    <TableRow key={rec.id} className="border-border hover:bg-muted/30">
                      <TableCell className="font-semibold text-primary">{rec.type}</TableCell>
                      <TableCell className="font-mono text-xs text-foreground font-medium">{rec.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-sm truncate">{rec.content}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{rec.proxied ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteRecord(rec.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                      No records found in Cloudflare zone.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
