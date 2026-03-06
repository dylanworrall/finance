"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  MessageSquareIcon,
  BarChart3Icon,
  ReceiptIcon,
  WalletIcon,
  FileTextIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Chat", icon: MessageSquareIcon },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3Icon },
  { href: "/transactions", label: "Transactions", icon: ReceiptIcon },
  { href: "/accounts", label: "Accounts", icon: WalletIcon },
  { href: "/reports", label: "Reports", icon: FileTextIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "fixed left-3 top-3 bottom-3 z-50 flex flex-col rounded-2xl bg-surface-1 border border-border shadow-elevation-2 transition-[width] duration-300 overflow-hidden",
        hovered ? "w-[220px]" : "w-[64px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
          <span className="text-accent font-bold text-sm">$</span>
        </div>
        <span
          className={cn(
            "font-semibold text-foreground text-sm truncate transition-opacity duration-200",
            hovered ? "opacity-100" : "opacity-0"
          )}
        >
          Finance
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
              )}
            >
              <Icon className="size-5 flex-shrink-0" />
              <span
                className={cn(
                  "truncate transition-opacity duration-200",
                  hovered ? "opacity-100" : "opacity-0"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
