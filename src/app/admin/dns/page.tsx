"use client";

import { useEffect, useState } from "react";
import {
  Server,
  Plus,
  Trash2,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  Cpu
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PowerDNSRecordItem {
  content: string;
  disabled: boolean;
}

interface PowerDNSRRSet {
  name: string;
  type: string;
  ttl: number;
  records: PowerDNSRecordItem[];
  comments?: any[];
}

export default function AdminDNSManagement() {
  const [rrsets, setRrsets] = useState<PowerDNSRRSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [type, setType] = useState<"A" | "AAAA" | "CNAME" | "TXT" | "MX">("CNAME");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("300");
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/dns");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch PowerDNS records");
      }
      const data = await res.json();
      setRrsets(Array.isArray(data) ? data : []);
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

    let cleanName = name.trim().toLowerCase();
    if (!cleanName.endsWith(".arc.bd") && !cleanName.endsWith(".arc.bd.")) {
      cleanName = cleanName === "@" || cleanName === "" ? "arc.bd." : `${cleanName}.arc.bd.`;
    }

    try {
      const res = await fetch("/api/admin/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: cleanName,
          content: content.trim(),
          ttl: parseInt(ttl) || 300,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create record");
      }
      setSuccessMsg(`PowerDNS record ${cleanName} (${type}) created successfully!`);
      setName("");
      setContent("");
      fetchRecords();
    } catch (err: any) {
      setError(err.message || "Failed to create DNS record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordName: string, recordType: string) => {
    if (!confirm(`Are you sure you want to delete ${recordName} (${recordType}) from PowerDNS?`)) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/dns?name=${encodeURIComponent(recordName)}&type=${encodeURIComponent(recordType)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete record");
      }
      setSuccessMsg(`PowerDNS record ${recordName} deleted successfully.`);
      fetchRecords();
    } catch (err: any) {
      setError(err.message || "Failed to delete record");
    }
  };

  const filteredRecords = rrsets.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = r.name.toLowerCase().includes(q);
    const typeMatch = r.type.toLowerCase().includes(q);
    const contentMatch = r.records.some((rec) => rec.content.toLowerCase().includes(q));
    return nameMatch || typeMatch || contentMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Server Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Server className="size-6 text-primary" />
            Authoritative DNS Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Live PowerDNS Authoritative Zone Control for <code className="font-mono text-primary font-bold">arc.bd</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 gap-1.5 text-xs font-semibold">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            PowerDNS 4.9.17 Active
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading} className="gap-2">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Authoritative Zone</CardDescription>
            <CardTitle className="text-xl font-mono text-foreground">arc.bd.</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-500" />
            Native Authoritative Mode
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Active DNS RRsets</CardDescription>
            <CardTitle className="text-xl font-mono text-primary">{loading ? "..." : rrsets.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Layers className="size-4 text-primary" />
            Zero-limit Dynamic Storage
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Nameservers</CardDescription>
            <CardTitle className="text-sm font-mono text-foreground">ns1.arc.bd &amp; ns2.arc.bd</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Cpu className="size-4 text-muted-foreground" />
            Bind Port 53 UDP/TCP (VPS Host)
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Add DNS Record Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            Add Zone / Root DNS Record
          </CardTitle>
          <CardDescription>
            Directly create or update an authoritative DNS record in PowerDNS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-foreground">Type</label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className="w-full bg-background font-mono text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNAME">CNAME</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="AAAA">AAAA</SelectItem>
                  <SelectItem value="TXT">TXT</SelectItem>
                  <SelectItem value="MX">MX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-medium text-foreground">Record Name</label>
              <Input
                placeholder="e.g. portfolio, @ or full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background font-mono text-xs"
                required
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-medium text-foreground">Content / Target</label>
              <Input
                placeholder={type === "CNAME" ? "cname.vercel-dns.com" : type === "A" ? "1.2.3.4" : "Target content"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-background font-mono text-xs"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting} className="w-full font-medium text-xs">
                {submitting ? <Loader2 className="size-3.5 animate-spin" /> : "Add Record"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live PowerDNS Records Table */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 gap-3 border-b border-border">
          <div>
            <CardTitle className="text-base font-semibold">Live PowerDNS Records</CardTitle>
            <CardDescription className="text-xs">
              Direct authoritative RRsets queried in real-time from the PowerDNS Server.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No DNS records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-[100px] text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Content / Target</TableHead>
                    <TableHead className="w-[90px] text-xs font-semibold">TTL</TableHead>
                    <TableHead className="w-[80px] text-right text-xs font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((rr, idx) => (
                    <TableRow key={`${rr.name}-${rr.type}-${idx}`} className="border-border">
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20"
                        >
                          {rr.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        {rr.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-md truncate">
                        {rr.records.map((r, rIdx) => (
                          <span key={rIdx} className="block truncate">
                            {r.content}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {rr.ttl}s
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Protect SOA and apex NS from accidental one-click deletion */}
                        {rr.type !== "SOA" && (rr.name !== "arc.bd." || rr.type !== "NS") ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteRecord(rr.name, rr.type)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
                            Core
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
