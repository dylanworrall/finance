export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "both";
  icon: string;
  color: string;
}

const categories: Category[] = [
  { id: "CAT-001", name: "Consulting", type: "income", icon: "Briefcase", color: "#10B981" },
  { id: "CAT-002", name: "Services", type: "income", icon: "Wrench", color: "#22C55E" },
  { id: "CAT-003", name: "Workshop", type: "income", icon: "GraduationCap", color: "#06B6D4" },
  { id: "CAT-004", name: "Product Sales", type: "income", icon: "Package", color: "#8B5CF6" },
  { id: "CAT-005", name: "Software", type: "expense", icon: "Monitor", color: "#3B82F6" },
  { id: "CAT-006", name: "Marketing", type: "expense", icon: "Megaphone", color: "#F59E0B" },
  { id: "CAT-007", name: "Office", type: "expense", icon: "Building", color: "#6B7280" },
  { id: "CAT-008", name: "Travel", type: "expense", icon: "Plane", color: "#EC4899" },
  { id: "CAT-009", name: "Payroll", type: "expense", icon: "Users", color: "#EF4444" },
  { id: "CAT-010", name: "Utilities", type: "expense", icon: "Zap", color: "#F97316" },
  { id: "CAT-011", name: "Transfer", type: "both", icon: "ArrowLeftRight", color: "#6B6B80" },
  { id: "CAT-012", name: "Other", type: "both", icon: "MoreHorizontal", color: "#9CA3AF" },
];

let nextId = 13;

export function getCategories(type?: "income" | "expense" | "both"): Category[] {
  if (!type) return [...categories];
  return categories.filter((c) => c.type === type || c.type === "both");
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryByName(name: string): Category | undefined {
  return categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function addCategory(data: Omit<Category, "id">): Category {
  const category: Category = { id: `CAT-${String(nextId++).padStart(3, "0")}`, ...data };
  categories.push(category);
  return category;
}
