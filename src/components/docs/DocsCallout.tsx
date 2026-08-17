"use client";

import React from "react";
import { Info, AlertTriangle, Lightbulb, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warning" | "tip" | "danger" | "success";

interface DocsCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutStyles: Record<
  CalloutType,
  {
    container: string;
    iconColor: string;
    icon: React.ElementType;
  }
> = {
  info: {
    container:
      "border-blue-500/25 bg-blue-950/20 text-blue-100 shadow-[inset_0_1px_0_0_rgba(59,130,246,0.15)]",
    iconColor: "text-blue-400",
    icon: Info,
  },
  warning: {
    container:
      "border-amber-500/25 bg-amber-950/20 text-amber-100 shadow-[inset_0_1px_0_0_rgba(245,158,11,0.15)]",
    iconColor: "text-amber-400",
    icon: AlertTriangle,
  },
  tip: {
    container:
      "border-emerald-500/25 bg-emerald-950/20 text-emerald-100 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.15)]",
    iconColor: "text-emerald-400",
    icon: Lightbulb,
  },
  danger: {
    container:
      "border-red-500/25 bg-red-950/20 text-red-100 shadow-[inset_0_1px_0_0_rgba(239,68,68,0.15)]",
    iconColor: "text-red-400",
    icon: AlertCircle,
  },
  success: {
    container:
      "border-emerald-500/25 bg-emerald-950/20 text-emerald-100 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.15)]",
    iconColor: "text-emerald-400",
    icon: CheckCircle2,
  },
};

export function DocsCallout({
  type = "info",
  title,
  children,
  className,
}: DocsCalloutProps) {
  const style = calloutStyles[type] || calloutStyles.info;
  const IconComponent = style.icon;

  return (
    <div
      className={cn(
        "my-6 flex items-start gap-3.5 rounded-xl border p-4 text-sm leading-relaxed backdrop-blur-xs transition-colors",
        style.container,
        className
      )}
    >
      <div className="mt-0.5 shrink-0">
        <IconComponent className={cn("size-4.5", style.iconColor)} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        {title && (
          <p className="font-semibold tracking-tight text-white">{title}</p>
        )}
        <div className="text-zinc-300 text-xs sm:text-[13.5px] leading-relaxed [&>p]:leading-relaxed [&>p:not(:first-child)]:mt-2 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium [&_a]:text-white hover:[&_a]:text-blue-300 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-white">
          {children}
        </div>
      </div>
    </div>
  );
}
