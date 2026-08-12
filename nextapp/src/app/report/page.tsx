"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Flag, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ReportAbuse() {
  const [subdomain, setSubdomain] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Phishing / Malware");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain.trim() || !email.trim() || !details.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: subdomain.trim(),
          reporter_email: email.trim(),
          category,
          details: details.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setSubmitted(true);
      setSubdomain("");
      setEmail("");
      setDetails("");
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-lg">
          <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                  <Flag className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Report Abuse</CardTitle>
                  <CardDescription className="text-xs">Help keep the ARC.BD platform safe for everyone.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {submitted ? (
                <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 py-4">
                  <CheckCircle2 className="size-5 text-emerald-400" />
                  <AlertTitle className="text-emerald-400 font-semibold">Report Submitted</AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground mt-1">
                    Thank you. Our trust &amp; safety team will investigate this subdomain within 24 hours.
                  </AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs h-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  >
                    Submit Another Report
                  </Button>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="py-3 text-xs">
                      <AlertCircle className="size-4" />
                      <AlertTitle>Submission Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground block">Subdomain to report</label>
                    <div className="flex items-center">
                      <Input
                        required
                        placeholder="malicious-site"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="rounded-r-none font-mono text-xs h-9"
                      />
                      <span className="bg-secondary border border-l-0 border-border h-9 px-3 flex items-center rounded-r-md text-xs text-muted-foreground font-mono">
                        .arc.bd
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground block">Your Email</label>
                    <Input
                      type="email"
                      required
                      placeholder="reporter@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground block">Violation Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Phishing / Malware">Phishing / Malware</SelectItem>
                        <SelectItem value="Copyright Violation">Copyright Violation</SelectItem>
                        <SelectItem value="Spam">Spam &amp; Unsolicited Mail</SelectItem>
                        <SelectItem value="Illegal Content">Other Illegal Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground block">Additional Details &amp; Evidence</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please provide specific URLs, headers, or evidence of abuse..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full bg-background border border-border rounded-md p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all resize-none"
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full h-10 text-xs font-semibold mt-2">
                    {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Send className="size-4 mr-2" />}
                    Submit Abuse Report
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground mt-auto">
        ARC.BD Trust &amp; Safety &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
