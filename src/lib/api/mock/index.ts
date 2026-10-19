/**
 * Mock implementation of TusinikApi. Simulates latency and backend behavior
 * (intent matching, clarification, "cannot verify") so the UI can be built
 * end-to-end. Replace by setting VITE_API_BASE_URL.
 */
import type { TusinikApi } from "../client";
import type { AskResponse, Lang, Procedure } from "../types";
import { ApiError } from "../types";
import { categories, glossary, procedures, sourceWarning } from "./data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);

function localize(p: (typeof procedures)[number], lang: Lang): Procedure {
  return {
    id: p.id,
    category: p.category,
    title: p.title[lang],
    summary: p.summary[lang],
    prerequisites: p.prerequisites.map((x) => x[lang]),
    steps: p.steps.map((s) => ({
      title: s.title[lang],
      detail: s.detail[lang],
      channel: s.channel,
      location: s.location?.[lang],
    })),
    checklist: p.checklist.map((c) => ({ id: c.id, label: c.label[lang], condition: c.condition?.[lang] })),
    officialServiceUrl: p.officialServiceUrl,
    sources: p.sources.map((s) => ({
      id: s.id,
      title: s.title[lang],
      institution: s.institution[lang],
      url: s.url,
      warning: sourceWarning(lang),
    })),
  };
}

export function matchProcedure(text: string) {
  const t = text.toLowerCase();
  return procedures.find((p) => p.keywords.some((k) => t.includes(k)));
}

const T = {
  unverified: {
    kk: "Кешіріңіз, бұл сұрақ бойынша тексерілген ресми ақпарат таппадым. Талаптарды ойдан шығармау үшін eGov.kz порталын немесе тиісті органды тексеруді ұсынамын.",
    ru: "К сожалению, я не нашёл проверенной официальной информации по этому вопросу. Чтобы не выдумывать требования, рекомендую проверить на портале eGov.kz или в компетентном органе.",
  },
  clarifyOwner: {
    kk: "Нақты тізім беру үшін бір сұрақ: сіз тұрғын үйдің меншік иесісіз бе?",
    ru: "Чтобы дать точный список, один вопрос: вы являетесь собственником жилья?",
  },
  openPortal: { kk: "eGov.kz порталын ашу", ru: "Открыть портал eGov.kz" },
  intro: {
    kk: (t: string) => `Сіздің жағдайыңыз «${t}» қызметіне сәйкес келетін сияқты.`,
    ru: (t: string) => `Похоже, ваша ситуация относится к услуге «${t}».`,
  },
  disclaimer: {
    kk: "Шешімді құзыретті орган қабылдайды; бұл түсіндірме мақұлдауға кепілдік бермейді.",
    ru: "Решение принимает компетентный орган; это объяснение не гарантирует одобрения.",
  },
  followUps: {
    kk: ["Онлайн жасауға бола ма?", "Қанша уақыт алады?", "Қандай құжаттар қажет?"],
    ru: ["Можно ли сделать онлайн?", "Сколько это займёт времени?", "Какие документы нужны?"],
  },
};

