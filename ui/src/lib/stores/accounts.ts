export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  institution: string;
  color: string;
}

const accounts: Account[] = [
  { id: "ACC-001", name: "Business Checking", type: "checking", balance: 24350.0, institution: "Chase", color: "#10B981" },
  { id: "ACC-002", name: "Operating Expenses", type: "checking", balance: 8200.0, institution: "Chase", color: "#3B82F6" },
  { id: "ACC-003", name: "Business Savings", type: "savings", balance: 52000.0, institution: "Marcus", color: "#8B5CF6" },
  { id: "ACC-004", name: "Business Credit Card", type: "credit", balance: -3450.0, institution: "Amex", color: "#F59E0B" },
];

let nextId = 5;

export function getAccounts(): Account[] {
  return [...accounts];
}

export function getAccountById(id: string): Account | undefined {
  return accounts.find((a) => a.id === id);
}

export function addAccount(data: Omit<Account, "id">): Account {
  const account: Account = { id: `ACC-${String(nextId++).padStart(3, "0")}`, ...data };
  accounts.push(account);
  return account;
}

export function updateAccountBalance(id: string, amount: number): Account | undefined {
  const account = accounts.find((a) => a.id === id);
  if (!account) return undefined;
  account.balance += amount;
  return account;
}

export function getTotalBalance(): number {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}
