"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  User,
  RefreshCw,
  MoreVertical,
  UserCheck,
  ShieldAlert,
  Copy,
  Check,
  Globe,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: "user" | "admin";
  created_at: string;
  subdomains?: Array<{ count: number }>;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Search, Filters & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "admin" | "user">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Role Change Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [updating, setUpdating] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Keyboard shortcut '/' for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !selectedUser &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedUser]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const fetchUsers = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsRefreshing(true);
      setError(null);

      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(debouncedSearch)}`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to fetch users (${res.status})`);
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load user directory");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers(false);
  }, [fetchUsers]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleRole = async (userToUpdate: UserProfile) => {
    const newRole = userToUpdate.role === "admin" ? "user" : "admin";
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userToUpdate.id, role: newRole }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update user role");
      }

      setSuccessMsg(`User ${userToUpdate.email} is now ${newRole === "admin" ? "an Administrator" : "a Standard User"}.`);
      setSelectedUser(null);
      fetchUsers(true);
    } catch (err: any) {
      setError(err.message || "Role change failed");
    } finally {
      setUpdating(false);
    }
  };

  // Filtered and Paginated List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      return true;
    });
  }, [users, roleFilter]);

  const adminCount = useMemo(() => users.filter((u) => u.role === "admin").length, [users]);
  const standardUserCount = useMemo(() => users.filter((u) => u.role === "user").length, [users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  return (
    <div className="space-y-5">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <User className="size-5 text-primary" />
              User Directory
            </h1>
            <Badge
              variant="outline"
              className="px-2 py-0.5 border-border bg-muted/50 text-foreground text-[11px] font-medium"
            >
              {users.length} Registered Accounts
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage user accounts, domain claim quotas, and administrator privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchUsers(false)}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="h-8 text-xs gap-1.5"
            aria-label="Refresh user directory"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-xs font-semibold">Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="py-2.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-4" />
          <AlertTitle className="text-xs font-semibold">Success</AlertTitle>
          <AlertDescription className="text-xs">{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-lg border border-border bg-card/40">
        {/* Role Filters */}
        <div role="tablist" aria-label="Role Filter" className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            role="tab"
            aria-selected={roleFilter === "ALL"}
            onClick={() => { setRoleFilter("ALL"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors ${
              roleFilter === "ALL"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={roleFilter === "admin"}
            onClick={() => { setRoleFilter("admin"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              roleFilter === "admin"
                ? "bg-amber-500 text-black font-semibold"
                : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            <Shield className="size-3" />
            Admins ({adminCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={roleFilter === "user"}
            onClick={() => { setRoleFilter("user"); setPage(1); }}
            className={`h-7 px-2.5 text-xs rounded-md font-medium transition-colors ${
              roleFilter === "user"
                ? "bg-secondary text-foreground font-semibold"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Standard Users ({standardUserCount})
          </button>
        </div>

        {/* Debounced Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search email or name... (/)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-7 h-7 text-xs bg-background"
            aria-label="Search user by email or name"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Users Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <p>No user accounts matched your search/filter criteria.</p>
            {(search || roleFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(""); setRoleFilter("ALL"); setPage(1); }}
                className="h-7 text-xs"
              >
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent text-xs">
                  <TableHead className="font-semibold text-xs py-2.5">User</TableHead>
                  <TableHead className="w-[110px] font-semibold text-xs py-2.5">Role</TableHead>
                  <TableHead className="w-[150px] font-semibold text-xs py-2.5">Domain Quota</TableHead>
                  <TableHead className="w-[120px] font-semibold text-xs py-2.5">Registered</TableHead>
                  <TableHead className="w-[70px] text-right font-semibold text-xs py-2.5">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user, idx) => {
                  const domainCount =
                    user.subdomains && user.subdomains.length > 0
                      ? user.subdomains[0].count
                      : 0;
                  const nameKey = `user-${user.id}-${idx}`;
                  const initials = user.name
                    ? user.name.slice(0, 2).toUpperCase()
                    : user.email.slice(0, 2).toUpperCase();

                  return (
                    <TableRow key={user.id} className="border-border text-xs">
                      {/* User Avatar + Email + Name */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2.5 group">
                          <Avatar className="size-7 rounded-md border border-border shrink-0">
                            <AvatarFallback className="bg-secondary text-foreground text-[10px] font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-foreground truncate max-w-[180px] sm:max-w-xs">
                                {user.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(user.email, nameKey)}
                                className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground"
                                title="Copy email address"
                                aria-label={`Copy email ${user.email}`}
                              >
                                {copiedKey === nameKey ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                              </button>
                            </div>
                            {user.name && (
                              <span className="text-[11px] text-muted-foreground truncate">{user.name}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell className="py-2.5">
                        <Badge
                          variant="secondary"
                          className={`capitalize font-mono text-[10px] font-bold px-2 py-0.5 border gap-1 w-fit ${
                            user.role === "admin"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {user.role === "admin" && <Shield className="size-3 text-amber-400" />}
                          {user.role}
                        </Badge>
                      </TableCell>

                      {/* Domain Quota with Quick Filter Link */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/subdomains?search=${encodeURIComponent(user.email)}`}
                            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                            title="View user subdomains"
                          >
                            <Globe className="size-3 text-muted-foreground" />
                            <span>{domainCount} / 5</span>
                          </Link>
                          <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${Math.min((domainCount / 5) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell className="text-muted-foreground text-xs py-2.5" title={user.created_at}>
                        {formatRelativeTime(user.created_at)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-foreground"
                              aria-label={`Actions for ${user.email}`}
                            >
                              <MoreVertical className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href={`/admin/subdomains?search=${encodeURIComponent(user.email)}`} className="gap-2">
                                <Globe className="size-3.5 text-primary" /> View Subdomains
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setSelectedUser(user)}
                              className="gap-2 cursor-pointer"
                            >
                              {user.role === "admin" ? (
                                <>
                                  <UserCheck className="size-3.5 text-muted-foreground" /> Demote to Standard User
                                </>
                              ) : (
                                <>
                                  <ShieldAlert className="size-3.5 text-amber-400" /> Promote to Administrator
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-xs text-muted-foreground bg-card/40">
            <div className="flex items-center gap-2">
              <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length}</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => { setPageSize(parseInt(val, 10)); setPage(1); }}
              >
                <SelectTrigger className="h-6 w-16 text-[11px] bg-background" aria-label="Items per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3" />
              </Button>
              <span className="px-1 text-[11px]">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Role Change Confirmation Modal */}
      <AlertDialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              {selectedUser?.role === "admin" ? "Demote Administrator?" : "Promote to Administrator?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-xs text-muted-foreground pt-1">
                <p>
                  Are you sure you want to change the role for <strong className="text-foreground">{selectedUser?.email}</strong> to{" "}
                  <strong className="text-foreground uppercase font-mono">{selectedUser?.role === "admin" ? "Standard User" : "Administrator"}</strong>?
                </p>
                {selectedUser?.role === "user" ? (
                  <p className="text-amber-400">This will grant full access to PowerDNS controls, user moderation, and system settings.</p>
                ) : (
                  <p className="text-muted-foreground">This user will lose access to the administrative console and become a standard developer account.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={updating} className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && toggleRole(selectedUser)}
              disabled={updating}
              className={`text-xs h-8 gap-1.5 ${
                selectedUser?.role === "admin"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              }`}
            >
              {updating ? <Loader2 className="size-3.5 animate-spin" /> : "Confirm Role Change"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
