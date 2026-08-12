"use client";

import { useEffect, useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AbuseReport {
  id: string;
  subdomain: string;
  reporter_email: string;
  category: string;
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<AbuseReport | null>(null);
  const [tabFilter, setTabFilter] = useState("all");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = reports.filter((r) => {
    if (tabFilter !== "all" && r.status !== tabFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Abuse Reports</h1>
        <p className="text-sm text-muted-foreground">Review user-submitted policy and safety reports.</p>
      </div>

      <Tabs value={tabFilter} onValueChange={setTabFilter} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({reports.filter((r) => r.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({reports.filter((r) => r.status === "resolved").length})
          </TabsTrigger>
          <TabsTrigger value="dismissed">
            Dismissed ({reports.filter((r) => r.status === "dismissed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tabFilter} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center gap-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">No abuse reports found in this category.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subdomain</TableHead>
                      <TableHead>Reporter Email</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-semibold text-foreground">{report.subdomain}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{report.reporter_email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
                            {report.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                          {report.details || "None"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              report.status === "resolved"
                                ? "default"
                                : report.status === "dismissed"
                                ? "secondary"
                                : "outline"
                            }
                            className={`capitalize ${
                              report.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" : ""
                            }`}
                          >
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-1">
                          <Button
                            onClick={() => setViewReport(report)}
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            title="View Report Details"
                          >
                            <Eye className="size-4 text-muted-foreground" />
                          </Button>
                          <Button
                            onClick={() => updateStatus(report.id, "dismissed")}
                            disabled={updatingId === report.id}
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-destructive/10 hover:text-destructive"
                            title="Dismiss Report"
                          >
                            <X className="size-4" />
                          </Button>
                          <Button
                            onClick={() => updateStatus(report.id, "resolved")}
                            disabled={updatingId === report.id}
                            variant="ghost"
                            size="icon"
                            className="size-8 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                            title="Mark Resolved"
                          >
                            <Check className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abuse Report Details</DialogTitle>
            <DialogDescription>
              Target Subdomain: <strong>{viewReport?.subdomain}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-muted-foreground">Reporter Email</span>
              <span className="font-mono">{viewReport?.reporter_email}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="outline">{viewReport?.category}</Badge>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground font-medium">Report Explanation</span>
              <div className="p-3 bg-muted rounded-md text-muted-foreground font-mono text-xs">
                {viewReport?.details || "No extra details provided."}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


