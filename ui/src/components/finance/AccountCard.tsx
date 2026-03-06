"use client";

import { cn } from "@/lib/utils";
import { LandmarkIcon, PiggyBankIcon, CreditCardIcon, TrendingUpIcon } from "lucide-react";

interface AccountCardProps {
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  institution: string;
  color: string;
}

const typeIcons = {
  checking: LandmarkIcon,
  savings: PiggyBankIcon,
  credit: CreditCardIcon,
  investment: TrendingUpIcon,
};

export function AccountCard({ name, type, balance, institution, color }: AccountCardProps) {
  const Icon = typeIcons[type];
  const formatted = `${balance < 0 ? "-" : ""}$${Math.abs(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div
      className="p-4 rounded-xl bg-surface-1 border border-border hover:bg-surface-2 transition-colors"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground capitalize">{institution} &middot; {type}</div>
        </div>
      </div>
      <div className={cn("text-xl font-bold", balance < 0 ? "text-expense-red" : "text-foreground")}>
        {formatted}
      </div>
    </div>
  );
}
