"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface SpaceContextValue {
  activeSpace: string;
  setActiveSpace: (id: string) => void;
}

const SpaceContext = createContext<SpaceContextValue | null>(null);

const STORAGE_KEY = "finance-active-space";

export function SpaceProvider({ children }: { children: ReactNode }) {
  const [activeSpace, setActiveSpaceState] = useState("personal");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setActiveSpaceState(stored);
  }, []);

  const setActiveSpace = useCallback((id: string) => {
    setActiveSpaceState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return (
    <SpaceContext value={{ activeSpace, setActiveSpace }}>
      {children}
    </SpaceContext>
  );
}

export function useSpace(): SpaceContextValue {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("useSpace must be used within SpaceProvider");
  return ctx;
}
