"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  SendIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvoiceCardProps {
  id: string;
  clientName: string;
  clientEmail: string;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  createdAt: string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof FileTextIcon }
> = {
  draft: { label: "Draft", color: "text-muted-foreground bg-surface-3", icon: FileTextIcon },
  sent: { label: "Sent", color: "text-accent bg-accent/20", icon: SendIcon },
  paid: { label: "Paid", color: "text-green-400 bg-green-500/20", icon: CheckCircleIcon },
  overdue: { label: "Overdue", color: "text-red-400 bg-red-500/20", icon: AlertTriangleIcon },
  cancelled: { label: "Cancelled", color: "text-muted-foreground bg-surface-3", icon: ClockIcon },
};

export function InvoiceCard({
  id,
  clientName,
  clientEmail,
  total,
  status,
  dueDate,
  createdAt,
  className,
}: InvoiceCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-1 p-4 space-y-2",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4", config.color.split(" ")[0])} />
          <span className="font-medium text-sm">{id}</span>
          <Badge
            variant="secondary"
            className={cn("capitalize text-xs", config.color)}
          >
            {config.label}
          </Badge>
        </div>
        <span className="text-lg font-bold text-foreground">
          {formatCurrency(total)}
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="text-foreground">{clientName}</span>
        <span className="mx-2">&middot;</span>
        <span>{clientEmail}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Due: {new Date(dueDate).toLocaleDateString()}</span>
        <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
