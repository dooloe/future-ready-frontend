/**
 * API contracts shared by the mock and the future real backend.
 * Keep these in sync with the backend's response schemas (e.g. FastAPI/Pydantic models).
 */

export type Lang = "kk" | "ru";

/** A string available in every supported language. */
export type Localized = Record<Lang, string>;

export type CategoryId = "identity" | "education" | "residence" | "certificates";

export interface Category {
  id: CategoryId;
  title: Localized;
  description: Localized;
}

export interface SourceRef {
  id: string;
  title: string;
  institution: string;
  url: string;
  verifiedAt?: string; // ISO date
  /** Set when sources disagree or may be outdated. */
  warning?: string;
}

export interface ProcedureStep {
  title: string;
  detail: string;
  channel: "online" | "in_person" | "either";
  location?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  /** e.g. "if required", "if applicant is a minor". Absent = always listed by source. */
  condition?: string;
}

export interface ProcedureSummary {
  id: string;
  category: CategoryId;
  title: string;
  summary: string;
}

export interface Procedure extends ProcedureSummary {
  prerequisites: string[];
  steps: ProcedureStep[];
  checklist: ChecklistItem[];
  officialServiceUrl: string;
  sources: SourceRef[];
}

/* ---------- Assistant ---------- */

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AskRequest {
  lang: Lang;
  question: string;
  /** Recent turns so the backend can resolve follow-ups. */
  history: ChatTurn[];
}

export type AnswerKind = "answer" | "clarification" | "unverified";

export interface AskResponse {
  id: string;
  kind: AnswerKind;
  text: string;
  nextActions: string[];
  procedureId?: string;
  sources: SourceRef[];
  suggestedFollowUps: string[];
}

/* ---------- Document explainer ---------- */

export interface ExplainRequest {
  lang: Lang;
  text?: string;
  file?: File; // PDF (selectable text) or TXT — extracted server-side
}

export interface ExplainResponse {
  summary: string;
  purpose: string;
  dates: { date: string; context: string }[];
  actions: string[];
  terms: { term: string; explanation: string }[];
  uncertainties: string[];
}

/* ---------- Feedback ---------- */

export interface FeedbackRequest {
  answerId: string;
  helpful: boolean;
  lang: Lang;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: "timeout" | "unsupported_file" | "too_large" | "provider" | "network" | "validation",
  ) {
    super(message);
  }
}
