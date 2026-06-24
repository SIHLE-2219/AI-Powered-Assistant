import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Card, KpiCard, Pill, Btn } from "@/components/ui-kit";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultStats, type Stats, type Task } from "@/lib/storage";
import { CheckCircle2, Clock, Mail, NotebookText, Sparkles, TrendingUp, Timer, Zap, ArrowRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aria Workplace AI" },
      { name: "description", content: "Your AI-powered productivity dashboard: tasks, emails, meeting summaries and research." },
    ],
  }),
  component: Dashboard,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Dashboard() {
  const [stats] = useLocalStorage<Stats>("aria.stats", defaultStats);
  const [tasks] = useLocalStorage<Task[]>("aria.tasks", []);
  const pending = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;
  const productivity = Math.min(100, Math.round((completed / Math.max(1, completed + pending)) * 100));

  const weekly = stats.weekly.map((v, i) => ({ day: days[i], tasks: v, ai: Math.round(v * 1.4) }));
  const trends = Array.from({ length: 12 }, (_, i) => ({ w: `W${i + 1}`, score: 50 + Math.round(Math.sin(i / 2) * 18 + i * 2) }));

  return (
    <Layout title="Good day, let's get productive" subtitle="Here's how Aria is helping you save time this week." actions={<Link to="/chat"><Btn><Sparkles className="h-4 w-4" /> Ask Aria</Btn></Link>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tasks Completed" value={stats.tasksCompleted + completed} hint="↑ 12% vs last week" icon={<CheckCircle2 className="h-5 w-5" />} accent />
        <KpiCard label="Pending Tasks" value={pending} hint={`${tasks.length} total`} icon={<Clock className="h-5 w-5" />} />
        <KpiCard label="Emails Generated" value={stats.emailsGenerated} hint="Avg 3 min saved each" icon={<Mail className="h-5 w-5" />} />
        <KpiCard label="Meetings Summarized" value={stats.meetingsSummarized} hint="Action items extracted" icon={<NotebookText className="h-5 w-5" />} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Research Sessions" value={stats.researchSessions} icon={<Sparkles className="h-5 w-5" />} />
        <KpiCard label="Productivity Score" value={`${productivity}%`} hint="Completion ratio" icon={<TrendingUp className="h-5 w-5" />} accent />
        <KpiCard label="Hours Saved by AI" value={`${stats.hoursSaved.toFixed(1)}h`} hint="This month" icon={<Timer className="h-5 w-5" />} />
        <KpiCard label="AI Usage" value={`${stats.emailsGenerated + stats.meetingsSummarized + stats.researchSessions}`} hint="Total runs" icon={<Zap className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold">Weekly Progress</h3>
              <p className="text-xs text-muted-foreground">Tasks completed vs AI-assisted actions</p>
            </div>
            <Pill tone="success">+18%</Pill>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--primary-glow)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="ai" stroke="var(--primary-glow)" fill="url(#g2)" strokeWidth={2} />
                <Area type="monotone" dataKey="tasks" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Productivity Trends</h3>
          <p className="text-xs text-muted-foreground">12-week rolling score</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="score" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="text-base font-semibold">Quick Actions</h3>
          <div className="mt-3 flex flex-col gap-2">
            {[
              { to: "/email", label: "Draft an email", icon: Mail },
              { to: "/meetings", label: "Summarize a meeting", icon: NotebookText },
              { to: "/tasks", label: "Plan my day", icon: CheckCircle2 },
              { to: "/research", label: "Research a topic", icon: Sparkles },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-[var(--surface-2)] px-3 py-2.5 text-sm transition-colors hover:border-primary/40">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h3 className="text-base font-semibold">Today's Focus</h3>
            <Link to="/tasks" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-3 grid gap-2">
            {tasks.filter((t) => !t.completed).slice(0, 4).map((t) => (
              <div key={t.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-[var(--surface-2)] px-3 py-2.5">
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="truncate text-sm">{t.title}</span>
                <Pill tone={t.priority === "urgent" ? "danger" : t.priority === "high" ? "warning" : "success"}>{t.priority}</Pill>
              </div>
            ))}
            {tasks.filter((t) => !t.completed).length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-[var(--surface-2)]/40 p-6 text-center text-sm text-muted-foreground">
                No active tasks. <Link to="/tasks" className="text-primary hover:underline">Add one →</Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
