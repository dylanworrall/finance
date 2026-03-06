"use client";

import { FileTextIcon, DownloadIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportCardProps {
  title: string;
  type: string;
  dateRange: { start: string; end: string };
  createdAt: string;
  onView?: () => void;
  onExport?: () => void;
}

const typeLabels: Record<string, string> = {
  monthly_summary: "Monthly Summary",
  category_breakdown: "Category Breakdown",
  cash_flow: "Cash Flow",
  tax_summary: "Tax Summary",
};

export function ReportCard({ title, type, dateRange, createdAt, onView, onExport }: ReportCardProps) {
  return (
    <div className="p-4 rounded-xl bg-surface-1 border border-border hover:bg-surface-2 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center mt-0.5">
            <FileTextIcon className="size-4 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {typeLabels[type] ?? type} &middot;{" "}
              {new Date(dateRange.start).toLocaleDateString()} &ndash;{" "}
              {new Date(dateRange.end).toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Created {new Date(createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {onView && (
            <Button variant="ghost" size="icon" onClick={onView} className="size-8">
              <EyeIcon className="size-3.5" />
            </Button>
          )}
          {onExport && (
            <Button variant="ghost" size="icon" onClick={onExport} className="size-8">
              <DownloadIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
