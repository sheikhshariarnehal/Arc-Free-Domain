"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ShieldAlert, CheckCircle, RefreshCw, Clock, Check, X, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  profiles?: {
    id: string;
    email: string;
    name?: string;
  } | null;
}

function AdminSubdomainsInner() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [subdomains, setSubdomains] = useState<AdminSubdomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [actionTarget, setActionTarget] = useState<{
    subdomain: AdminSubdomain;
    action: "approve" | "suspend" | "unsuspend" | "reject";
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchSubdomains = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (statusFilter !== "all") queryParams.set("status", statusFilter);

      const res = await fetch(`/api/admin/subdomains?${queryParams.toString()}`);
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
  }, [search, statusFilter]);

  const handleStatusChange = async (sub: AdminSubdomain, newStatus: "active" | "suspended" | "pending") => {
    setProcessing(true);
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
      setProcessing(false);
      setActionTarget(null);
    }
  };

  const pendingCount = subdomains.filter((s) => s.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subdomain Management</h1>
          <p className="text-sm text-muted-foreground">Review, approve, and manage all user claimed subdomains.</p>
        </div>
        <Button onClick={fetchSubdomains} variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search domain or prefix..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Quick Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-secondary/50 rounded-lg border border-border">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === "all"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  statusFilter === "pending"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="size-3 text-amber-400" />
                Pending
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === "active"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("suspended")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === "suspended"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Suspended
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center gap-4">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : subdomains.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No subdomains found matching the current filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Requester / User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Claimed Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subdomains.map((sub) => {
                  const userEmail = sub.profiles?.email || "Unknown user";
                  const userName = sub.profiles?.name;

                  return (
                    <TableRow key={sub.id} className={sub.status === "pending" ? "bg-amber-500/5" : ""}>
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{sub.full_domain}</span>
                          {sub.status === "pending" && (
                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0">
                              Review Required
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-foreground font-medium flex items-center gap-1">
                            <User className="size-3 text-muted-foreground" /> {userEmail}
                          </span>
                          {userName && (
                            <span className="text-[11px] text-muted-foreground">{userName}</span>
                          )}
                        </div>
                      </TableCell>

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
                            sub.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : sub.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                              : ""
                          }`}
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(sub.created_at)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === "pending" ? (
                            <>
                              <Button
                                onClick={() => setActionTarget({ subdomain: sub, action: "approve" })}
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5 font-medium"
                              >
                                <Check className="size-3.5" /> Approve
                              </Button>
                              <Button
                                onClick={() => setActionTarget({ subdomain: sub, action: "reject" })}
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 px-2.5"
                              >
                                <X className="size-3.5" /> Reject
                              </Button>
                            </>
                          ) : sub.status === "suspended" ? (
                            <Button
                              onClick={() => setActionTarget({ subdomain: sub, action: "unsuspend" })}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1"
                            >
                              <CheckCircle className="size-3.5" /> Unsuspend
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setActionTarget({ subdomain: sub, action: "suspend" })}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                            >
                              <ShieldAlert className="size-3.5" /> Suspend
                            </Button>
                          )}
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

      {/* Confirmation Modal for Approve / Suspend / Reject */}
      <AlertDialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget?.action === "approve"
                ? "Approve Domain Claim"
                : actionTarget?.action === "reject"
                ? "Reject Domain Claim"
                : actionTarget?.action === "unsuspend"
                ? "Unsuspend Domain"
                : "Suspend Subdomain"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionTarget?.action === "approve" ? (
                <>
                  Are you sure you want to approve <strong>{actionTarget.subdomain.full_domain}</strong> for{" "}
                  <strong>{actionTarget.subdomain.profiles?.email || actionTarget.subdomain.user_id}</strong>?
                  <br />
                  <br />
                  This will activate the domain, <strong>unlock DNS record management</strong> for the user, and dispatch an email confirmation.
                </>
              ) : actionTarget?.action === "reject" ? (
                <>
                  Are you sure you want to reject the claim for <strong>{actionTarget.subdomain.full_domain}</strong>?
                  <br />
                  <br />
                  The subdomain will be marked suspended and DNS access will remain locked.
                </>
              ) : actionTarget?.action === "unsuspend" ? (
                <>
                  Are you sure you want to restore and unlock <strong>{actionTarget?.subdomain.full_domain}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to suspend <strong>{actionTarget?.subdomain.full_domain}</strong>? Traffic and DNS routing will be deactivated.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!actionTarget) return;
                const newStatus =
                  actionTarget.action === "approve" || actionTarget.action === "unsuspend"
                    ? "active"
                    : "suspended";
                handleStatusChange(actionTarget.subdomain, newStatus);
              }}
              disabled={processing}
              className={
                actionTarget?.action === "approve" || actionTarget?.action === "unsuspend"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {actionTarget?.action === "approve"
                ? "Approve & Unlock"
                : actionTarget?.action === "reject"
                ? "Reject Claim"
                : actionTarget?.action === "unsuspend"
                ? "Restore Domain"
                : "Suspend Domain"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminSubdomains() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    }>
      <AdminSubdomainsInner />
    </Suspense>
  );
}
