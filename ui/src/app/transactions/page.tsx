"use client";

import { useState, useEffect, useCallback } from "react";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { Button } from "@/components/ui/button";
import {
  ReceiptIcon,
  SearchIcon,
  PlusIcon,
  XIcon,
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
}

type TabFilter = "all" | "income" | "expense" | "transfer";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tab, setTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [newType, setNewType] = useState<"income" | "expense" | "transfer">("expense");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAccountId, setNewAccountId] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = tab !== "all" ? `?type=${tab}` : "";
    const [txnRes, accRes] = await Promise.all([
      fetch(`/api/transactions${params}`),
      fetch("/api/accounts"),
    ]);
    const txnData = await txnRes.json();
    const accData = await accRes.json();
    setTransactions(txnData.transactions ?? []);
    setAccounts(accData.accounts ?? []);
    if (!newAccountId && accData.accounts?.length) {
      setNewAccountId(accData.accounts[0].id);
    }
    setLoading(false);
  }, [tab, newAccountId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));

  const filtered = search
    ? transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const totalIn = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = totalIn - totalOut;
  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const handleAdd = async () => {
    if (!newAmount || !newCategory || !newDescription) return;
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newType,
        amount: parseFloat(newAmount),
        category: newCategory,
        description: newDescription,
        accountId: newAccountId,
        date: newDate,
      }),
    });
    setShowAdd(false);
    setNewAmount("");
    setNewCategory("");
    setNewDescription("");
    fetchData();
  };

  const tabs: { value: TabFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expenses" },
    { value: "transfer", label: "Transfers" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ReceiptIcon className="size-6 text-accent" />
          <h1 className="text-xl font-bold">Transactions</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <PlusIcon className="size-3.5" />
          Add
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <Button
            key={t.value}
            variant={tab === t.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full bg-surface-1 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      {/* Add Transaction Dialog */}
      {showAdd && (
        <div className="mb-4 p-4 rounded-xl bg-surface-1 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Add Transaction</h3>
            <button type="button" onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as "income" | "expense" | "transfer")}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Amount</label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Category</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Software"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Account</label>
              <select
                value={newAccountId}
                onChange={(e) => setNewAccountId(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Description</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What was this for?"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleAdd}>Add Transaction</Button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ReceiptIcon className="size-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
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
      )}

      {/* Footer Summary */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm">
          <span className="text-income-green">In: {fmt(totalIn)}</span>
          <span className="text-expense-red">Out: {fmt(totalOut)}</span>
          <span className={net >= 0 ? "text-income-green" : "text-expense-red"}>Net: {net >= 0 ? "+" : "-"}{fmt(Math.abs(net))}</span>
        </div>
      )}
    </div>
  );
}
