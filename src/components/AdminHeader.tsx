"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PanelLeft,
  ArrowLeft,
  Shield,
  LogOut,
  ExternalLink,
  Layers,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface AdminHeaderProps {
  userEmail?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function AdminHeader({
  userEmail = "admin@arc.bd",
  sidebarOpen = true,
  onToggleSidebar
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getPageInfo = () => {
    if (pathname === "/admin") return { title: "Platform Overview", section: "Admin" };
    if (pathname.startsWith("/admin/dns")) return { title: "Authoritative DNS", section: "Infrastructure" };
    if (pathname.startsWith("/admin/subdomains")) return { title: "Subdomain Management", section: "Operations" };
    if (pathname.startsWith("/admin/users")) return { title: "User Directory", section: "Operations" };
    if (pathname.startsWith("/admin/reserved")) return { title: "Reserved Names", section: "Infrastructure" };
    if (pathname.startsWith("/admin/reports")) return { title: "Abuse Reports", section: "Infrastructure" };
    if (pathname.startsWith("/admin/settings")) return { title: "System Settings", section: "Infrastructure" };
    return { title: "Admin Console", section: "Admin" };
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const pageInfo = getPageInfo();

  return (
    <header className="bg-background/95 backdrop-blur-xs border-b border-border h-14 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 select-none">
      {/* Left: Sidebar Toggle & Semantic Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 shrink-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={sidebarOpen ? "Collapse sidebar navigation" : "Expand sidebar navigation"}
          aria-expanded={sidebarOpen}
        >
          <PanelLeft className="size-4" />
        </Button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <Link
            href="/admin"
            className="font-medium hover:text-foreground transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none rounded-sm px-1 py-0.5"
          >
            ARC.BD
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
          <span className="font-medium text-foreground truncate">{pageInfo.title}</span>
        </nav>
      </div>

      {/* Right: Account Dropdown */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative size-8 rounded-full p-0 hover:ring-1 hover:ring-border focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              aria-label="User account and profile menu"
            >
              <Avatar className="size-8 border border-border">
                <AvatarFallback className="bg-secondary text-foreground font-semibold text-xs">
                  {userEmail ? userEmail.slice(0, 2).toUpperCase() : "AD"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground truncate text-xs">{userEmail}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="w-fit text-muted-foreground text-[10px] font-mono py-0">
                    Administrator
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin" className="flex items-center gap-2">
                <Shield className="size-3.5" /> Overview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/dns" className="flex items-center gap-2">
                <Layers className="size-3.5" /> Authoritative DNS
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard" className="flex items-center gap-2 text-primary">
                <ArrowLeft className="size-3.5" /> Switch to User App
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="size-3.5" /> Live Site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="size-3.5 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
