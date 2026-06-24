import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { AiDisclaimer, Btn, Card, Input, Select, Textarea } from "@/components/ui-kit";
import { useState } from "react";
import { aiRun } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, Sparkles, Wand2, Scissors, Maximize2, Languages, FileCheck, Save } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { type EmailDoc, type Stats, defaultStats, uid } from "@/lib/storage";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Email Generator — Aria" }] }),
  component: EmailPage,
});

function EmailPage() {
  const run = useServerFn(aiRun);
  const [tone, setTone] = useState("Formal");
  const [audience, setAudience] = useState("Client");
  const [brief, setBrief] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [language, setLanguage] = useState("Spanish");
  const [busy, setBusy] = useState<string | null>(null);
  const [, setTemplates] = useLocalStorage<EmailDoc[]>("aria.emails", []);
  const [, setStats] = useLocalStorage<Stats>("aria.stats", defaultStats);

  const bump = () => setStats((s) => ({ ...s, emailsGenerated: s.emailsGenerated + 1, hoursSaved: +(s.hoursSaved + 0.1).toFixed(2) }));

  const act = async (action: string, payload: Record<string, string>, target: "body" | "subject" = "body") => {
    try {
      setBusy(action);
      const res = (await run({ data: { action: action as never, payload } })) as { text: string };
      if (target === "subject") setSubject(res.text);
      else setBody(res.text);
      if (action === "email_generate") bump();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const copy = () => navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);

  const exportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<pre style="font-family:system-ui;padding:24px;white-space:pre-wrap">Subject: ${subject}\n\n${body}</pre>`);
    w.document.title = subject || "Email";
    setTimeout(() => w.print(), 250);
  };

  const save = () => {
    if (!body) return;
    setTemplates((arr) => [{ id: uid(), title: subject || "Untitled email", subject, body, tone, audience, createdAt: Date.now() }, ...arr]);
    alert("Saved as template");
  };

  return (
    <Layout title="Smart Email Generator" subtitle="Draft, rewrite, translate, and polish emails in seconds.">
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Card>
          <h3 className="text-sm font-semibold">Compose</h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Tone</label>
              <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                {["Formal", "Informal", "Friendly", "Executive", "Persuasive"].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Audience</label>
              <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                {["Client", "Manager", "Team", "Stakeholder"].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">What do you want to say?</label>
              <Textarea rows={6} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. follow up on the Q4 proposal, ask for feedback by Friday…" />
            </div>
            <Btn className="w-full" onClick={() => act("email_generate", { tone, audience, brief })} disabled={!brief || !!busy}>
              <Sparkles className="h-4 w-4" /> {busy === "email_generate" ? "Generating…" : "Generate Email"}
            </Btn>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <label className="text-xs text-muted-foreground">Subject</label>
            <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line…" />
              <Btn variant="outline" onClick={() => act("email_subject", { body }, "subject")} disabled={!body || !!busy}>
                <Wand2 className="h-4 w-4" /> Suggest
              </Btn>
            </div>

            <label className="text-xs text-muted-foreground mt-4 block">Email body</label>
            <Textarea rows={14} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Your email will appear here…" />

            <div className="mt-3 flex flex-wrap gap-2">
              <Btn variant="subtle" size="sm" onClick={() => act("email_rewrite", { body, tone })} disabled={!body || !!busy}><Wand2 className="h-3.5 w-3.5" /> Rewrite</Btn>
              <Btn variant="subtle" size="sm" onClick={() => act("email_grammar", { body })} disabled={!body || !!busy}><FileCheck className="h-3.5 w-3.5" /> Grammar</Btn>
              <Btn variant="subtle" size="sm" onClick={() => act("email_shorten", { body })} disabled={!body || !!busy}><Scissors className="h-3.5 w-3.5" /> Shorten</Btn>
              <Btn variant="subtle" size="sm" onClick={() => act("email_expand", { body })} disabled={!body || !!busy}><Maximize2 className="h-3.5 w-3.5" /> Expand</Btn>
              <div className="inline-flex items-center gap-1">
                <Select className="!h-8 !py-1 !text-xs" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {["Spanish", "French", "German", "Portuguese", "Japanese", "Chinese", "Arabic"].map((l) => <option key={l}>{l}</option>)}
                </Select>
                <Btn variant="subtle" size="sm" onClick={() => act("email_translate", { body, language })} disabled={!body || !!busy}><Languages className="h-3.5 w-3.5" /> Translate</Btn>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-border">
              <Btn variant="outline" size="sm" onClick={copy} disabled={!body}><Copy className="h-3.5 w-3.5" /> Copy</Btn>
              <Btn variant="outline" size="sm" onClick={exportPdf} disabled={!body}><Download className="h-3.5 w-3.5" /> Export PDF</Btn>
              <Btn variant="outline" size="sm" onClick={save} disabled={!body}><Save className="h-3.5 w-3.5" /> Save Template</Btn>
            </div>

            <AiDisclaimer />
          </Card>

          {body && (
            <Card>
              <h3 className="text-sm font-semibold mb-2">Preview</h3>
              <div className="prose prose-invert prose-sm max-w-none">
                {subject && <p className="font-semibold !mb-2">Subject: {subject}</p>}
                <ReactMarkdown>{body}</ReactMarkdown>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
