import { type ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card-surface p-5 ${className}`}>{children}</div>;
}

export function KpiCard({ label, value, hint, icon, accent }: { label: string; value: string | number; hint?: string; icon: ReactNode; accent?: boolean }) {
  return (
    <div className="card-surface relative overflow-hidden p-5">
      {accent && <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20" style={{ background: "var(--gradient-primary)" }} />}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground truncate">{hint}</p>}
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary" style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "subtle"; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-11 px-5 text-sm" };
  const variants = {
    primary: "text-[var(--primary-foreground)] font-semibold shadow-[var(--shadow-glow)] hover:brightness-110",
    ghost: "text-foreground hover:bg-[var(--surface-2)]",
    outline: "border border-border bg-transparent hover:bg-[var(--surface-2)] text-foreground",
    subtle: "bg-[var(--surface-2)] text-foreground hover:bg-[color-mix(in_oklab,var(--surface-2)_85%,var(--primary))]",
  };
  const style = variant === "primary" ? { background: "var(--gradient-primary)" } : undefined;
  return (
    <button {...props} style={style} className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" | "info" }) {
  const tones = {
    default: "bg-[var(--surface-2)] text-muted-foreground",
    success: "bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] text-primary",
    warning: "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[var(--warning)]",
    danger: "bg-[color-mix(in_oklab,var(--destructive)_22%,transparent)] text-[var(--destructive)]",
    info: "bg-[color-mix(in_oklab,var(--info)_18%,transparent)] text-[var(--info)]",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tones[tone]}`}>{children}</span>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-xl border border-border bg-[var(--surface-2)] px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-xl border border-border bg-[var(--surface-2)] px-3.5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-xl border border-border bg-[var(--surface-2)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${props.className ?? ""}`} />;
}

export function AiDisclaimer({ confidence }: { confidence?: number }) {
  const conf = confidence ?? Math.round(85 + Math.random() * 10);
  return (
    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-[var(--surface-2)]/60 px-3 py-2 text-[11px] text-muted-foreground">
      <span>⚠ AI-generated content should be reviewed before use.</span>
      <span className="shrink-0 inline-flex items-center gap-1.5 text-primary font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {conf}% confidence
      </span>
    </div>
  );
}
