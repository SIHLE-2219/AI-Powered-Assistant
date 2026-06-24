import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { AiDisclaimer, Btn, Card, Input, Select } from "@/components/ui-kit";
import { useState } from "react";
import { aiRun } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Copy, Sparkles, History, BookOpen } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { type ResearchDoc, type Stats, defaultStats, uid } from "@/lib/storage";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Research Assistant — Aria" }] }),
  component: Research,
});

function Research() {
  const run = useServerFn(aiRun);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("Executive brief");
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useLocalStorage<ResearchDoc[]>("aria.research", []);
  const [, setStats] = useLocalStorage<Stats>("aria.stats", defaultStats);

  const research = async () => {
    if (!topic) return;
    setBusy(true);
    try {
      const res = (await run({ data: { action: "research", payload: { topic, depth } } })) as { text: string };
      setBrief(res.text);
      setHistory((h) => [{ id: uid(), topic, brief: res.text, createdAt: Date.now() }, ...h].slice(0, 25));
      setStats((s) => ({ ...s, researchSessions: s.researchSessions + 1, hoursSaved: +(s.hoursSaved + 1).toFixed(2) }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout title="AI Research Assistant" subtitle="Get executive briefs, insights, and recommendations on any topic.">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold mb-3">Research a topic</h3>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <Input placeholder="e.g. AI adoption in financial services, 2025" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && research()} />
              <Select value={depth} onChange={(e) => setDepth(e.target.value)}>
                {["Executive brief", "Deep dive", "Bullet summary", "Comparative analysis"].map((d) => <option key={d}>{d}</option>)}
              </Select>
              <Btn onClick={research} disabled={!topic || busy}><Sparkles className="h-4 w-4" /> {busy ? "Researching…" : "Research"}</Btn>
            </div>
          </Card>

          {brief ? (
            <Card>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold">{topic}</h3>
                <Btn variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(brief)}><Copy className="h-3.5 w-3.5" /> Copy</Btn>
              </div>
              <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{brief}</ReactMarkdown></div>
              <AiDisclaimer confidence={87} />
            </Card>
          ) : (
            <Card className="grid place-items-center text-center min-h-[280px] border-dashed">
              <div>
                <BookOpen className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Your research brief will appear here.</p>
              </div>
            </Card>
          )}
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Research history</h3>
          </div>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {history.length === 0 && <p className="text-xs text-muted-foreground">Past research will appear here.</p>}
            {history.map((h) => (
              <button key={h.id} onClick={() => { setTopic(h.topic); setBrief(h.brief); }} className="w-full text-left text-xs rounded-lg border border-border bg-[var(--surface-2)] px-2.5 py-2 hover:border-primary/40 truncate">
                {h.topic}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
