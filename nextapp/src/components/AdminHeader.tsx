"use client";

import { Search, Bell, PanelLeft, Sun, ChevronDown, LogOut, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  onToggleSidebar?: () => void;
}

export function AdminHeader({ userEmail = "admin@arc.bd", onToggleSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Ecommerce App";
    if (pathname.startsWith("/admin/users")) return "User Management";
    if (pathname.startsWith("/admin/subdomains")) return "Subdomain Management";
    if (pathname.startsWith("/admin/reserved")) return "Reserved Names";
    if (pathname.startsWith("/admin/reports")) return "Abuse Reports";
    if (pathname.startsWith("/admin/settings")) return "System Settings";
    return "Admin Dashboard";
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-background border-b border-border grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-foreground hover:bg-accent"
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-medium text-foreground">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="flex justify-end min-w-0 shrink-0 items-center gap-2 ml-auto">
        {/* Cmd + K Search Trigger */}
        <Button
          variant="outline"
          className="flex h-9 w-9 sm:w-auto shrink-0 items-center justify-center gap-2 px-2.5 text-xs text-muted-foreground border-input bg-background hover:bg-accent hover:text-foreground shadow-xs"
        >
          <Search className="size-4 shrink-0" />
          <kbd className="bg-muted text-muted-foreground pointer-events-none hidden sm:inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium">
            ⌘ K
          </kbd>
        </Button>

        {/* Notification Bell */}
        <Button
          variant="outline"
          size="icon"
          className="relative size-9 border-input bg-background hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className="size-4 text-foreground" />
          <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums">
            2
          </span>
        </Button>

        {/* Theme & Preset Controls matching shadcnblocks */}
        <div className="shrink-0 items-center gap-1.5 hidden sm:flex">
          <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-accent">
            <Sun className="size-[1.2rem] text-foreground" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="outline" className="h-9 gap-2 px-2.5 text-xs border-border bg-background rounded-lg font-normal">
            <span className="inline-flex gap-0.5">
              <span className="size-3.5 rounded-sm bg-neutral-900 border border-neutral-700" />
              <span className="size-3.5 rounded-sm bg-neutral-100 border border-neutral-300" />
              <span className="size-3.5 rounded-sm bg-neutral-300 border border-neutral-400" />
            </span>
            <span className="hidden sm:inline-block text-sm">Default</span>
            <ChevronDown className="size-4 text-muted-foreground opacity-70" />
          </Button>
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative size-9 rounded-full p-0 ml-1">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-secondary text-foreground font-semibold text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-foreground truncate">{userEmail}</p>
                <Badge variant="outline" className="w-fit text-muted-foreground text-[10px] font-mono">
                  Administrator
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard" className="flex items-center gap-2 text-emerald-400">
                <ArrowLeft className="size-4" /> User Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/settings" className="flex items-center gap-2">
                <Shield className="size-4" /> System Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="size-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
