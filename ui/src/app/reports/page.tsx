"use client";

import { useState, useEffect } from "react";
import { ReportCard } from "@/components/finance/ReportCard";
import { Button } from "@/components/ui/button";
import {
  FileTextIcon,
  BarChart2Icon,
  PieChartIcon,
  TrendingUpIcon,
  CalculatorIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";

interface Report {
  id: string;
  type: string;
  title: string;
  dateRange: { start: string; end: string };
  data: Record<string, unknown>;
  createdAt: string;
}

const REPORT_TYPES = [
  { type: "monthly_summary", label: "Monthly Summary", desc: "Income, expenses, and net for a month", icon: BarChart2Icon },
  { type: "category_breakdown", label: "Category Breakdown", desc: "Spending by category", icon: PieChartIcon },
  { type: "cash_flow", label: "Cash Flow", desc: "Inflow vs outflow analysis", icon: TrendingUpIcon },
  { type: "tax_summary", label: "Tax Summary", desc: "Income and deductions for tax prep", icon: CalculatorIcon },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genType, setGenType] = useState("monthly_summary");
  const [genTitle, setGenTitle] = useState("");
  const [genStart, setGenStart] = useState("");
  const [genEnd, setGenEnd] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        setReports(data.reports ?? []);
        setLoading(false);
      });
  }, []);

  const handleGenerate = async () => {
    if (!genTitle || !genStart || !genEnd) return;
    setGenerating(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: genType, title: genTitle, startDate: genStart, endDate: genEnd }),
    });
    const data = await res.json();
    if (data.report) {
      setReports((prev) => [data.report, ...prev]);
    }
    setShowGenerate(false);
    setGenTitle("");
    setGenerating(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileTextIcon className="size-6 text-accent" />
          <h1 className="text-xl font-bold">Reports</h1>
        </div>
        <Button size="sm" onClick={() => setShowGenerate(true)}>
          <PlusIcon className="size-3.5" />
          Generate
        </Button>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          return (
            <button
              key={rt.type}
              type="button"
              onClick={() => {
                setGenType(rt.type);
                setGenTitle(rt.label);
                setShowGenerate(true);
              }}
              className="p-4 rounded-xl bg-surface-1 border border-border text-left hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Icon className="size-5 text-accent mb-2" />
              <div className="text-sm font-medium">{rt.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{rt.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Generate Dialog */}
      {showGenerate && (
        <div className="mb-6 p-4 rounded-xl bg-surface-1 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Generate Report</h3>
            <button type="button" onClick={() => setShowGenerate(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Report Type</label>
              <select
                value={genType}
                onChange={(e) => setGenType(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                {REPORT_TYPES.map((rt) => (
                  <option key={rt.type} value={rt.type}>{rt.label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Title</label>
              <input
                type="text"
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                placeholder="Report title"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
              <input
                type="date"
                value={genStart}
                onChange={(e) => setGenStart(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">End Date</label>
              <input
                type="date"
                value={genEnd}
                onChange={(e) => setGenEnd(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      )}

      {/* Existing Reports */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Generated Reports
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileTextIcon className="size-10 mx-auto mb-3 opacity-50" />
            <p>No reports yet. Generate your first report above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <ReportCard
                key={r.id}
                title={r.title}
                type={r.type}
                dateRange={r.dateRange}
                createdAt={r.createdAt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
