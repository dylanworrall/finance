"use client";

import { cn } from "@/lib/utils";
import { TrendingUpIcon, TrendingDownIcon, type LucideIcon } from "lucide-react";

interface DashboardSummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function DashboardSummaryCard({ title, value, icon: Icon, trend }: DashboardSummaryCardProps) {
  return (
    <div className="p-4 rounded-xl bg-surface-1 border border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Icon className="size-3.5" />
          {title}
        </div>
        {trend && trend !== "neutral" && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs",
              trend === "up" ? "text-income-green" : "text-expense-red"
            )}
          >
            {trend === "up" ? (
              <TrendingUpIcon className="size-3" />
            ) : (
              <TrendingDownIcon className="size-3" />
            )}
          </div>
        )}
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
