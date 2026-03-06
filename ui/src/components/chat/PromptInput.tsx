"use client";

import { cn } from "@/lib/utils";
import { SendIcon } from "lucide-react";
import { useState, useRef, useCallback, useEffect, type FormEvent, type KeyboardEvent } from "react";

interface SlashCommand {
  command: string;
  label: string;
  hint: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { command: "/dashboard", label: "Dashboard", hint: "Show me a financial overview" },
  { command: "/transactions", label: "Transactions", hint: "Show my recent transactions" },
  { command: "/accounts", label: "Accounts", hint: "List all my accounts with balances" },
  { command: "/report", label: "Report", hint: "Generate a financial report" },
  { command: "/budget", label: "Budget", hint: "Check my budget status" },
  { command: "/add", label: "Add", hint: "Add a new transaction" },
];

interface PromptInputProps {
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function PromptInput({ onSubmit, isLoading, className }: PromptInputProps) {
  const [value, setValue] = useState("");
  const [showSlash, setShowSlash] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const [filtered, setFiltered] = useState<SlashCommand[]>(SLASH_COMMANDS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      const query = value.slice(1).toLowerCase();
      const matches = SLASH_COMMANDS.filter((c) => c.command.slice(1).startsWith(query));
      setFiltered(matches);
      setShowSlash(matches.length > 0);
      setSlashIndex(0);
    } else {
      setShowSlash(false);
    }
  }, [value]);

  const selectSlashCommand = useCallback(
    (cmd: SlashCommand) => {
      setValue(cmd.hint);
      setShowSlash(false);
      textareaRef.current?.focus();
    },
    []
  );

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || isLoading) return;
      onSubmit(trimmed);
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
    [value, isLoading, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (showSlash) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSlashIndex((i) => (i + 1) % filtered.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSlashIndex((i) => (i - 1 + filtered.length) % filtered.length);
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          selectSlashCommand(filtered[slashIndex]);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowSlash(false);
          return;
        }
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [showSlash, filtered, slashIndex, selectSlashCommand, handleSubmit]
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      {/* Slash command dropdown */}
      {showSlash && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full mb-2 left-0 right-0 bg-surface-1 border border-border rounded-xl shadow-elevation-2 overflow-hidden z-50"
        >
          {filtered.map((cmd, i) => (
            <button
              key={cmd.command}
              type="button"
              onClick={() => selectSlashCommand(cmd)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer",
                i === slashIndex ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:bg-surface-2"
              )}
            >
              <span className="font-mono text-accent text-xs">{cmd.command}</span>
              <span className="text-muted-foreground">{cmd.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface-1 px-4 py-3 shadow-elevation-2 focus-within:ring-2 focus-within:ring-accent/50">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Send a message..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none max-h-[200px]"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={cn(
            "flex-shrink-0 p-2 rounded-xl transition-colors cursor-pointer",
            value.trim() && !isLoading
              ? "bg-accent text-white hover:bg-accent/90"
              : "bg-surface-3 text-muted-foreground"
          )}
        >
          <SendIcon className="size-4" />
        </button>
      </div>
    </form>
  );
}
