import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, LayoutDashboard, MessageSquare, Mail, NotebookText, ListTodo, Sparkles, BarChart3, BookMarked, Settings as SettingsIcon, Search, Menu, X, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Assistant", icon: MessageSquare },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Summaries", icon: NotebookText },
  { to: "/tasks", label: "Task Planner", icon: ListTodo },
  { to: "/research", label: "Research Assistant", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/prompts", label: "Prompt Library", icon: BookMarked },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function Layout({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-[var(--sidebar-border)]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-5 w-5 text-[var(--primary-foreground)]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">Aria</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Workplace AI</span>
            </div>
          </Link>
          <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3 scrollbar-thin overflow-y-auto" style={{ height: "calc(100vh - 4rem)" }}>
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-foreground shadow-[inset_0_0_0_1px_var(--border)]"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-foreground"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                <span className="truncate">{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />}
              </Link>
            );
          })}

          <div className="mt-auto pt-4">
            <div className="card-surface p-3 text-xs">
              <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> Responsible AI
              </div>
              <p className="text-muted-foreground leading-relaxed">Always review AI output before sharing.</p>
            </div>
          </div>
        </nav>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-strong border-b border-border">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search tasks, emails, prompts…"
                className="w-full max-w-md rounded-xl border border-border bg-[var(--surface-2)] py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-[var(--surface-2)] px-3 py-1.5 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-muted-foreground">AI Online</span>
              </div>
              <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-[var(--surface-2)] text-muted-foreground hover:text-foreground" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-border" style={{ background: "var(--gradient-primary)" }}>
                <span className="text-sm font-bold text-[var(--primary-foreground)]">U</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page header */}
        <div className="px-4 pt-6 pb-4 sm:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </div>

        <main className="flex-1 px-4 pb-12 sm:px-8 scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
