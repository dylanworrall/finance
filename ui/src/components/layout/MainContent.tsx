"use client";

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen ml-[82px]">
      {children}
    </main>
  );
}
