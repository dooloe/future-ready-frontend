import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, CalendarDays, FileUp, ListChecks, Loader2, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, PageHeader } from "@/components/shared";
import { useI18n } from "@/lib/i18n";
import { api, MAX_UPLOAD_BYTES } from "@/lib/api/client";
import { ApiError, type ExplainResponse } from "@/lib/api/types";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Document Explainer — Túsinik AI" },
      { name: "description", content: "Paste text or upload a PDF/TXT to get a plain-language summary, dates, actions and terms." },
      { property: "og:title", content: "Document Explainer — Túsinik AI" },
      { property: "og:description", content: "Understand official documents in plain language." },
    ],
  }),
  component: Documents,
});

function Documents() {
  const { t, lang } = useI18n();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tab, setTab] = useState("paste");
  const [err, setErr] = useState<string | null>(null);

  const explain = useMutation({
    mutationFn: () => api.explainDocument(tab === "paste" ? { lang, text } : { lang, file: file! }),
    onError: (e) =>
      setErr(e instanceof ApiError && e.code === "unsupported_file" ? t("unsupported") : t("error")),
  });

  const pick = (f: File | undefined) => {
    setErr(null);
    if (!f) return;
    if (!/\.(pdf|txt)$/i.test(f.name)) return setErr(t("unsupported"));
    if (f.size > MAX_UPLOAD_BYTES) return setErr(t("too_large"));
    setFile(f);
  };
  const canSubmit = tab === "paste" ? text.trim().length > 10 : !!file;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title={t("doc_title")} sub={t("doc_sub")} />

      <div className="mb-5 flex gap-3 rounded-2xl bg-warning p-4 text-warning-foreground" role="note">
        <ShieldAlert className="size-5 shrink-0" />
        <p className="text-sm font-medium">{t("doc_warning")}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="paste">{t("doc_paste")}</TabsTrigger>
            <TabsTrigger value="upload">{t("doc_upload")}</TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="mt-4">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} className="text-base" aria-label={t("doc_paste")} />
          </TabsContent>
          <TabsContent value="upload" className="mt-4">
            {file ? (
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <FileUp className="size-5 text-primary" />
                <span className="flex-1 truncate font-medium">{file.name}</span>
                <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setFile(null)}><X /></Button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-10 text-center text-muted-foreground hover:border-primary hover:text-foreground">
                <FileUp className="size-8 text-primary" />
                {t("doc_drop")}
                <input type="file" accept=".pdf,.txt,application/pdf,text/plain" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
              </label>
            )}
          </TabsContent>
        </Tabs>
        {err && <p className="mt-3 text-sm font-medium text-destructive" role="alert">{err}</p>}
        <Button variant="hero" size="lg" className="mt-4" disabled={!canSubmit || explain.isPending} onClick={() => { setErr(null); explain.mutate(); }}>
          {explain.isPending ? <><Loader2 className="animate-spin" /> {t("doc_analyzing")}</> : t("doc_explain")}
        </Button>
      </div>

      {explain.data && <Result r={explain.data} />}
    </div>
  );
}

function Result({ r }: { r: ExplainResponse }) {
  const { t } = useI18n();
  const copy = [`${t("summary")}: ${r.summary}`, `${t("purpose")}: ${r.purpose}`, ...r.actions.map((a) => `• ${a}`)].join("\n");
  const Section = ({ title, icon: Icon, children }: { title: string; icon: typeof ListChecks; children: React.ReactNode }) => (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold"><Icon className="size-5 text-primary" /> {title}</h3>
      {children}
    </section>
  );
  const empty = <p className="text-muted-foreground">{t("none_found")}</p>;
  return (
    <div className="mt-8 animate-rise space-y-4">
      <div className="rounded-2xl bg-secondary p-6">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-semibold">{t("summary")}</h2>
          <CopyButton text={copy} />
        </div>
        <p className="mt-2 leading-relaxed">{r.summary}</p>
        <p className="mt-3 text-sm"><strong>{t("purpose")}:</strong> {r.purpose}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Section title={t("dates")} icon={CalendarDays}>
          {r.dates.length ? (
            <ul className="space-y-2">{r.dates.map((d) => <li key={d.date + d.context}><strong>{d.date}</strong> — <span className="text-muted-foreground">{d.context}</span></li>)}</ul>
          ) : empty}
        </Section>
        <Section title={t("actions")} icon={ListChecks}>
          {r.actions.length ? <ul className="list-disc space-y-1 pl-5">{r.actions.map((a) => <li key={a}>{a}</li>)}</ul> : empty}
        </Section>
        <Section title={t("terms")} icon={ListChecks}>
          {r.terms.length ? (
            <dl className="space-y-2">{r.terms.map((x) => <div key={x.term}><dt className="font-semibold">{x.term}</dt><dd className="text-muted-foreground">{x.explanation}</dd></div>)}</dl>
          ) : empty}
        </Section>
        <Section title={t("uncertainties")} icon={AlertTriangle}>
          {r.uncertainties.length ? <ul className="list-disc space-y-1 pl-5">{r.uncertainties.map((u) => <li key={u}>{u}</li>)}</ul> : empty}
        </Section>
      </div>
    </div>
  );
}
