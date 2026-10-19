import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Globe, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checklist, SourceList } from "@/components/shared";
import { useI18n } from "@/lib/i18n";
import { procedureQuery } from "@/lib/api/queries";

export const Route = createFileRoute("/procedures/$id")({
  head: () => ({
    meta: [
      { title: "Procedure Guide — Túsinik AI" },
      { name: "description", content: "Step-by-step guide, conditions, checklist and official sources for this procedure." },
      { property: "og:title", content: "Procedure Guide — Túsinik AI" },
      { property: "og:description", content: "Steps, checklist and official sources." },
    ],
  }),
  component: ProcedurePage,
});

const channelIcon = { online: Globe, in_person: Users, either: Globe };

function ProcedurePage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { data: p, isLoading } = useQuery(procedureQuery(lang, id));

  if (isLoading) return <div className="mx-auto max-w-5xl space-y-4 px-4 py-10"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-64" /></div>;
  if (!p)
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{t("not_found")}</h1>
        <Button asChild variant="link"><Link to="/procedures">{t("back")}</Link></Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/procedures" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("nav_procedures")}
      </Link>
      <h1 className="animate-rise text-3xl font-bold md:text-4xl">{p.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{p.summary}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {p.prerequisites.length > 0 && (
            <section className="rounded-2xl bg-secondary p-5">
              <h2 className="mb-2 text-base font-semibold">{t("prerequisites")}</h2>
              <ul className="list-disc space-y-1 pl-5">{p.prerequisites.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          )}
          <section>
            <h2 className="mb-4 text-xl font-semibold">{t("steps")}</h2>
            <ol className="relative space-y-4 border-l-2 border-border pl-6">
              {p.steps.map((s, i) => {
                const Icon = channelIcon[s.channel];
                return (
                  <li key={s.title} className="relative">
                    <span className="absolute -left-[37px] grid size-7 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-sans text-base font-bold">{s.title}</h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          <Icon className="size-3" /> {t(s.channel)}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{s.detail}</p>
                      {s.location && <p className="mt-2 flex items-center gap-1 text-sm"><MapPin className="size-4 text-primary" /> {s.location}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
          <Button asChild variant="hero" size="lg">
            <a href={p.officialServiceUrl} target="_blank" rel="noopener noreferrer">{t("open_service")} <ExternalLink /></a>
          </Button>
        </div>
        <aside className="space-y-6">
          <Checklist procedureId={p.id} items={p.checklist} />
          <SourceList sources={p.sources} />
        </aside>
      </div>
    </div>
  );
}
