import { createFileRoute } from "@tanstack/react-router";
import { Ban, BookCheck, Eye, KeyRound, Lock, Scale } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Safety — Túsinik AI" },
      { name: "description", content: "What Túsinik AI can and cannot do, privacy practices and non-affiliation with government portals." },
      { property: "og:title", content: "About & Safety — Túsinik AI" },
      { property: "og:description", content: "Capabilities, limitations and privacy practices." },
    ],
  }),
  component: About,
});

const items = {
  kk: [
    { icon: BookCheck, title: "Не істейді", text: "Мемлекеттік рәсімдерді қарапайым тілмен түсіндіреді, қадамдар мен ресми дереккөздерді көрсетеді." },
    { icon: Scale, title: "Шектеулер", text: "Заң кеңесі емес. Шешімді әрқашан құзыретті орган қабылдайды." },
    { icon: Ban, title: "Ресми портал емес", text: "Түсінік AI eGov.kz немесе мемлекеттік органдармен байланысты емес." },
    { icon: KeyRound, title: "Құпия деректер", text: "Біз eGov құпиясөзін, ЭЦҚ кілтін немесе SMS кодтарын ешқашан сұрамаймыз." },
    { icon: Lock, title: "Құпиялылық", text: "Жүктелген құжаттар өңдеуден кейін жойылады. Толық мәтіндер журналға жазылмайды." },
    { icon: Eye, title: "AI провайдерлері", text: "Жауаптар сыртқы тіл моделі арқылы жасалады; олардың деректер саясаты қолданылады." },
  ],
  ru: [
    { icon: BookCheck, title: "Что умеет", text: "Объясняет госпроцедуры простым языком, показывает шаги и официальные источники." },
    { icon: Scale, title: "Ограничения", text: "Не является юридической консультацией. Решение всегда принимает компетентный орган." },
    { icon: Ban, title: "Не официальный портал", text: "Түсінік AI не связан с eGov.kz или государственными органами." },
    { icon: KeyRound, title: "Чувствительные данные", text: "Мы никогда не запрашиваем пароль eGov, ключ ЭЦП или SMS-коды." },
    { icon: Lock, title: "Конфиденциальность", text: "Загруженные документы удаляются после обработки. Полные тексты не логируются." },
    { icon: Eye, title: "AI-провайдеры", text: "Ответы генерируются внешней языковой моделью; действуют её правила обработки данных." },
  ],
};

function About() {
  const { t, lang } = useI18n();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title={t("nav_about")} sub={t("independent")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items[lang].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <Icon className="size-6 text-primary" />
            <h2 className="mt-3 font-sans text-lg font-bold">{title}</h2>
            <p className="mt-1 text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
