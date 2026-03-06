"use client";

import { useState, useEffect } from "react";
import { AccountCard } from "@/components/finance/AccountCard";
import { Button } from "@/components/ui/button";
import { WalletIcon, PlusIcon, XIcon } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  institution: string;
  color: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Add form
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<Account["type"]>("checking");
  const [newBalance, setNewBalance] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [newColor, setNewColor] = useState("#10B981");

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data.accounts ?? []);
        setLoading(false);
      });
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const fmt = (n: number) =>
    `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const handleAdd = async () => {
    if (!newName || !newInstitution) return;
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        type: newType,
        balance: parseFloat(newBalance) || 0,
        institution: newInstitution,
        color: newColor,
      }),
    });
    const data = await res.json();
    if (data.account) {
      setAccounts((prev) => [...prev, data.account]);
    }
    setShowAdd(false);
    setNewName("");
    setNewBalance("");
    setNewInstitution("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <WalletIcon className="size-6 text-accent" />
          <h1 className="text-xl font-bold">Accounts</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <PlusIcon className="size-3.5" />
          Add Account
        </Button>
      </div>

      {/* Total Balance */}
      <div className="p-4 rounded-xl bg-surface-1 border border-border mb-6">
        <div className="text-xs text-muted-foreground mb-1">Total Balance</div>
        <div className="text-2xl font-bold">{fmt(totalBalance)}</div>
      </div>

      {/* Add Account Dialog */}
      {showAdd && (
        <div className="mb-6 p-4 rounded-xl bg-surface-1 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Add Account</h3>
            <button type="button" onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Account name"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as Account["type"])}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Institution</label>
              <input
                type="text"
                value={newInstitution}
                onChange={(e) => setNewInstitution(e.target.value)}
                placeholder="e.g. Chase"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Opening Balance</label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Color</label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full h-9 bg-surface-2 border border-border rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleAdd}>Add Account</Button>
        </div>
      )}

      {/* Accounts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl shimmer" />)}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <WalletIcon className="size-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No accounts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <AccountCard
              key={a.id}
              name={a.name}
              type={a.type}
              balance={a.balance}
              institution={a.institution}
              color={a.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
