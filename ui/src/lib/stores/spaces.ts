export interface Space {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const spaces: Space[] = [
  { id: "personal", name: "Personal", description: "Personal finance tracking", icon: "User" },
  { id: "business", name: "Business", description: "Business income and expenses", icon: "Building" },
  { id: "investments", name: "Investments", description: "Investment portfolio tracking", icon: "TrendingUp" },
  { id: "tax", name: "Tax Planning", description: "Tax deductions and planning", icon: "Calculator" },
];

export function getSpaces(): Space[] {
  return [...spaces];
}

export function getSpaceById(id: string): Space | undefined {
  return spaces.find((s) => s.id === id);
}

export function addSpace(data: Omit<Space, "id">): Space {
  const space: Space = { id: data.name.toLowerCase().replace(/\s+/g, "-"), ...data };
  spaces.push(space);
  return space;
}
