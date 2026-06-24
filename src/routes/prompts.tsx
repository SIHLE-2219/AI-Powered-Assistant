import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Btn, Card, Input, Pill } from "@/components/ui-kit";
import { useMemo, useState } from "react";
import { Copy, Play, Search } from "lucide-react";

export const Route = createFileRoute("/prompts")({
  head: () => ({ meta: [{ title: "Prompt Library — Aria" }] }),
  component: Prompts,
});

type P = { category: string; title: string; description: string; prompt: string };

const PROMPTS: P[] = [
  { category: "Email Writing", title: "Polite Decline", description: "Decline a request while keeping the relationship strong.", prompt: "Write a polite, professional email to decline a meeting request while suggesting an alternative." },
  { category: "Email Writing", title: "Cold Outreach", description: "Concise B2B cold outreach with a clear CTA.", prompt: "Write a 90-word cold outreach email to a Director of Operations about reducing manual workflows." },
  { category: "Email Writing", title: "Status Update", description: "Weekly status update to stakeholders.", prompt: "Draft a weekly project status update covering progress, blockers, risks, and next steps." },
  { category: "Productivity", title: "Daily Standup", description: "Generate a tight daily standup script.", prompt: "Generate a daily standup update covering yesterday, today, and blockers — keep it under 60 seconds spoken." },
  { category: "Productivity", title: "Deep Work Block", description: "Plan a 90-minute deep work session.", prompt: "Design a 90-minute deep work session for me on [topic]: goals, environment, success criteria, and a closing review." },
  { category: "Meeting Management", title: "Meeting Agenda", description: "Create a focused agenda.", prompt: "Create a 30-minute meeting agenda with clear objectives, time-boxed sections, and required pre-reads." },
  { category: "Meeting Management", title: "Action Items", description: "Extract action items from notes.", prompt: "Extract action items from these notes with owner and due date: " },
  { category: "Research", title: "Competitive Analysis", description: "Compare 3 competitors on key dimensions.", prompt: "Compare these 3 competitors on pricing, positioning, target market, and key differentiators: " },
  { category: "Research", title: "Market Sizing", description: "Top-down market sizing.", prompt: "Estimate the TAM, SAM, and SOM for [market] with assumptions explicitly listed." },
  { category: "Project Planning", title: "RACI Matrix", description: "Build a RACI for a project.", prompt: "Generate a RACI matrix for this project with these stakeholders: " },
  { category: "Project Planning", title: "Risk Register", description: "Identify and rate project risks.", prompt: "Generate a risk register with likelihood, impact, owner, and mitigation for this project: " },
  { category: "Brainstorming", title: "10x Ideas", description: "Generate 10 distinct ideas.", prompt: "Brainstorm 10 distinct ideas for [topic]. Group them by theme. Pick the top 3 and explain why." },
  { category: "Time Management", title: "Eisenhower Sort", description: "Sort tasks into the urgency/importance matrix.", prompt: "Sort these tasks into the Eisenhower matrix (Do/Decide/Delegate/Delete): " },
  { category: "Leadership", title: "1:1 Agenda", description: "Plan a great manager 1:1.", prompt: "Plan a 30-minute 1:1 agenda focused on growth, blockers, and feedback for a senior IC." },
  { category: "Leadership", title: "Difficult Conversation", description: "Frame a constructive feedback conversation.", prompt: "Help me prepare a difficult feedback conversation about missed deadlines — use SBI structure." },
  { category: "Communication", title: "Executive Summary", description: "Summarize a doc for execs.", prompt: "Write an executive summary (under 150 words) of this document highlighting decisions needed: " },
  { category: "Communication", title: "Slack Announcement", description: "Crisp, friendly team announcement.", prompt: "Draft a Slack announcement to the team introducing a new tool and how it helps them." },
];

const CATS = ["All", ...Array.from(new Set(PROMPTS.map((p) => p.category)))];

function Prompts() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(
    () => PROMPTS.filter((p) => (cat === "All" || p.category === cat) && (q ? (p.title + p.description + p.prompt).toLowerCase().includes(q.toLowerCase()) : true)),
    [q, cat],
  );

  const runIt = (p: P) => {
    sessionStorage.setItem("aria.runPrompt", p.prompt);
    nav({ to: "/chat" });
  };

  return (
    <Layout title="AI Prompt Library" subtitle="Curated, ready-to-run workplace prompts.">
      <Card className="mb-5">
        <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prompts…" className="!pl-9" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${cat === c ? "border-primary bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-primary" : "border-border bg-[var(--surface-2)] text-muted-foreground hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Card key={p.title} className="flex flex-col">
            <Pill tone="success">{p.category}</Pill>
            <h3 className="mt-2 font-semibold">{p.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
            <p className="mt-3 text-xs bg-[var(--surface-2)] rounded-lg p-2.5 border border-border line-clamp-3">{p.prompt}</p>
            <div className="mt-auto pt-3 flex gap-2">
              <Btn size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(p.prompt)}><Copy className="h-3.5 w-3.5" /> Copy</Btn>
              <Btn size="sm" onClick={() => runIt(p)}><Play className="h-3.5 w-3.5" /> Run</Btn>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
