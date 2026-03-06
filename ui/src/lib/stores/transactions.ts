export interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  description: string;
  accountId: string;
  date: string;
}

const transactions: Transaction[] = [
  { id: "TXN-001", type: "income", amount: 5000, category: "Consulting", description: "TechCorp Q1 consulting payment", accountId: "ACC-001", date: "2026-02-15" },
  { id: "TXN-002", type: "expense", amount: 1200, category: "Software", description: "Annual SaaS subscriptions", accountId: "ACC-001", date: "2026-02-18" },
  { id: "TXN-003", type: "income", amount: 3200, category: "Services", description: "GreenLeaf compliance audit", accountId: "ACC-001", date: "2026-02-22" },
  { id: "TXN-004", type: "expense", amount: 450, category: "Office", description: "Office supplies and equipment", accountId: "ACC-002", date: "2026-02-25" },
  { id: "TXN-005", type: "income", amount: 1200, category: "Workshop", description: "Herbal Insights workshop fee", accountId: "ACC-001", date: "2026-02-20" },
  { id: "TXN-006", type: "expense", amount: 2800, category: "Marketing", description: "Q1 marketing campaign", accountId: "ACC-002", date: "2026-03-01" },
  { id: "TXN-007", type: "transfer", amount: 5000, category: "Transfer", description: "Transfer to savings", accountId: "ACC-003", date: "2026-03-02" },
  { id: "TXN-008", type: "income", amount: 4000, category: "Consulting", description: "CannaVentures retainer", accountId: "ACC-001", date: "2026-03-03" },
];

let nextId = 9;

export function getTransactions(filters?: {
  type?: string;
  category?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}): Transaction[] {
  let result = [...transactions];
  if (filters?.type) result = result.filter((t) => t.type === filters.type);
  if (filters?.category) result = result.filter((t) => t.category.toLowerCase() === filters.category!.toLowerCase());
  if (filters?.accountId) result = result.filter((t) => t.accountId === filters.accountId);
  if (filters?.startDate) result = result.filter((t) => t.date >= filters.startDate!);
  if (filters?.endDate) result = result.filter((t) => t.date <= filters.endDate!);
  return result.sort((a, b) => b.date.localeCompare(a.date));
}

export function getTransactionById(id: string): Transaction | undefined {
  return transactions.find((t) => t.id === id);
}

export function addTransaction(data: Omit<Transaction, "id">): Transaction {
  const txn: Transaction = { id: `TXN-${String(nextId++).padStart(3, "0")}`, ...data };
  transactions.unshift(txn);
  return txn;
}

export function searchTransactions(query: string): Transaction[] {
  const q = query.toLowerCase();
  return transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
  );
}

export function updateTransaction(id: string, updates: Partial<Omit<Transaction, "id">>): Transaction | undefined {
  const txn = transactions.find((t) => t.id === id);
  if (!txn) return undefined;
  Object.assign(txn, updates);
  return txn;
}
