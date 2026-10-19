import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/api/types";

const dict = {
  brand: { kk: "Түсінік AI", ru: "Түсінік AI" },
  nav_home: { kk: "Басты бет", ru: "Главная" },
  nav_assistant: { kk: "Көмекші", ru: "Ассистент" },
  nav_documents: { kk: "Құжатты түсіндіру", ru: "Разбор документа" },
  nav_procedures: { kk: "Рәсімдер", ru: "Процедуры" },
  nav_about: { kk: "Қауіпсіздік", ru: "О сервисе" },
  hero_title: { kk: "Мемлекеттік қызметтер — қарапайым тілмен", ru: "Госуслуги — простым языком" },
  hero_sub: {
    kk: "Жағдайыңызды сипаттаңыз — біз қадамдарды, құжаттар тізімін және ресми дереккөздерді көрсетеміз.",
    ru: "Опишите ситуацию — мы покажем шаги, список документов и официальные источники.",
  },
  ask_placeholder: { kk: "Мысалы: жеке куәлігімді қалай ауыстырамын?", ru: "Например: как заменить удостоверение личности?" },
  ask_btn: { kk: "Сұрау", ru: "Спросить" },
  or_document: { kk: "немесе құжатты түсіндіріп беру", ru: "или разобрать документ" },
  examples: { kk: "Мысал сұрақтар", ru: "Примеры вопросов" },
  categories: { kk: "Санаттар", ru: "Категории" },
  independent: {
    kk: "Түсінік AI — тәуелсіз анықтамалық құрал, ресми мемлекеттік портал емес.",
    ru: "Түсінік AI — независимый справочный инструмент, не официальный госпортал.",
  },
  mock_badge: { kk: "Демо режим", ru: "Демо-режим" },
  thinking: { kk: "Ресми дереккөздерді іздеп жатырмын…", ru: "Ищу в официальных источниках…" },
  sources: { kk: "Дереккөздер", ru: "Источники" },
  next_actions: { kk: "Келесі қадамдар", ru: "Следующие шаги" },
  open_guide: { kk: "Толық нұсқаулықты ашу", ru: "Открыть полное руководство" },
  helpful: { kk: "Пайдалы", ru: "Полезно" },
  not_helpful: { kk: "Пайдасыз", ru: "Не полезно" },
  thanks: { kk: "Рахмет!", ru: "Спасибо!" },
  copy: { kk: "Көшіру", ru: "Копировать" },
  copied: { kk: "Көшірілді", ru: "Скопировано" },
  new_chat: { kk: "Жаңа сұхбат", ru: "Новый диалог" },
  chat_empty: { kk: "Сұрағыңызды жазыңыз — қазақша немесе орысша.", ru: "Напишите вопрос — на казахском или русском." },
  clarify: { kk: "Нақтылау", ru: "Уточнение" },
  unverified: { kk: "Тексеру мүмкін емес", ru: "Не удалось проверить" },
  error: { kk: "Қате орын алды. Қайталап көріңіз.", ru: "Произошла ошибка. Попробуйте ещё раз." },
  doc_title: { kk: "Құжатты түсіндіру", ru: "Разбор документа" },
  doc_sub: { kk: "Мәтінді қойыңыз немесе PDF / TXT жүктеңіз.", ru: "Вставьте текст или загрузите PDF / TXT." },
  doc_paste: { kk: "Мәтінді қою", ru: "Вставить текст" },
  doc_upload: { kk: "Файл жүктеу", ru: "Загрузить файл" },
  doc_drop: { kk: "PDF немесе TXT таңдаңыз (5 МБ дейін)", ru: "Выберите PDF или TXT (до 5 МБ)" },
  doc_warning: {
    kk: "Құпия деректерді (ЖСН, мекенжай, қаржы) жасырыңыз. Құжаттар өңдеуден кейін сақталмайды.",
    ru: "Скройте чувствительные данные (ИИН, адрес, финансы). Документы не сохраняются после обработки.",
  },
  doc_explain: { kk: "Түсіндіру", ru: "Объяснить" },
  doc_analyzing: { kk: "Құжатты талдап жатырмын…", ru: "Анализирую документ…" },
  summary: { kk: "Қысқаша мазмұны", ru: "Краткое содержание" },
  purpose: { kk: "Мақсаты", ru: "Назначение" },
  dates: { kk: "Маңызды күндер", ru: "Важные даты" },
  actions: { kk: "Қажетті әрекеттер", ru: "Необходимые действия" },
  terms: { kk: "Терминдер", ru: "Термины" },
  uncertainties: { kk: "Белгісіздіктер", ru: "Неясности" },
  none_found: { kk: "Табылмады", ru: "Не найдено" },
  too_large: { kk: "Файл тым үлкен (5 МБ дейін).", ru: "Файл слишком большой (до 5 МБ)." },
  unsupported: { kk: "Тек PDF және TXT қолдау көрсетіледі.", ru: "Поддерживаются только PDF и TXT." },
  proc_title: { kk: "Рәсімдер нұсқаулығы", ru: "Руководство по процедурам" },
  proc_sub: { kk: "Қадамдар, шарттар және құжаттар тізімі.", ru: "Шаги, условия и чек-лист документов." },
  all: { kk: "Барлығы", ru: "Все" },
  prerequisites: { kk: "Алдын ала шарттар", ru: "Предварительные условия" },
  steps: { kk: "Қадамдар", ru: "Шаги" },
  checklist: { kk: "Құжаттар тізімі", ru: "Чек-лист документов" },
  prepared: { kk: "дайын", ru: "готово" },
  online: { kk: "Онлайн", ru: "Онлайн" },
  in_person: { kk: "Жеке келу", ru: "Лично" },
  either: { kk: "Онлайн немесе жеке", ru: "Онлайн или лично" },
  open_service: { kk: "Ресми қызметті ашу", ru: "Открыть официальную услугу" },
  not_found: { kk: "Рәсім табылмады", ru: "Процедура не найдена" },
  back: { kk: "Артқа", ru: "Назад" },
} satisfies Record<string, Record<Lang, string>>;

export type DictKey = keyof typeof dict;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  useEffect(() => {
    const saved = localStorage.getItem("tusinik-lang");
    if (saved === "kk" || saved === "ru") setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    localStorage.setItem("tusinik-lang", l);
    setLangState(l);
  };
  return (
    <I18nContext.Provider value={{ lang, setLang, t: (k) => dict[k][lang] }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
