"use client";

import { useEffect, useState } from "react";
import { Search, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

interface AdminSubdomain {
  id: string;
  name: string;
  full_domain: string;
  user_id: string;
  status: "active" | "suspended" | "pending" | "deleted";
  created_at: string;
}

export default function AdminSubdomains() {
  const [subdomains, setSubdomains] = useState<AdminSubdomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingSub, setUpdatingSub] = useState<AdminSubdomain | null>(null);

  const fetchSubdomains = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/subdomains?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setSubdomains(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubdomains();
  }, [search]);

  const toggleStatus = async (sub: AdminSubdomain) => {
    const newStatus = sub.status === "suspended" ? "active" : "suspended";
    try {
      const res = await fetch("/api/admin/subdomains", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sub.id, status: newStatus }),
      });
      if (res.ok) {
        fetchSubdomains();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSub(null);
    }
  };

  const filtered = subdomains.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subdomain Management</h1>
          <p className="text-sm text-muted-foreground">View and manage all user claimed subdomains.</p>
        </div>
        <Button onClick={fetchSubdomains} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by domain name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center gap-4">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No subdomains found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-semibold text-foreground">{sub.full_domain}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs max-w-xs truncate">{sub.user_id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "active"
                            ? "default"
                            : sub.status === "suspended"
                            ? "destructive"
                            : "outline"
                        }
                        className={`capitalize ${
                          sub.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" : ""
                        }`}
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(sub.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => setUpdatingSub(sub)}
                        variant="ghost"
                        size="sm"
                        className={
                          sub.status === "suspended"
                            ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1"
                            : "text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                        }
                      >
                        {sub.status === "suspended" ? (
                          <>
                            <CheckCircle className="size-4" /> Unsuspend
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="size-4" /> Suspend
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!updatingSub} onOpenChange={(open) => !open && setUpdatingSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {updatingSub?.status === "suspended" ? "Unsuspend Domain" : "Suspend Subdomain"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {updatingSub?.status === "suspended" ? "unsuspend and restore" : "suspend"}{" "}
              <strong>{updatingSub?.full_domain}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updatingSub && toggleStatus(updatingSub)}
              className={updatingSub?.status !== "suspended" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {updatingSub?.status === "suspended" ? "Restore Domain" : "Suspend Domain"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


