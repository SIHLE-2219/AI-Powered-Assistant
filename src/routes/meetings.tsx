import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { AiDisclaimer, Btn, Card, Textarea } from "@/components/ui-kit";
import { useState } from "react";
import { aiRun } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Copy, Download, Mail, Sparkles, Share2, Upload } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { type MeetingDoc, type Stats, defaultStats, uid } from "@/lib/storage";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meeting Summaries — Aria" }] }),
  component: Meetings,
});

function Meetings() {
  const run = useServerFn(aiRun);
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [followup, setFollowup] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [docs, setDocs] = useLocalStorage<MeetingDoc[]>("aria.meetings", []);
  const [, setStats] = useLocalStorage<Stats>("aria.stats", defaultStats);

  const summarize = async () => {
    if (!notes) return;
    try {
      setBusy("sum");
      const res = (await run({ data: { action: "meeting_summarize", payload: { notes } } })) as { text: string };
      setSummary(res.text);
      setDocs((d) => [{ id: uid(), title: notes.slice(0, 60), notes, summary: res.text, createdAt: Date.now() }, ...d].slice(0, 30));
      setStats((s) => ({ ...s, meetingsSummarized: s.meetingsSummarized + 1, hoursSaved: +(s.hoursSaved + 0.5).toFixed(2) }));
    } finally {
      setBusy(null);
    }
  };

  const draftFollowup = async () => {
    try {
      setBusy("fu");
      const res = (await run({ data: { action: "meeting_followup", payload: { notes } } })) as { text: string };
      setFollowup(res.text);
    } finally {
      setBusy(null);
    }
  };

  const upload = async (file: File) => setNotes(await file.text());

  return (
    <Layout title="Meeting Notes Summarizer" subtitle="Extract decisions, action items, and follow-ups instantly.">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <h3 className="text-sm font-semibold">Meeting notes / transcript</h3>
            <label className="cursor-pointer text-xs text-primary hover:underline inline-flex items-center gap-1">
              <Upload className="h-3.5 w-3.5" /> Upload
              <input type="file" accept=".txt,.md,.vtt,.srt" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          </div>
          <Textarea className="mt-3" rows={18} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste raw notes or a transcript here…" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn onClick={summarize} disabled={!notes || !!busy}><Sparkles className="h-4 w-4" /> {busy === "sum" ? "Summarizing…" : "Generate Summary"}</Btn>
            <Btn variant="outline" onClick={draftFollowup} disabled={!notes || !!busy}><Mail className="h-4 w-4" /> Follow-up Email</Btn>
          </div>

          {docs.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Recent</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                {docs.slice(0, 5).map((d) => (
                  <button key={d.id} onClick={() => { setNotes(d.notes); setSummary(d.summary); }} className="w-full text-left text-xs rounded-lg border border-border bg-[var(--surface-2)] px-2.5 py-1.5 hover:border-primary/40 truncate">
                    {d.title}…
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {summary ? (
            <Card>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <h3 className="text-sm font-semibold">AI Summary</h3>
                <div className="flex gap-2">
                  <Btn variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(summary)}><Copy className="h-3.5 w-3.5" /></Btn>
                  <Btn variant="outline" size="sm" onClick={() => { const w = window.open("", "_blank"); w?.document.write(`<pre style="font-family:system-ui;padding:24px;white-space:pre-wrap">${summary}</pre>`); setTimeout(() => w?.print(), 250); }}><Download className="h-3.5 w-3.5" /></Btn>
                  <Btn variant="outline" size="sm" onClick={() => navigator.share?.({ title: "Meeting summary", text: summary }).catch(() => {})}><Share2 className="h-3.5 w-3.5" /></Btn>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none mt-3"><ReactMarkdown>{summary}</ReactMarkdown></div>
              <AiDisclaimer />
            </Card>
          ) : (
            <Card className="grid place-items-center text-center min-h-[300px] border-dashed">
              <div>
                <Sparkles className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Your AI-extracted summary will appear here.</p>
                <p className="text-xs text-muted-foreground mt-1">Key points · Decisions · Action items · Risks · Sentiment</p>
              </div>
            </Card>
          )}

          {followup && (
            <Card>
              <h3 className="text-sm font-semibold mb-2">Follow-up Email Draft</h3>
              <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{followup}</ReactMarkdown></div>
              <Btn variant="outline" size="sm" className="mt-3" onClick={() => navigator.clipboard.writeText(followup)}><Copy className="h-3.5 w-3.5" /> Copy</Btn>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
