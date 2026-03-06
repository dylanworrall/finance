export interface Report {
  id: string;
  type: "monthly_summary" | "category_breakdown" | "cash_flow" | "tax_summary";
  title: string;
  dateRange: { start: string; end: string };
  data: Record<string, unknown>;
  createdAt: string;
}

const reports: Report[] = [
  {
    id: "RPT-001",
    type: "monthly_summary",
    title: "February 2026 Summary",
    dateRange: { start: "2026-02-01", end: "2026-02-28" },
    data: { totalIncome: 9400, totalExpenses: 4450, netIncome: 4950, transactionCount: 5 },
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "RPT-002",
    type: "category_breakdown",
    title: "Q1 2026 Category Breakdown",
    dateRange: { start: "2026-01-01", end: "2026-03-31" },
    data: {
      categories: [
        { name: "Consulting", total: 9000 },
        { name: "Services", total: 3200 },
        { name: "Workshop", total: 1200 },
        { name: "Software", total: -1200 },
        { name: "Marketing", total: -2800 },
        { name: "Office", total: -450 },
      ],
    },
    createdAt: "2026-03-01T00:00:00Z",
  },
];

let nextId = 3;

export function getReports(): Report[] {
  return [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReportById(id: string): Report | undefined {
  return reports.find((r) => r.id === id);
}

export function addReport(data: Omit<Report, "id" | "createdAt">): Report {
  const report: Report = {
    id: `RPT-${String(nextId++).padStart(3, "0")}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
  reports.unshift(report);
  return report;
}

export function deleteReport(id: string): boolean {
  const idx = reports.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  reports.splice(idx, 1);
  return true;
}
