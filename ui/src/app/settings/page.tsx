"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SettingsIcon,
  SaveIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  LoaderIcon,
  TerminalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AgentMode = "auto" | "draft" | "manual";

interface Settings {
  agentModes: Record<string, AgentMode>;
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  anthropicModel: string;
}

interface KeyStatus {
  status: "connected" | "not_set" | "invalid";
  masked?: string;
}

interface ApiKeyConfig {
  key: string;
  label: string;
  url: string;
  urlLabel: string;
  color: string;
  hint?: string;
}

const API_KEYS: ApiKeyConfig[] = [
  {
    key: "ANTHROPIC_API_KEY",
    label: "Anthropic API",
    url: "https://platform.claude.com/settings/keys",
    urlLabel: "Get API Key",
    color: "text-accent",
    hint: "Claude Pro/Max users: run `claude setup-token` in your terminal instead",
  },
  {
    key: "WHOP_API_KEY",
    label: "Whop API",
    url: "https://whop.com/dashboard/developer",
    urlLabel: "Get Whop Key",
    color: "text-accent-amber",
  },
  {
    key: "WHOP_COMPANY_ID",
    label: "Whop Company ID",
    url: "https://whop.com/dashboard/developer",
    urlLabel: "Get Company ID",
    color: "text-accent-amber",
  },
  {
    key: "POLAR_ACCESS_TOKEN",
    label: "Polar.sh",
    url: "https://polar.sh/settings",
    urlLabel: "Get Polar Token",
    color: "text-violet-400",
  },
];

const TOOL_DESCRIPTIONS: Record<string, string> = {
  create_invoice: "Create new invoices",
  list_invoices: "List all invoices",
  get_invoice: "Get invoice details",
  send_invoice: "Send invoices to clients",
  list_payments: "List received payments",
  get_payment: "Get payment details",
  create_refund: "Process refunds",
  get_revenue: "View revenue summaries",
  create_product: "Create products/services",
  list_products: "List all products",
  create_plan: "Create pricing plans",
  list_plans: "List all plans",
  create_checkout_link: "Generate payment links",
  list_checkouts: "List checkout sessions",
  polar_list_products: "List Polar products",
  polar_create_product: "Create Polar products",
  polar_create_checkout: "Create Polar checkout",
  polar_list_orders: "List Polar orders",
  polar_list_subscriptions: "List Polar subscriptions",
  polar_list_customers: "List Polar customers",
  get_settings: "View settings",
  list_transactions: "List transactions",
  add_transaction: "Add transactions",
  categorize_transaction: "Categorize transactions",
  search_transactions: "Search transactions",
  get_transaction: "Get transaction details",
  list_accounts: "List accounts",
  get_account: "Get account details",
  add_account: "Add accounts",
  get_account_balance: "Check account balance",
  generate_report: "Generate reports",
  list_reports: "List reports",
  get_report: "Get report details",
  export_report: "Export reports",
  get_budget_status: "Check budget status",
  set_budget: "Set budgets",
  check_spending: "Check spending limits",
  monthly_summary: "Monthly summaries",
  category_breakdown: "Category breakdowns",
  cash_flow_analysis: "Cash flow analysis",
  compare_periods: "Compare periods",
  list_spaces: "List spaces",
  get_space: "Get space details",
  create_space: "Create spaces",
};

const MODE_COLORS: Record<AgentMode, string> = {
  auto: "bg-green-500/20 text-green-400 border-green-500/30",
  draft: "bg-accent-amber/20 text-amber-400 border-amber-500/30",
  manual: "bg-red-500/20 text-red-400 border-red-500/30",
};

type SettingsTab = "general" | "categories" | "integrations" | "notifications";

function StatusBadge({ status }: { status: string }) {
  if (status === "connected") {
    return (
      <Badge className="gap-1.5 bg-green-500/15 text-green-400 border border-green-500/30">
        <CheckCircleIcon className="size-3" />
        Connected
      </Badge>
    );
  }
  if (status === "invalid") {
    return (
      <Badge className="gap-1.5 bg-red-500/15 text-red-400 border border-red-500/30">
        <XCircleIcon className="size-3" />
        Invalid
      </Badge>
    );
  }
  return (
    <Badge className="gap-1.5 bg-surface-3 text-muted-foreground border border-border">
      <AlertTriangleIcon className="size-3" />
      Not set
    </Badge>
  );
}

