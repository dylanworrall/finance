"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSignIcon,
  LoaderIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const { error: err } = await signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (err) {
          setError(err.message ?? "Sign up failed");
          setLoading(false);
          return;
        }
      } else {
        const { error: err } = await signIn.email({ email, password });
        if (err) {
          setError(err.message ?? "Sign in failed");
          setLoading(false);
          return;
        }
      }

      // Ensure user exists in our users table with credits
      await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || email.split("@")[0] }),
      });

      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <DollarSignIcon className="size-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Finance Client</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-surface-1 border border-border p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              mode === "signin"
                ? "bg-surface-2 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              mode === "signup"
                ? "bg-surface-2 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-surface-1 rounded-xl border border-border pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          )}

          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-surface-1 rounded-xl border border-border pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={8}
              className="w-full bg-surface-1 rounded-xl border border-border pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-accent-red/10 border border-accent-red/20 px-3 py-2 text-sm text-accent-red">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl py-2.5 cursor-pointer"
          >
            {loading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <>
                {mode === "signin" ? "Sign In" : "Sign Up"}
                <ArrowRightIcon className="size-4 ml-1" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            className="text-accent hover:underline cursor-pointer"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
