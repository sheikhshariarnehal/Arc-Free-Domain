"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldBan } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface ReservedName {
  id: string;
  name: string;
  reason?: string;
}

export default function AdminReserved() {
  const [reserved, setReserved] = useState<ReservedName[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReservedName | null>(null);

  const fetchReserved = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reserved");
      const data = await res.json();
      setReserved(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReserved();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setAdding(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/reserved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim(), reason: reasonInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add reserved name");

      setNameInput("");
      setReasonInput("");
      fetchReserved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = async (resItem: ReservedName) => {
    try {
      const res = await fetch(`/api/admin/reserved?id=${resItem.id}`, { method: "DELETE" });
      if (res.ok) fetchReserved();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reserved Names</h1>
        <p className="text-sm text-muted-foreground">Prevent users from registering specific subdomains (e.g., admin, www, api).</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Add Reserved Name</CardTitle>
            <CardDescription>Block names from registration.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 py-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Subdomain Name</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. root"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Reason</label>
                <Input
                  type="text"
                  placeholder="System reserved"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={adding} className="w-full gap-2">
                <Plus className="size-4" /> Add Reserved Name
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Reserved Domain Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center gap-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : reserved.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No reserved names added yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reserved.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-amber-400 border-amber-500/30 bg-amber-500/10">
                          {res.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{res.reason || "System reserved"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => setDeleteTarget(res)}
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Reserved Name</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unblock <strong>{deleteTarget?.name}</strong>? Users will be able to claim this subdomain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && confirmDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Restriction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