export const mockApi: TusinikApi = {
  async getCategories() {
    await delay(150);
    return categories;
  },
  async listProcedures(lang, category) {
    await delay(200);
    return procedures
      .filter((p) => !category || p.category === category)
      .map((p) => ({ id: p.id, category: p.category, title: p.title[lang], summary: p.summary[lang] }));
  },
  async getProcedure(lang, id) {
    await delay(200);
    const p = procedures.find((x) => x.id === id);
    return p ? localize(p, lang) : null;
  },
  async ask({ lang, question, history }): Promise<AskResponse> {
    await delay(900 + Math.random() * 700);
    // Resolve follow-ups using recent context.
    const context = [...history.slice(-4).map((h) => h.content), question].join(" ");
    const match = matchProcedure(question) ?? matchProcedure(context);

    if (!match) {
      return {
        id: uid(),
        kind: "unverified",
        text: T.unverified[lang],
        nextActions: [T.openPortal[lang]],
        sources: [],
        suggestedFollowUps: [],
      };
    }

    const p = localize(match, lang);
    const lastAssistant = [...history].reverse().find((h) => h.role === "assistant");
    const askedOwner = lastAssistant?.content === T.clarifyOwner[lang];
    if (match.id === "residence-registration" && !askedOwner && !/собствен|меншік/i.test(context)) {
      return {
        id: uid(),
        kind: "clarification",
        text: T.clarifyOwner[lang],
        nextActions: [],
        procedureId: p.id,
        sources: [],
        suggestedFollowUps: lang === "kk" ? ["Иә, меншік иесімін", "Жоқ, жалға тұрамын"] : ["Да, я собственник", "Нет, снимаю жильё"],
      };
    }

    return {
      id: uid(),
      kind: "answer",
      text: `${T.intro[lang](p.title)} ${p.summary}\n\n${T.disclaimer[lang]}`,
      nextActions: p.steps.map((s) => s.title),
      procedureId: p.id,
      sources: p.sources,
      suggestedFollowUps: T.followUps[lang],
    };
  },
  async explainDocument({ lang, text, file }) {
    if (file) {
      const ok = /\.(pdf|txt)$/i.test(file.name);
      if (!ok) throw new ApiError("Unsupported file", "unsupported_file");
      if (file.name.toLowerCase().endsWith(".txt")) text = await file.text();
    }
    await delay(1400);
    const content = (text ?? "").trim();
    if (!content && file) {
      // PDF text extraction happens on the real backend.
      return {
        summary: lang === "kk" ? "PDF мәтінін шығару нақты серверде орындалады. Бұл демо-жауап." : "Извлечение текста из PDF выполняется на реальном сервере. Это демо-ответ.",
        purpose: "—",
        dates: [],
        actions: [],
        terms: [],
        uncertainties: [lang === "kk" ? "Құжат мазмұны талданбады (демо режим)." : "Содержимое документа не проанализировано (демо-режим)."],
      };
    }
    const lower = content.toLowerCase();
    const sentences = content.split(/(?<=[.!?])\s+/).filter(Boolean);
    const dates = [...content.matchAll(/\b(\d{1,2}[./]\d{1,2}[./]\d{2,4})\b/g)].map((m) => {
      const s = sentences.find((x) => x.includes(m[1])) ?? "";
      return { date: m[1], context: s.slice(0, 140) };
    });
    const actionRe = /(необходимо|обязан|следует|требуется|тиіс|қажет|міндетті)/i;
    const actions = sentences.filter((s) => actionRe.test(s)).slice(0, 5);
    const terms = glossary
      .filter((g) => g.match.some((m) => lower.includes(m)))
      .map((g) => ({ term: g.term[lang], explanation: g.explanation[lang] }));
    const match = matchProcedure(content);
    const uncertainties: string[] = [];
    if (!dates.length) uncertainties.push(lang === "kk" ? "Құжатта нақты мерзім көрсетілмеген — біз оны болжамаймыз." : "В документе нет явных сроков — мы их не додумываем.");
    if (/ignore|игнорир|инструкц/i.test(lower)) uncertainties.push(lang === "kk" ? "Мәтіндегі нұсқаулар құжат мазмұны ретінде ғана қарастырылды." : "Инструкции внутри текста рассматриваются только как содержимое документа.");
    return {
      summary: sentences.slice(0, 2).join(" ").slice(0, 300) || "—",
      purpose: match
        ? (lang === "kk" ? `«${match.title.kk}» тақырыбына қатысты болуы мүмкін.` : `Вероятно, относится к теме «${match.title.ru}».`)
        : (lang === "kk" ? "Мақсатын нақты анықтау мүмкін болмады." : "Назначение документа определить однозначно не удалось."),
      dates,
      actions,
      terms,
      uncertainties,
    };
  },
  async sendFeedback() {
    await delay(200);
  },
};
