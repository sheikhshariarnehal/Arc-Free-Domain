"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Globe,
  ShieldBan,
  Flag,
  Settings,
  Layers,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminHeader } from "@/components/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("admin@arc.bd");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  // Standalone layout for admin login
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navOperations = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Subdomains", href: "/admin/subdomains", icon: Globe },
    { name: "Users", href: "/admin/users", icon: Users },
  ];

  const navInfrastructure = [
    { name: "Authoritative DNS", href: "/admin/dns", icon: Layers },
    { name: "Reserved Names", href: "/admin/reserved", icon: ShieldBan },
    { name: "Abuse Reports", href: "/admin/reports", icon: Flag },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`border-r border-border bg-card text-card-foreground flex flex-col transition-[width] duration-200 ease-in-out z-30 shrink-0 select-none ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
        aria-label="Admin Navigation Sidebar"
      >
        {/* Brand Block */}
        <div className="h-14 px-3.5 flex items-center border-b border-border">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 overflow-hidden rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="ARC.BD Admin Console Home"
          >
            <Image
              src="/ARC.webp"
              alt="ARC.BD Logo"
              width={28}
              height={28}
              className="size-7 object-contain rounded-md shrink-0"
            />
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold tracking-tight leading-none text-foreground truncate">
                  ARC.BD
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5 font-medium truncate">
                  Admin Console
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-5 overflow-y-auto" aria-label="Sidebar Navigation">
          {/* Operations Section */}
          <div className="flex flex-col gap-0.5">
            {sidebarOpen && (
              <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Operations
              </p>
            )}

            {navOperations.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  } ${!sidebarOpen ? "justify-center px-0 h-9" : ""}`}
                >
                  <item.icon className="size-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Infrastructure Section */}
          <div className="flex flex-col gap-0.5">
            {sidebarOpen && (
              <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Infrastructure
              </p>
            )}

            {navInfrastructure.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  } ${!sidebarOpen ? "justify-center px-0 h-9" : ""}`}
                >
                  <item.icon className="size-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <Separator className="bg-border" />

        {/* User Footer - Raised with bottom padding to prevent any overlap */}
        <div className="px-3 pt-3 pb-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-7 rounded-md border border-border shrink-0">
              <AvatarFallback className="bg-secondary text-foreground text-[11px] font-semibold">
                {userEmail ? userEmail.slice(0, 2).toUpperCase() : "AD"}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground truncate">
                  Admin
                </span>
                <span className="text-[10px] text-muted-foreground truncate font-mono">
                  {userEmail}
                </span>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="size-3.5" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        <AdminHeader
          userEmail={userEmail}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
