"use client";

import { cn } from "@/lib/utils";

interface BudgetProgressBarProps {
  category: string;
  spent: number;
  limit: number;
}

export function BudgetProgressBar({ category, spent, limit }: BudgetProgressBarProps) {
  const pct = Math.min((spent / limit) * 100, 100);
  const barColor = pct >= 90 ? "bg-expense-red" : pct >= 70 ? "bg-accent-amber" : "bg-income-green";

  return (
    <div className="p-3 rounded-xl bg-surface-1 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{category}</span>
        <span className="text-xs text-muted-foreground">
          ${spent.toLocaleString()} / ${limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
