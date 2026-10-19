import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, FileText, GraduationCap, Home as HomeIcon, IdCard, ScrollText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { categoriesQuery } from "@/lib/api/queries";
import type { CategoryId } from "@/lib/api/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Túsinik AI — Government services explained simply" },
      { name: "description", content: "Ask about Kazakhstan government services in Kazakh or Russian and get clear steps, checklists and official sources." },
      { property: "og:title", content: "Túsinik AI — Government services explained simply" },
      { property: "og:description", content: "Plain-language guidance on Kazakhstan procedures with official sources." },
    ],
  }),
  component: Index,
});

const icons: Record<CategoryId, typeof IdCard> = {
  identity: IdCard,
  education: GraduationCap,
  residence: HomeIcon,
  certificates: ScrollText,
};

const examples = {
  kk: ["Жеке куәлігімді жоғалттым, не істеймін?", "Пәтерге қалай тіркелемін?", "Сотталмағандығы туралы анықтаманы қалай аламын?"],
  ru: ["Я потерял удостоверение личности, что делать?", "Как прописаться в квартире?", "Как получить справку о несудимости?"],
};

function Index() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data: cats } = useQuery(categoriesQuery());
  const go = (question: string) => question.trim() && navigate({ to: "/assistant", search: { q: question.trim() } });

  return (
    <>
      <section className="bg-hero">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center md:pt-24">
          <h1 className="animate-rise text-4xl font-bold leading-tight md:text-6xl">{t("hero_title")}</h1>
          <p className="mx-auto mt-5 max-w-2xl animate-rise text-lg text-muted-foreground md:text-xl">{t("hero_sub")}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go(q);
            }}
            className="mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-elegant"
          >
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" aria-hidden />
            <label htmlFor="q" className="sr-only">{t("ask_btn")}</label>
            <input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("ask_placeholder")}
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" variant="hero" size="lg">
              {t("ask_btn")} <ArrowRight />
            </Button>
          </form>
          <Link to="/documents" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
            <FileText className="size-4" /> {t("or_document")}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 text-xl font-semibold">{t("examples")}</h2>
        <div className="flex flex-wrap gap-2">
          {examples[lang].map((e) => (
            <Button key={e} variant="soft" onClick={() => go(e)}>{e}</Button>
          ))}
        </div>

        <h2 className="mb-4 mt-12 text-xl font-semibold">{t("categories")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cats?.map((c) => {
            const Icon = icons[c.id];
            return (
              <Link
                key={c.id}
                to="/procedures"
                search={{ category: c.id }}
                className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{c.title[lang]}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.description[lang]}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
