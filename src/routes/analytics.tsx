import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Card, KpiCard, Pill } from "@/components/ui-kit";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultStats, type Stats, type Task } from "@/lib/storage";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, CheckCircle2, Timer, Zap } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Aria" }] }),
  component: Analytics,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Analytics() {
  const [stats] = useLocalStorage<Stats>("aria.stats", defaultStats);
  const [tasks] = useLocalStorage<Task[]>("aria.tasks", []);
  const completion = Math.round((tasks.filter((t) => t.completed).length / Math.max(1, tasks.length)) * 100);

  const weekly = stats.weekly.map((v, i) => ({ day: days[i], score: 50 + v * 5 }));
  const month = Array.from({ length: 30 }, (_, i) => ({ d: i + 1, ai: Math.round(8 + Math.sin(i / 3) * 4 + Math.random() * 3) }));
  const heat = Array.from({ length: 7 * 8 }, () => Math.floor(Math.random() * 5));

  return (
    <Layout title="Productivity Analytics" subtitle="Visualize how AI is moving the needle.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Productivity Score" value={`${Math.min(100, 60 + completion / 3)}%`} icon={<Activity className="h-5 w-5" />} accent />
        <KpiCard label="Completion Rate" value={`${completion}%`} icon={<CheckCircle2 className="h-5 w-5" />} />
        <KpiCard label="AI Frequency" value={stats.emailsGenerated + stats.meetingsSummarized + stats.researchSessions} hint="actions" icon={<Zap className="h-5 w-5" />} />
        <KpiCard label="Time Saved" value={`${stats.hoursSaved.toFixed(1)}h`} icon={<Timer className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold">Weekly Performance</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--primary)" fill="url(#a1)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold">Monthly AI Usage</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={month}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="ai" stroke="var(--primary-glow)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold">Activity Heatmap</h3>
            <Pill tone="success">Last 8 weeks</Pill>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {heat.map((v, i) => (
              <div key={i} className="aspect-square rounded-md" style={{ background: `color-mix(in oklab, var(--primary) ${v * 22}%, var(--surface-2))` }} title={`${v} activities`} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <span key={v} className="h-3 w-3 rounded" style={{ background: `color-mix(in oklab, var(--primary) ${v * 22}%, var(--surface-2))` }} />
            ))}
            <span>More</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold">Progress Rings</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {[
              { label: "Tasks", value: completion },
              { label: "Goals", value: 72 },
              { label: "Focus", value: 84 },
              { label: "AI Use", value: 91 },
            ].map((r) => {
              const c = 2 * Math.PI * 28;
              return (
                <div key={r.label} className="grid place-items-center">
                  <div className="relative">
                    <svg width="80" height="80" viewBox="0 0 64 64" className="-rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="var(--surface-2)" strokeWidth="6" fill="none" />
                      <circle cx="32" cy="32" r="28" stroke="var(--primary)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - r.value / 100)} style={{ filter: "drop-shadow(0 0 6px var(--primary))" }} />
                    </svg>
                    <span className="absolute inset-0 grid place-items-center text-sm font-bold">{r.value}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{r.label}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
