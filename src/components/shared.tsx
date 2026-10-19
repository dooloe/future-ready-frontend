import { useEffect, useState } from "react";
import { AlertTriangle, Check, Copy, ExternalLink, Landmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/lib/i18n";
import type { ChecklistItem, SourceRef } from "@/lib/api/types";

export function CopyButton({ text }: { text: string }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        toast.success(t("copied"));
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check /> : <Copy />} {t("copy")}
    </Button>
  );
}

export function SourceList({ sources }: { sources: SourceRef[] }) {
  const { t } = useI18n();
  if (!sources.length) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("sources")}</h4>
      <ul className="space-y-2">
        {sources.map((s) => (
          <li key={s.id} className="rounded-xl border border-border bg-background p-3">
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 font-semibold text-primary hover:underline">
              <Landmark className="mt-0.5 size-4 shrink-0" />
              <span className="flex-1">{s.title}</span>
              <ExternalLink className="mt-0.5 size-4 shrink-0" />
            </a>
            <p className="ml-6 text-sm text-muted-foreground">
              {s.institution}
              {s.verifiedAt && ` · ${s.verifiedAt}`}
            </p>
            {s.warning && (
              <p className="ml-6 mt-1 flex items-center gap-1 text-xs font-medium text-warning-foreground">
                <AlertTriangle className="size-3.5" /> {s.warning}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Checklist progress is kept in sessionStorage only (per spec). */
export function Checklist({ procedureId, items }: { procedureId: string; items: ChecklistItem[] }) {
  const { t } = useI18n();
  const key = `tusinik-check-${procedureId}`;
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try {
      setDone(JSON.parse(sessionStorage.getItem(key) ?? "[]"));
    } catch {
      /* ignore */
    }
  }, [key]);
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    sessionStorage.setItem(key, JSON.stringify(next));
  };
  const pct = items.length ? Math.round((done.length / items.length) * 100) : 0;
  const text = items.map((i) => `${done.includes(i.id) ? "☑" : "☐"} ${i.label}${i.condition ? ` (${i.condition})` : ""}`).join("\n");
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{t("checklist")}</h3>
        <CopyButton text={text} />
      </div>
      <div className="mb-4 flex items-center gap-3" aria-label={`${done.length}/${items.length} ${t("prepared")}`}>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          {done.length}/{items.length}
        </span>
      </div>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted">
              <Checkbox checked={done.includes(i.id)} onCheckedChange={() => toggle(i.id)} className="mt-1" />
              <span className={done.includes(i.id) ? "text-muted-foreground line-through" : ""}>
                {i.label}
                {i.condition && (
                  <span className="ml-2 rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-warning-foreground">
                    {i.condition}
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8 animate-rise">
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      {sub && <p className="mt-2 text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
}
