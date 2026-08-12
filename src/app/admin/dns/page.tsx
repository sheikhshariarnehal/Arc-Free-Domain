"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CFRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

export default function AdminRootDNSPage() {
  const [records, setRecords] = useState<CFRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New record form
  const [type, setType] = useState("TXT");
  const [name, setName] = useState("_vercel");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dns/root");
      if (!res.ok) throw new Error("Failed to fetch DNS records");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/dns/root", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add record");
      setSuccess(`✓ ${type} record "${name}" added successfully!`);
      setContent("");
      fetchRecords();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/dns/root", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete record");
      setSuccess("Record deleted.");
      fetchRecords();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Root Zone DNS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Cloudflare DNS records for the root <strong>arc.bd</strong> zone.
            Use this to add Vercel TXT verification records and other platform-level DNS entries.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading}>
          <RefreshCw className={`size-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Vercel helper tip */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-400">🔑 Vercel Domain Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>To verify Vercel domain ownership for <code className="bg-muted px-1 rounded">*.arc.bd</code> subdomains:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Vercel shows: <code className="bg-muted px-1 rounded">TXT _vercel vc-domain-verify=arc.bd,...</code></li>
            <li>Add it below with Type=<strong>TXT</strong>, Name=<strong>_vercel</strong>, Value=the full <code>vc-domain-verify=...</code> string</li>
            <li>Wait ~1 minute, then click Verify in Vercel</li>
          </ol>
        </CardContent>
      </Card>

      {/* Add Record Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Root DNS Record</CardTitle>
          <CardDescription>Directly adds a record to the arc.bd Cloudflare zone</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-32">
              <label className="text-xs text-muted-foreground mb-1.5 block">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TXT">TXT</SelectItem>
                  <SelectItem value="CNAME">CNAME</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="MX">MX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <label className="text-xs text-muted-foreground mb-1.5 block">Name</label>
              <Input className="h-9" value={name} onChange={e => setName(e.target.value)} placeholder="_vercel" required />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">Value</label>
              <Input className="h-9" value={content} onChange={e => setContent(e.target.value)} placeholder="vc-domain-verify=arc.bd,..." required />
            </div>
            <Button type="submit" className="h-9 shrink-0" disabled={adding}>
              {adding ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Plus className="size-4 mr-1.5" />}
              Add Record
            </Button>
          </form>

          {error && <p className="mt-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2">{error}</p>}
          {success && <p className="mt-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded px-3 py-2">{success}</p>}
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="size-4" /> Live Cloudflare Records
          </CardTitle>
          <CardDescription>All DNS records currently in the arc.bd Cloudflare zone</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin mr-2" /> Loading records...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{r.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{r.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground max-w-xs truncate">{r.content}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                      >
                        {deletingId === r.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