function ApiKeyCard({
  config,
  keyStatus,
  onSave,
}: {
  config: ApiKeyConfig;
  keyStatus: KeyStatus | undefined;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const status = keyStatus?.status ?? "not_set";

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave(config.key, inputValue.trim());
      setInputValue("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save key");
    }
    setSaving(false);
  };

  return (
    <div className="p-4 rounded-xl bg-surface-1 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KeyIcon className={cn("size-5", config.color)} />
          <div>
            <div className="font-medium text-sm">{config.label}</div>
            {status === "connected" && keyStatus?.masked && (
              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                {keyStatus.masked}
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(config.url, "_blank")}
          className="gap-1.5"
        >
          <ExternalLinkIcon className="size-3" />
          {config.urlLabel}
        </Button>
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          placeholder={status === "connected" ? "Paste new key to replace..." : "Paste your key..."}
          className="flex-1 bg-surface-2 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono placeholder:font-sans"
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !inputValue.trim()}
          className="min-w-[60px]"
        >
          {saving ? (
            <LoaderIcon className="size-3.5 animate-spin" />
          ) : (
            "Save"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <XCircleIcon className="size-3" />
          {error}
        </p>
      )}
      {config.hint && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <TerminalIcon className="size-3 shrink-0" />
          {config.hint}
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, KeyStatus>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
    fetch("/api/keys").then((r) => r.json()).then(setKeyStatuses);
  }, []);

  const toggleMode = useCallback((tool: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const current = prev.agentModes[tool] ?? "auto";
      const next: AgentMode =
        current === "auto" ? "draft" : current === "draft" ? "manual" : "auto";
      return {
        ...prev,
        agentModes: { ...prev.agentModes, [tool]: next },
      };
    });
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  };

  const saveKey = async (key: string, value: string) => {
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Failed to save key");
    }
    setKeyStatuses((prev) => ({
      ...prev,
      [key]: { status: data.status, masked: data.masked },
    }));
  };

  if (!settings) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const tabs: { value: SettingsTab; label: string }[] = [
    { value: "general", label: "General" },
    { value: "categories", label: "Categories" },
    { value: "integrations", label: "Integrations" },
    { value: "notifications", label: "Notifications" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="size-6 text-accent" />
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        <Button size="sm" onClick={saveSettings} disabled={saving}>
          <SaveIcon className="size-3.5" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-3">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setActiveTab(t.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
              activeTab === t.value
                ? "bg-accent/10 text-accent font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <>
          {/* Business Info */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Business Info
            </h2>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-surface-1 border border-border">
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  placeholder="Your Company Name"
                  className="w-full bg-surface-2 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="p-3 rounded-xl bg-surface-1 border border-border">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                  className="w-full bg-surface-2 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="p-3 rounded-xl bg-surface-1 border border-border">
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={settings.businessAddress}
                  onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                  placeholder="123 Main St, City, State"
                  className="w-full bg-surface-2 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-surface-1 border border-border">
                  <label className="block text-sm font-medium mb-1">Default Currency</label>
                  <input
                    type="text"
                    value={settings.defaultCurrency}
                    onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                    className="w-full bg-surface-2 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div className="p-3 rounded-xl bg-surface-1 border border-border">
                  <label className="block text-sm font-medium mb-1">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    value={settings.defaultTaxRate}
                    onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
                    className="w-full bg-surface-2 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Agent Modes */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Agent Modes
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Control how each action runs. <strong>Auto</strong> = runs immediately.{" "}
              <strong>Draft</strong> = queued for approval. <strong>Manual</strong> = requires explicit command.
            </p>
            <div className="space-y-2">
              {Object.entries(settings.agentModes).map(([tool, mode]) => (
                <div
                  key={tool}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border"
                >
                  <div>
                    <div className="font-medium text-sm">{tool}</div>
                    <div className="text-xs text-muted-foreground">
                      {TOOL_DESCRIPTIONS[tool] ?? ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMode(tool)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors",
                      MODE_COLORS[mode]
                    )}
                  >
                    {mode}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* AI Model */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              AI Model
            </h2>
            <div className="p-3 rounded-xl bg-surface-1 border border-border">
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                type="text"
                value={settings.anthropicModel}
                onChange={(e) => setSettings({ ...settings, anthropicModel: e.target.value })}
                className="w-full bg-surface-2 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </section>
        </>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Transaction Categories
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Categories are used to classify transactions. Use the chat to manage categories (e.g. &quot;add a Rent category&quot;).
          </p>
          <div className="space-y-2">
            {["Consulting", "Services", "Workshop", "Product Sales", "Software", "Marketing", "Office", "Travel", "Payroll", "Utilities", "Transfer", "Other"].map((cat) => (
              <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border">
                <span className="text-sm">{cat}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            API Keys
          </h2>
          <div className="space-y-3">
            {API_KEYS.map((config) => (
              <ApiKeyCard
                key={config.key}
                config={config}
                keyStatus={keyStatuses[config.key]}
                onSave={saveKey}
              />
            ))}
            <p className="text-xs text-muted-foreground">
              Keys are saved to{" "}
              <code className="px-1.5 py-0.5 rounded bg-surface-2 text-accent font-mono">
                ~/.finance/.env
              </code>
              {" "}and validated on save.
            </p>
          </div>
        </section>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Notifications
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Notification preferences coming soon. Budget alerts and payment reminders will be configurable here.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border">
              <div>
                <div className="text-sm font-medium">Budget Alerts</div>
                <div className="text-xs text-muted-foreground">Notify when spending exceeds 80% of budget</div>
              </div>
              <div className="w-10 h-6 rounded-full bg-accent/30 flex items-center justify-end px-0.5">
                <div className="w-5 h-5 rounded-full bg-accent" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border">
              <div>
                <div className="text-sm font-medium">Payment Reminders</div>
                <div className="text-xs text-muted-foreground">Remind about overdue invoices</div>
              </div>
              <div className="w-10 h-6 rounded-full bg-accent/30 flex items-center justify-end px-0.5">
                <div className="w-5 h-5 rounded-full bg-accent" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border">
              <div>
                <div className="text-sm font-medium">Weekly Summary</div>
                <div className="text-xs text-muted-foreground">Email weekly financial summary</div>
              </div>
              <div className="w-10 h-6 rounded-full bg-surface-3 flex items-center px-0.5">
                <div className="w-5 h-5 rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
