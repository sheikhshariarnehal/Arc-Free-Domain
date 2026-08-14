"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  FileText,
  LogOut,
  Shield,
  ChevronsUpDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: "Overview",       href: "/dashboard",         icon: LayoutDashboard },
  { name: "My Subdomains",  href: "/dashboard/domains", icon: Globe },
  { name: "Documentation",  href: "/docs",              icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("User");
  const [userName, setUserName] = useState("User");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
        setUserName(user.user_metadata?.full_name || user.email.split("@")[0] || "User");
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin") setIsAdmin(true);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 flex flex-col w-64 h-screen bg-sidebar border-r border-border transition-transform duration-200 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Image src="/ARC.webp" alt="ARC.BD Logo" width={32} height={32} className="size-8 object-contain rounded-md shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-foreground">ARC.BD</span>
              <span className="text-[11px] text-muted-foreground">Free Subdomain Platform</span>
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
          <ChevronsUpDown className="hidden md:block size-4 text-muted-foreground" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {/* User section label */}
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            My Account
          </p>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-amber-400 hover:bg-secondary hover:text-amber-400 transition-colors mb-2"
            >
              <span className="flex items-center gap-2.5">
                <Shield className="size-4" />
                Admin Panel
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          )}

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-sidebar-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon className="size-4" />
                  {item.name}
                </span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Bottom user row */}
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
                <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 size-4" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-30">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="text-foreground hover:text-primary transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <Image src="/ARC.webp" alt="ARC.BD Logo" width={24} height={24} className="size-6 object-contain rounded" />
          <span className="font-semibold text-foreground">ARC.BD Dashboard</span>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
