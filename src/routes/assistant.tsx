import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, HelpCircle, Loader2, RotateCcw, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton, SourceList } from "@/components/shared";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api/client";
import type { AskResponse, ChatTurn } from "@/lib/api/types";

export const Route = createFileRoute("/assistant")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Assistant — Túsinik AI" },
      { name: "description", content: "Ask questions about government procedures and get cited, plain-language answers." },
      { property: "og:title", content: "Assistant — Túsinik AI" },
      { property: "og:description", content: "Cited, plain-language answers about Kazakhstan government services." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user"; content: string } | { role: "assistant"; content: string; res: AskResponse };
const STORE = "tusinik-chat";

function Assistant() {
  const { t, lang } = useI18n();
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const ask = useMutation({
    mutationFn: (question: string) => {
      const history: ChatTurn[] = msgs.map((m) => ({ role: m.role, content: m.content }));
      return api.ask({ lang, question, history });
    },
    onSuccess: (res) => setMsgs((m) => [...m, { role: "assistant", content: res.text, res }]),
    onError: () => toast.error(t("error")),
  });

  const send = (text: string) => {
    const v = text.trim();
    if (!v || ask.isPending) return;
    setMsgs((m) => [...m, { role: "user", content: v }]);
    setInput("");
    ask.mutate(v);
  };

  // Restore session conversation, then handle ?q= from home.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) ?? "[]") as Msg[];
      if (saved.length && !q) setMsgs(saved);
    } catch {
      /* ignore */
    }
    if (q) {
      navigate({ search: {}, replace: true });
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORE, JSON.stringify(msgs));
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, ask.isPending]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("nav_assistant")}</h1>
        {msgs.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMsgs([])}>
            <RotateCcw /> {t("new_chat")}
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-5" aria-live="polite">
        {msgs.length === 0 && !ask.isPending && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">{t("chat_empty")}</p>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end animate-rise">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">{m.content}</p>
            </div>
          ) : (
            <AnswerCard key={i} res={m.res} onFollowUp={send} isLast={i === msgs.length - 1} />
          ),
        )}
        {ask.isPending && (
          <div className="flex items-center gap-3 rounded-2xl bg-card p-4 text-muted-foreground shadow-soft">
            <Loader2 className="size-5 animate-spin text-primary" /> {t("thinking")}
          </div>
        )}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-4 mt-6 flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-elegant"
      >
        <label htmlFor="msg" className="sr-only">{t("ask_btn")}</label>
        <Textarea
          id="msg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={t("ask_placeholder")}
          rows={1}
          className="min-h-11 resize-none border-0 text-base shadow-none focus-visible:ring-0"
        />
        <Button type="submit" variant="hero" size="icon" className="size-11 shrink-0" disabled={ask.isPending} aria-label={t("ask_btn")}>
          <Send />
        </Button>
      </form>
    </div>
  );
}

function AnswerCard({ res, onFollowUp, isLast }: { res: AskResponse; onFollowUp: (q: string) => void; isLast: boolean }) {
  const { t, lang } = useI18n();
  const [fb, setFb] = useState<boolean | null>(null);
  const copyText = [res.text, ...res.nextActions.map((a, i) => `${i + 1}. ${a}`), ...res.sources.map((s) => s.url)].join("\n");

  return (
    <article className="animate-rise space-y-4 rounded-2xl rounded-bl-md border border-border bg-card p-5 shadow-soft">
      {res.kind === "clarification" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
          <HelpCircle className="size-3.5" /> {t("clarify")}
        </span>
      )}
      {res.kind === "unverified" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning px-2.5 py-1 text-xs font-bold text-warning-foreground">
          <AlertTriangle className="size-3.5" /> {t("unverified")}
        </span>
      )}
      <p className="whitespace-pre-line leading-relaxed">{res.text}</p>

      {res.kind === "answer" && res.nextActions.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("next_actions")}</h4>
          <ol className="space-y-2">
            {res.nextActions.map((a, i) => (
              <li key={a} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
          {res.procedureId && (
            <Button asChild variant="link" className="mt-2 px-0">
              <Link to="/procedures/$id" params={{ id: res.procedureId }}>
                {t("open_guide")} <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      )}
      {res.kind === "unverified" && (
        <Button asChild variant="outline">
          <a href="https://egov.kz" target="_blank" rel="noopener noreferrer">{res.nextActions[0]}</a>
        </Button>
      )}

      <SourceList sources={res.sources} />

      {isLast && res.suggestedFollowUps.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {res.suggestedFollowUps.map((f) => (
            <Button key={f} variant="soft" size="sm" onClick={() => onFollowUp(f)}>{f}</Button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 border-t border-border pt-3">
        <CopyButton text={copyText} />
        <div className="ml-auto flex items-center gap-1">
          {fb !== null ? (
            <span className="text-sm text-muted-foreground">{t("thanks")}</span>
          ) : (
            ([true, false] as const).map((h) => (
              <Button
                key={String(h)}
                variant="ghost"
                size="icon"
                aria-label={t(h ? "helpful" : "not_helpful")}
                onClick={() => {
                  setFb(h);
                  api.sendFeedback({ answerId: res.id, helpful: h, lang });
                }}
              >
                {h ? <ThumbsUp /> : <ThumbsDown />}
              </Button>
            ))
          )}
        </div>
      </div>
    </article>
  );
}
