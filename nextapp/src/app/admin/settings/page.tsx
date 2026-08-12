"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function AdminSettings() {
  const [maxSubdomains, setMaxSubdomains] = useState<number>(5);
  const [minLength, setMinLength] = useState<number>(3);
  const [maxLength, setMaxLength] = useState<number>(63);
  const [maintenance, setMaintenance] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (Array.isArray(data)) {
          data.forEach((setting: { key: string; value: any }) => {
            const val = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
            if (setting.key === "max_subdomains_per_user") setMaxSubdomains(Number(val));
            if (setting.key === "min_name_length") setMinLength(Number(val));
            if (setting.key === "max_name_length") setMaxLength(Number(val));
            if (setting.key === "maintenance_mode") setMaintenance(Boolean(val));
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await Promise.all([
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "max_subdomains_per_user", value: maxSubdomains }),
        }),
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "min_name_length", value: minLength }),
        }),
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "max_name_length", value: maxLength }),
        }),
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "maintenance_mode", value: maintenance }),
        }),
      ]);
      setMessage("Settings saved successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground">Loading platform settings...</p>
        </div>
        <Card>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground">Configure platform limits and global parameters.</p>
      </div>

      {message && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Limits & Constraints</CardTitle>
            <CardDescription>System quota caps and domain syntax validation limits.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex justify-between items-center gap-4">
              <div>
                <label className="text-sm font-medium">Max Subdomains Per User</label>
                <p className="text-xs text-muted-foreground">Default quota limit for free user accounts</p>
              </div>
              <Input
                type="number"
                min={1}
                max={50}
                value={maxSubdomains}
                onChange={(e) => setMaxSubdomains(parseInt(e.target.value))}
                className="w-24 text-right"
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center gap-4">
              <div>
                <label className="text-sm font-medium">Min Name Length</label>
                <p className="text-xs text-muted-foreground">Minimum characters required for subdomain names</p>
              </div>
              <Input
                type="number"
                min={1}
                max={10}
                value={minLength}
                onChange={(e) => setMinLength(parseInt(e.target.value))}
                className="w-24 text-right"
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center gap-4">
              <div>
                <label className="text-sm font-medium">Max Name Length</label>
                <p className="text-xs text-muted-foreground">Maximum character length for subdomain names</p>
              </div>
              <Input
                type="number"
                min={10}
                max={63}
                value={maxLength}
                onChange={(e) => setMaxLength(parseInt(e.target.value))}
                className="w-24 text-right"
              />
            </div>

            <Separator />

            <div>
              <CardTitle className="text-lg mb-1">System Status</CardTitle>
              <CardDescription className="mb-4">Global maintenance override toggle.</CardDescription>
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label className="text-sm font-medium">Maintenance Mode</label>
                  <p className="text-xs text-muted-foreground">Temporarily disable new registrations & modifications</p>
                </div>
                <Switch
                  checked={maintenance}
                  onCheckedChange={setMaintenance}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="size-4" /> Save Settings
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}


