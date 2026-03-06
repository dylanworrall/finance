"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThreadProvider } from "@/contexts/ThreadContext";
import { AgentModeProvider } from "@/contexts/AgentModeContext";
import { SpaceProvider } from "@/contexts/SpaceContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <ThreadProvider>
        <AgentModeProvider>
          <SpaceProvider>
            <Sidebar />
            <MainContent>{children}</MainContent>
          </SpaceProvider>
        </AgentModeProvider>
      </ThreadProvider>
    </SidebarProvider>
  );
}
