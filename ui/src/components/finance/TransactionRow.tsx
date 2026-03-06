"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRightIcon, ArrowDownLeftIcon, ArrowLeftRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TransactionRowProps {
  type: "income" | "expense" | "transfer";
  amount: number;
  description: string;
  category: string;
  date: string;
  accountName?: string;
}

export function TransactionRow({ type, amount, description, category, date, accountName }: TransactionRowProps) {
  const icon =
    type === "income" ? ArrowDownLeftIcon : type === "expense" ? ArrowUpRightIcon : ArrowLeftRightIcon;
  const Icon = icon;
  const amountColor =
    type === "income" ? "text-income-green" : type === "expense" ? "text-expense-red" : "text-muted-foreground";
  const prefix = type === "income" ? "+" : type === "expense" ? "-" : "";
  const formatted = `${prefix}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border hover:bg-surface-2 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            type === "income" ? "bg-income-green/15" : type === "expense" ? "bg-expense-red/15" : "bg-surface-3"
          )}
        >
          <Icon
            className={cn(
              "size-4",
              type === "income" ? "text-income-green" : type === "expense" ? "text-expense-red" : "text-muted-foreground"
            )}
          />
        </div>
        <div>
          <div className="text-sm font-medium">{description}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge className="text-[10px] px-1.5 py-0 bg-surface-3 text-muted-foreground border-0">
              {category}
            </Badge>
            {accountName && (
              <span className="text-xs text-muted-foreground">{accountName}</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn("text-sm font-semibold", amountColor)}>{formatted}</div>
        <div className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</div>
      </div>
    </div>
  );
}
