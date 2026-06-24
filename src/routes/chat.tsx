import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { AiDisclaimer, Btn, Card, Pill } from "@/components/ui-kit";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Trash2, Star, Mic } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Assistant — Aria" }] }),
  component: ChatPage,
});

const QUICK = [
  { label: "Write an email", prompt: "Help me write a professional email to a client following up on a project update." },
  { label: "Summarize meeting", prompt: "Summarize this meeting and extract action items: " },
  { label: "Plan my day", prompt: "Help me create a prioritized plan for today. My tasks are: " },
  { label: "Research topic", prompt: "Give me an executive brief on " },
  { label: "Brainstorm ideas", prompt: "Brainstorm 5 ideas for " },
];

function ChatPage() {
  const [initial, setInitial] = useLocalStorage<UIMessage[]>("aria.chat", []);
  const [input, setInput] = useState("");
  const [favorites, setFavorites] = useLocalStorage<string[]>("aria.favPrompts", []);
  const transportRef = useRef(new DefaultChatTransport({ api: "/api/chat" }));

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "main",
    messages: initial,
    transport: transportRef.current,
  });

  useEffect(() => {
    if (status === "ready") setInitial(messages);
  }, [messages, status, setInitial]);

  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const send = async () => {
    if (!input.trim() || status === "submitted" || status === "streaming") return;
    const text = input.trim();
    setInput("");
    await sendMessage({ text });
  };

  const clear = () => {
    setMessages([]);
    setInitial([]);
  };

  return (
    <Layout
      title="AI Assistant"
      subtitle="Chat with Aria — your context-aware workplace assistant."
      actions={
        <div className="flex gap-2">
          <Btn variant="outline" size="sm" onClick={clear}>
            <Trash2 className="h-4 w-4" /> Clear
          </Btn>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="flex flex-col p-0 overflow-hidden" >
          <div ref={scroller} className="scrollbar-thin flex-1 overflow-y-auto p-5 space-y-5" style={{ maxHeight: "calc(100vh - 320px)", minHeight: 420 }}>
            {messages.length === 0 && (
              <div className="grid place-items-center h-full text-center">
                <div className="max-w-md">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
                    <Sparkles className="h-7 w-7 text-[var(--primary-foreground)]" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">How can I help you today?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Ask me to write, summarize, plan, or research.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {QUICK.slice(0, 4).map((q) => (
                      <button key={q.label} onClick={() => setInput(q.prompt)} className="rounded-full border border-border bg-[var(--surface-2)] px-3 py-1.5 text-xs hover:border-primary/40 hover:text-primary transition">
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                      <Sparkles className="h-4 w-4 text-[var(--primary-foreground)]" />
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? "text-[var(--primary-foreground)]" : "bg-[var(--surface-2)] border border-border text-foreground"}`} style={isUser ? { background: "var(--gradient-primary)" } : undefined}>
                    {isUser ? <span className="whitespace-pre-wrap">{text}</span> : <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-headings:mt-3 prose-headings:mb-1.5"><ReactMarkdown>{text}</ReactMarkdown></div>}
                  </div>
                  {!isUser && text && (
                    <button onClick={() => setFavorites((f) => (f.includes(text.slice(0, 80)) ? f : [...f, text.slice(0, 80)]))} className="shrink-0 text-muted-foreground hover:text-primary" aria-label="Favorite">
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {(status === "submitted" || status === "streaming") && (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                  <Sparkles className="h-4 w-4 text-[var(--primary-foreground)] animate-pulse" />
                </div>
                <div className="rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-4 bg-[var(--surface)]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Message Aria… (Shift+Enter for new line)"
                rows={1}
                className="resize-none rounded-xl border border-border bg-[var(--surface-2)] px-3.5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-40"
              />
              <Btn variant="outline" size="md" onClick={() => alert("Voice input coming soon")} aria-label="Voice">
                <Mic className="h-4 w-4" />
              </Btn>
              <Btn onClick={send} disabled={!input.trim() || status === "submitted" || status === "streaming"}>
                <Send className="h-4 w-4" /> Send
              </Btn>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Aria can make mistakes. Verify important information.</p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold">Quick Actions</h3>
            <div className="mt-3 flex flex-col gap-1.5">
              {QUICK.map((q) => (
                <button key={q.label} onClick={() => setInput(q.prompt)} className="text-left text-xs rounded-lg border border-border bg-[var(--surface-2)] px-3 py-2 hover:border-primary/40 hover:text-primary transition">
                  {q.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <h3 className="text-sm font-semibold">Favorites</h3>
              <Pill>{favorites.length}</Pill>
            </div>
            <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
              {favorites.length === 0 && <p className="text-xs text-muted-foreground">Star AI replies to save them here.</p>}
              {favorites.map((f, i) => (
                <div key={i} className="text-xs rounded-lg bg-[var(--surface-2)] border border-border px-2.5 py-1.5 truncate">{f}…</div>
              ))}
            </div>
          </Card>
          <AiDisclaimer confidence={92} />
        </div>
      </div>
    </Layout>
  );
}
