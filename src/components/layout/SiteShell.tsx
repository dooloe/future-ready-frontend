import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { isMockApi } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const links: { to: "/" | "/assistant" | "/documents" | "/procedures" | "/about"; key: DictKey }[] = [
  { to: "/", key: "nav_home" },
  { to: "/assistant", key: "nav_assistant" },
  { to: "/documents", key: "nav_documents" },
  { to: "/procedures", key: "nav_procedures" },
  { to: "/about", key: "nav_about" },
];

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div role="group" aria-label="Language" className="flex rounded-full border border-border bg-card p-0.5 text-sm font-semibold">
      {(["kk", "ru"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-3 py-1 uppercase transition-colors",
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l === "kk" ? "Қаз" : "Рус"}
        </button>
      ))}
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2">Skip</a>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary font-display text-sm font-bold text-primary-foreground">Т</span>
            <span className="font-display text-lg font-semibold">{t("brand")}</span>
          </Link>
          {isMockApi && (
            <span className="hidden rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-warning-foreground sm:inline">
              {t("mock_badge")}
            </span>
          )}
          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto md:ml-2"><LangSwitch /></div>
          <button className="md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <Menu className="size-6" />
          </button>
        </div>
        {open && (
          <nav className="flex flex-col border-t border-border px-4 py-2 md:hidden" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-3 font-medium">
                {t(l.key)}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="border-t border-border bg-muted/50">
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-6 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <p>{t("independent")}</p>
        </div>
      </footer>
    </div>
  );
}
