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
  Shield, 
  LogOut, 
  ArrowLeft,
  ChevronRight,
  ChevronsUpDown,
  Layers,
  ShoppingBag,
  Box,
  UserCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navSection1 = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Subdomains', href: '/admin/subdomains', icon: Globe },
  ];

  const navSection2 = [
    { name: 'Reserved Names', href: '/admin/reserved', icon: ShieldBan },
    { name: 'Abuse Reports', href: '/admin/reports', icon: Flag },
    { name: 'Root DNS', href: '/admin/dns', icon: Layers },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar matching shadcnblocks-admin */}
      <aside
        className={`border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-30 shrink-0 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Top Brand Header Block */}
        <div className="p-3 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <Image src="/ARC.webp" alt="ARC.BD Logo" width={32} height={32} className="size-8 object-contain rounded-lg shrink-0" />
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-sidebar-foreground leading-tight truncate">
                  ARC.BD Admin Kit
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  Nextjs + shadcn/ui
                </span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-6 overflow-y-auto">
          {/* Section 1 */}
          <div className="flex flex-col gap-1">
            {sidebarOpen && (
              <p className="px-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Ecommerce
              </p>
            )}

            {navSection1.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-sidebar-foreground font-semibold"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  } ${!sidebarOpen ? "justify-center px-0" : ""}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <item.icon className="size-4 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.name}</span>}
                  </div>
                  {sidebarOpen && <ChevronRight className="size-3.5 opacity-60 shrink-0" />}
                </Link>
              );
            })}
          </div>

          {/* Section 2 */}
          <div className="flex flex-col gap-1">
            {sidebarOpen && (
              <p className="px-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Project Management
              </p>
            )}

            {navSection2.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-sidebar-foreground font-semibold"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  } ${!sidebarOpen ? "justify-center px-0" : ""}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <item.icon className="size-4 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.name}</span>}
                  </div>
                  {sidebarOpen && <ChevronRight className="size-3.5 opacity-60 shrink-0" />}
                </Link>
              );
            })}
          </div>

          {/* User Dashboard Back Link */}
          <div className="mt-auto pt-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-md hover:bg-emerald-500/20 transition-colors"
            >
              <ArrowLeft className="size-4 shrink-0" />
              {sidebarOpen && <span>Back to User Dashboard</span>}
            </Link>
          </div>
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Bottom Sidebar User Profile Row matching shadcnblocks */}
        <div className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-8 rounded-full border border-sidebar-border shrink-0">
              <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
                AD
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-sidebar-foreground truncate">
                  Admin User
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {userEmail}
                </span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
          )}
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        <AdminHeader
          userEmail={userEmail}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
