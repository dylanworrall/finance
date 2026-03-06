"use client";

import { useState, useEffect } from "react";
import { DashboardSummaryCard } from "@/components/finance/DashboardSummaryCard";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { AccountCard } from "@/components/finance/AccountCard";
import { BudgetProgressBar } from "@/components/finance/BudgetProgressBar";
import {
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ActivityIcon,
  BarChart3Icon,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  description: string;
  accountId: string;
  date: string;
}

interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  institution: string;
  color: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: string;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/transactions").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/budgets").then((r) => r.json()),
    ]).then(([txnData, accData, budData]) => {
      setTransactions(txnData.transactions ?? []);
      setAccounts(accData.accounts ?? []);
      setBudgets(budData.budgets ?? []);
      setLoading(false);
    });
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const monthlyIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const netChange = monthlyIncome - monthlyExpenses;

  const fmt = (n: number) =>
    `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl shimmer" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
        </div>
      </div>
    );
  }

  // Build last 6 months bar chart data
  const now = new Date();
  const monthBars = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    const monthTxns = transactions.filter((t) => t.date.startsWith(month));
    const inc = monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { label, income: inc, expenses: exp };
  });
  const maxBar = Math.max(...monthBars.flatMap((m) => [m.income, m.expenses]), 1);

  const recentTxns = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3Icon className="size-6 text-accent" />
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <DashboardSummaryCard title="Total Balance" value={fmt(totalBalance)} icon={WalletIcon} />
        <DashboardSummaryCard title="Monthly Income" value={fmt(monthlyIncome)} icon={TrendingUpIcon} trend="up" />
        <DashboardSummaryCard title="Monthly Expenses" value={fmt(monthlyExpenses)} icon={TrendingDownIcon} trend="down" />
        <DashboardSummaryCard title="Net Change" value={fmt(netChange)} icon={ActivityIcon} trend={netChange >= 0 ? "up" : "down"} />
      </div>

      {/* Income vs Expenses Chart */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Income vs Expenses (Last 6 Months)
        </h2>
        <div className="p-4 rounded-xl bg-surface-1 border border-border">
          <div className="flex items-end gap-3 h-40">
            {monthBars.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-1 items-end h-28 w-full justify-center">
                  <div
                    className="w-3 bg-income-green rounded-t"
                    style={{ height: `${(m.income / maxBar) * 100}%`, minHeight: m.income ? 4 : 0 }}
                  />
                  <div
                    className="w-3 bg-expense-red rounded-t"
                    style={{ height: `${(m.expenses / maxBar) * 100}%`, minHeight: m.expenses ? 4 : 0 }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-sm bg-income-green" /> Income
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-sm bg-expense-red" /> Expenses
            </div>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Recent Transactions
        </h2>
        <div className="space-y-2">
          {recentTxns.map((t) => (
            <TransactionRow
              key={t.id}
              type={t.type}
              amount={t.amount}
              description={t.description}
              category={t.category}
              date={t.date}
              accountName={accountMap[t.accountId]}
            />
          ))}
        </div>
      </section>

      {/* Budgets */}
      {budgets.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Budget Status
          </h2>
          <div className="space-y-2">
            {budgets.map((b) => (
              <BudgetProgressBar key={b.id} category={b.category} spent={b.spent} limit={b.limit} />
            ))}
          </div>
        </section>
      )}

      {/* Accounts */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Accounts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <AccountCard key={a.id} name={a.name} type={a.type} balance={a.balance} institution={a.institution} color={a.color} />
          ))}
        </div>
      </section>
    </div>
  );
}
