import { soshiEvents } from '../../../../src/events/emitter.js';

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: "monthly" | "quarterly" | "yearly";
}

const budgets: Budget[] = [
  { id: "BUD-001", category: "Software", limit: 2000, spent: 1200, period: "monthly" },
  { id: "BUD-002", category: "Marketing", limit: 5000, spent: 2800, period: "monthly" },
  { id: "BUD-003", category: "Office", limit: 1000, spent: 450, period: "monthly" },
  { id: "BUD-004", category: "Travel", limit: 3000, spent: 0, period: "quarterly" },
];

let nextId = 5;

export function getBudgets(): Budget[] {
  return [...budgets];
}

export function getBudgetById(id: string): Budget | undefined {
  return budgets.find((b) => b.id === id);
}

export function getBudgetByCategory(category: string): Budget | undefined {
  return budgets.find((b) => b.category.toLowerCase() === category.toLowerCase());
}

export function addBudget(data: Omit<Budget, "id">): Budget {
  const budget: Budget = { id: `BUD-${String(nextId++).padStart(3, "0")}`, ...data };
  budgets.push(budget);
  return budget;
}

export function updateBudget(id: string, updates: Partial<Omit<Budget, "id">>): Budget | undefined {
  const budget = budgets.find((b) => b.id === id);
  if (!budget) return undefined;
  Object.assign(budget, updates);
  return budget;
}

export function addSpending(category: string, amount: number): Budget | undefined {
  const budget = budgets.find((b) => b.category.toLowerCase() === category.toLowerCase());
  if (!budget) return undefined;
  budget.spent += amount;
  if (budget.spent > budget.limit) {
    soshiEvents.emit('budget_exceeded', { budgetId: budget.id, category: budget.category, amount: budget.spent, limit: budget.limit });
  }
  return budget;
}
