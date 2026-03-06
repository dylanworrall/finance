"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ThreadContextValue {
  chatThreadId: string;
  newChat: () => void;
}

const ThreadContext = createContext<ThreadContextValue | null>(null);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [chatThreadId, setChatThreadId] = useState(() => crypto.randomUUID());

  const newChat = useCallback(() => {
    setChatThreadId(crypto.randomUUID());
  }, []);

  return (
    <ThreadContext value={{ chatThreadId, newChat }}>
      {children}
    </ThreadContext>
  );
}

export function useThread(): ThreadContextValue {
  const ctx = useContext(ThreadContext);
  if (!ctx) throw new Error("useThread must be used within ThreadProvider");
  return ctx;
}
