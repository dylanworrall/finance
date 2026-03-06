"use client";

import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { PromptInput } from "@/components/chat/PromptInput";
import { Shimmer } from "@/components/ai-elements/shimmer";

const taglines = [
  "Track income & expenses across all accounts",
  "Generate financial reports in seconds",
  "Monitor budgets and spending limits",
  "Analyze cash flow and compare periods",
];

const suggestions = [
  { label: "Show my accounts", text: "List all my accounts with their balances" },
  { label: "Recent transactions", text: "Show my recent transactions" },
  { label: "Monthly summary", text: "Give me a summary of this month's income and expenses" },
  { label: "Budget check", text: "Check my budget status across all categories" },
];

export default function ChatPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const { messages, sendMessage, status } = useChat();
  const isLoading = status === "submitted" || status === "streaming";
  const [taglineIndex, setTaglineIndex] = useState(0);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        if (!data.connected) {
          router.replace("/login");
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => setAuthChecked(true));
  }, [router]);

  useEffect(() => {
    if (hasMessages) return;
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % taglines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [hasMessages]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Conversation className="flex-1">
        <ConversationContent className="max-w-3xl mx-auto w-full px-4">
          {/* Hero State */}
          <AnimatePresence>
            {!hasMessages && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center pt-24 pb-8"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl font-bold text-foreground mb-3"
                >
                  Finance
                </motion.h1>
                <div className="h-6 relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={taglineIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-muted-foreground text-center"
                    >
                      {taglines[taglineIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="flex flex-wrap gap-2 mt-8 justify-center max-w-md">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => sendMessage({ text: s.text })}
                      className="px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          {messages.map((msg) => (
            <Message key={msg.id} from={msg.role}>
              <MessageContent>
                {msg.role === "assistant" ? (
                  <MessageResponse>{msg.parts?.map(p => p.type === "text" ? p.text : "").join("") || ""}</MessageResponse>
                ) : (
                  <p>{msg.parts?.map(p => p.type === "text" ? p.text : "").join("") || ""}</p>
                )}
              </MessageContent>
            </Message>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="px-4 pb-2 flex justify-center">
              <Shimmer>Thinking...</Shimmer>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="px-4 pb-4 pt-2 max-w-3xl mx-auto w-full">
        <PromptInput
          onSubmit={(value) => {
            sendMessage({ text: value });
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
