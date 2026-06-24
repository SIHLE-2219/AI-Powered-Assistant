import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Btn, Card, Input, Pill } from "@/components/ui-kit";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultStats, type Stats } from "@/lib/storage";
import { Download, RotateCcw, ShieldCheck, Upload } from "lucide-react";
import { useRef } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Aria" }] }),
  component: Settings,
});

type Prefs = { name: string; email: string; notifications: { deadlines: boolean; overdue: boolean; meetings: boolean; suggestions: boolean }; accentHue: number };
const DEFAULT_PREFS: Prefs = { name: "Alex Morgan", email: "alex@company.com", notifications: { deadlines: true, overdue: true, meetings: true, suggestions: false }, accentHue: 152 };

function Settings() {
  const [prefs, setPrefs] = useLocalStorage<Prefs>("aria.prefs", DEFAULT_PREFS);
  const [, setStats] = useLocalStorage<Stats>("aria.stats", defaultStats);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportAll = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith("aria.")) data[k] = JSON.parse(localStorage.getItem(k) || "null");
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aria-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importAll = async (f: File) => {
    const data = JSON.parse(await f.text()) as Record<string, unknown>;
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, JSON.stringify(v));
    location.reload();
  };

  const resetAll = () => {
    if (!confirm("Reset all Aria data? This cannot be undone.")) return;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)!;
      if (k.startsWith("aria.")) localStorage.removeItem(k);
    }
    setStats(defaultStats);
    location.reload();
  };

  return (
    <Layout title="Settings" subtitle="Manage your profile, notifications, and AI preferences.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold">Profile</h3>
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <Input value={prefs.name} onChange={(e) => setPrefs({ ...prefs, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <Input type="email" value={prefs.email} onChange={(e) => setPrefs({ ...prefs, email: e.target.value })} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold">Notifications</h3>
          <div className="mt-3 space-y-2">
            {(["deadlines", "overdue", "meetings", "suggestions"] as const).map((k) => (
              <label key={k} className="flex items-center gap-3 rounded-xl border border-border bg-[var(--surface-2)] px-3 py-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.notifications[k]}
                  onChange={(e) => setPrefs({ ...prefs, notifications: { ...prefs.notifications, [k]: e.target.checked } })}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span className="capitalize flex-1">{k === "suggestions" ? "AI suggestions" : k}</span>
                <Pill tone={prefs.notifications[k] ? "success" : "default"}>{prefs.notifications[k] ? "On" : "Off"}</Pill>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold">Appearance</h3>
          <p className="text-xs text-muted-foreground mt-1">Dark mode is on by default for focus.</p>
          <div className="mt-4">
            <label className="text-xs text-muted-foreground">Green accent hue</label>
            <input type="range" min="100" max="180" value={prefs.accentHue} onChange={(e) => setPrefs({ ...prefs, accentHue: +e.target.value })} className="w-full mt-2 accent-[var(--primary)]" />
            <div className="mt-2 h-3 rounded-full" style={{ background: "var(--gradient-primary)" }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Responsible AI</h3>
          </div>
          <ul className="mt-3 space-y-2 text-xs">
            {[
              { t: "Bias Awareness", d: "AI may reflect biases. Apply critical judgment." },
              { t: "Human Verification", d: "Verify facts before sending or publishing." },
              { t: "Data Privacy", d: "Do not paste sensitive personal data into prompts." },
              { t: "Accuracy Validation", d: "Cross-check critical numbers and citations." },
              { t: "Transparency", d: "Disclose AI assistance where appropriate." },
            ].map((i) => (
              <li key={i.t} className="rounded-lg border border-border bg-[var(--surface-2)] p-3">
                <p className="font-semibold">{i.t}</p>
                <p className="text-muted-foreground mt-0.5">{i.d}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold">Data</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn variant="outline" onClick={exportAll}><Download className="h-4 w-4" /> Export Backup</Btn>
            <Btn variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import</Btn>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])} />
            <Btn variant="outline" onClick={resetAll}><RotateCcw className="h-4 w-4" /> Reset All Data</Btn>
          </div>
          <p className="text-xs text-muted-foreground mt-3">All app data is stored locally in your browser.</p>
        </Card>
      </div>
    </Layout>
  );
}
