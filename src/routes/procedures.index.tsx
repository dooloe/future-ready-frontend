import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { categoriesQuery, proceduresQuery } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/procedures/")({
  validateSearch: z.object({
    category: z.enum(["identity", "education", "residence", "certificates"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Procedure Guides — Túsinik AI" },
      { name: "description", content: "Step-by-step guides and document checklists for common Kazakhstan government procedures." },
      { property: "og:title", content: "Procedure Guides — Túsinik AI" },
      { property: "og:description", content: "Steps, conditions and checklists for government procedures." },
    ],
  }),
  component: Procedures,
});

function Procedures() {
  const { t, lang } = useI18n();
  const { category } = Route.useSearch();
  const { data: cats } = useQuery(categoriesQuery());
  const { data, isLoading } = useQuery(proceduresQuery(lang, category));
  const chip = (active: boolean) =>
    cn("rounded-full border px-4 py-2 text-sm font-semibold transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title={t("proc_title")} sub={t("proc_sub")} />
      <div className="mb-6 flex flex-wrap gap-2">
        <Link to="/procedures" search={{}} className={chip(!category)}>{t("all")}</Link>
        {cats?.map((c) => (
          <Link key={c.id} to="/procedures" search={{ category: c.id }} className={chip(category === c.id)}>{c.title[lang]}</Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        {data?.map((p) => (
          <Link key={p.id} to="/procedures/$id" params={{ id: p.id }} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="mt-2 text-muted-foreground">{p.summary}</p>
            <span className="mt-4 inline-flex items-center gap-1 font-semibold text-primary">{t("open_guide")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
