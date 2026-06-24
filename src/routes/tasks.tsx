import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { AiDisclaimer, Btn, Card, Input, Pill, Select, Textarea } from "@/components/ui-kit";
import { useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { priorityTone, type Priority, type Stats, defaultStats, type Task, uid } from "@/lib/storage";
import { aiRun } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Search, Sparkles, Trash2, CheckCircle2, Filter, ListChecks } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Task Planner — Aria" }] }),
  component: Tasks,
});

const CATEGORIES = ["Work", "Personal", "Project", "Admin", "Meeting"];

function Tasks() {
  const run = useServerFn(aiRun);
  const [tasks, setTasks] = useLocalStorage<Task[]>("aria.tasks", []);
  const [, setStats] = useLocalStorage<Stats>("aria.stats", defaultStats);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("Work");
  const [due, setDue] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [plan, setPlan] = useState("");
  const [planRange, setPlanRange] = useState("daily");
  const [goals, setGoals] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      tasks
        .filter((t) => (filter === "all" ? true : filter === "active" ? !t.completed : t.completed))
        .filter((t) => (search ? t.title.toLowerCase().includes(search.toLowerCase()) : true))
        .sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt),
    [tasks, filter, search],
  );

  const add = () => {
    if (!title.trim()) return;
    setTasks((t) => [{ id: uid(), title: title.trim(), priority, category, due, progress: 0, completed: false, createdAt: Date.now() }, ...t]);
    setTitle("");
  };

  const toggle = (id: string) =>
    setTasks((arr) =>
      arr.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, completed: !t.completed, progress: !t.completed ? 100 : 0 };
        if (next.completed) setStats((s) => ({ ...s, tasksCompleted: s.tasksCompleted + 1, hoursSaved: +(s.hoursSaved + 0.2).toFixed(2) }));
        return next;
      }),
    );

  const del = (id: string) => setTasks((arr) => arr.filter((t) => t.id !== id));

  const generatePlan = async () => {
    if (!goals && tasks.length === 0) return;
    setBusy("plan");
    try {
      const res = (await run({ data: { action: "task_plan", payload: { range: planRange, goals: goals || tasks.filter((t) => !t.completed).map((t) => `- ${t.title} (${t.priority}, ${t.category})`).join("\n") } } })) as { text: string };
      setPlan(res.text);
    } finally {
      setBusy(null);
    }
  };

  const aiPrioritize = async () => {
    if (tasks.length === 0) return;
    setBusy("pri");
    try {
      const res = (await run({ data: { action: "task_prioritize", payload: { tasks: tasks.filter((t) => !t.completed).map((t) => `- ${t.title} (${t.priority}, due ${t.due || "n/a"})`).join("\n") } } })) as { text: string };
      setPlan(res.text);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Layout title="AI Task Planner" subtitle="Plan, prioritize, and execute with AI assistance.">
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold mb-3">Add a task</h3>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
              <Input placeholder="What needs to get done?" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {(["low", "medium", "high", "urgent"] as Priority[]).map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
              <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="sm:w-40" />
              <Btn onClick={add}><Plus className="h-4 w-4" /> Add</Btn>
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 items-center mb-4">
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…" className="!pl-9" />
              </div>
              <Select value={filter} onChange={(e) => setFilter(e.target.value as never)} className="!w-32">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="done">Done</option>
              </Select>
              <Pill tone="success"><Filter className="h-3 w-3" /> {filtered.length}</Pill>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className={`group rounded-2xl border border-border bg-[var(--surface-2)] p-4 transition-all ${t.completed ? "opacity-60" : ""}`}
                >
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                    <button onClick={() => toggle(t.id)} className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all ${t.completed ? "border-primary bg-primary text-[var(--primary-foreground)]" : "border-border hover:border-primary"}`} aria-label="Toggle">
                      {t.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${t.completed ? "line-through text-[var(--completed)]" : ""}`}>{t.title}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Pill tone={priorityTone[t.priority]}>{t.priority}</Pill>
                        <Pill>{t.category}</Pill>
                        {t.due && <Pill tone="info">{t.due}</Pill>}
                      </div>
                      {!t.completed && (
                        <div className="mt-3 h-1 rounded-full bg-[var(--surface)] overflow-hidden">
                          <div className="h-full transition-all" style={{ width: `${t.progress}%`, background: "var(--gradient-primary)" }} />
                        </div>
                      )}
                    </div>
                    <button onClick={() => del(t.id)} className="text-muted-foreground hover:text-[var(--destructive)] transition" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="sm:col-span-2 rounded-2xl border border-dashed border-border bg-[var(--surface-2)]/40 p-8 text-center text-sm text-muted-foreground">
                  <ListChecks className="mx-auto h-8 w-8 text-primary mb-2" />
                  No tasks yet. Add your first one above.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold">AI Planner</h3>
            <div className="mt-3 space-y-2">
              <Select value={planRange} onChange={(e) => setPlanRange(e.target.value)}>
                <option value="daily">Daily Plan</option>
                <option value="weekly">Weekly Plan</option>
                <option value="monthly">Monthly Plan</option>
              </Select>
              <Textarea rows={4} placeholder="Optional: list your goals…" value={goals} onChange={(e) => setGoals(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Btn onClick={generatePlan} disabled={!!busy}><Sparkles className="h-4 w-4" /> Plan</Btn>
                <Btn variant="outline" onClick={aiPrioritize} disabled={!!busy}>Prioritize</Btn>
              </div>
            </div>
          </Card>

          {plan && (
            <Card>
              <h3 className="text-sm font-semibold mb-2">AI Output</h3>
              <div className="prose prose-invert prose-sm max-w-none max-h-96 overflow-y-auto scrollbar-thin"><ReactMarkdown>{plan}</ReactMarkdown></div>
              <AiDisclaimer />
            </Card>
          )}

          <Card>
            <h3 className="text-sm font-semibold">AI Tips</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
              <li>Group similar tasks into time blocks.</li>
              <li>Tackle Urgent + Important tasks first thing.</li>
              <li>Estimate effort before committing deadlines.</li>
              <li>Review and reprioritize daily.</li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
