/**
 * Single entry point for all backend calls. UI code imports `api` only.
 *
 * - With VITE_API_BASE_URL unset → mock implementation (src/lib/api/mock).
 * - With VITE_API_BASE_URL set (e.g. http://localhost:8000) → real HTTP calls.
 *
 * Endpoint map expected from the backend:
 *   GET  /categories?lang=
 *   GET  /procedures?lang=&category=
 *   GET  /procedures/{id}?lang=
 *   POST /assistant/ask            (AskRequest → AskResponse)
 *   POST /documents/explain        (multipart: lang, text?, file? → ExplainResponse)
 *   POST /feedback                 (FeedbackRequest → 204)
 */
import type {
  AskRequest,
  AskResponse,
  Category,
  CategoryId,
  ExplainRequest,
  ExplainResponse,
  FeedbackRequest,
  Lang,
  Procedure,
  ProcedureSummary,
} from "./types";
import { ApiError } from "./types";
import { mockApi } from "./mock";

export interface TusinikApi {
  getCategories(): Promise<Category[]>;
  listProcedures(lang: Lang, category?: CategoryId): Promise<ProcedureSummary[]>;
  getProcedure(lang: Lang, id: string): Promise<Procedure | null>;
  ask(req: AskRequest): Promise<AskResponse>;
  explainDocument(req: ExplainRequest): Promise<ExplainResponse>;
  sendFeedback(req: FeedbackRequest): Promise<void>;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 30_000;

async function http<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${base}${path}`, { ...init, signal: ctrl.signal });
    if (res.status === 404) return null as T;
    if (res.status === 413) throw new ApiError("File too large", "too_large");
    if (res.status === 415) throw new ApiError("Unsupported file", "unsupported_file");
    if (!res.ok) throw new ApiError(`HTTP ${res.status}`, "provider");
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as Error).name === "AbortError") throw new ApiError("Timeout", "timeout");
    throw new ApiError("Network error", "network");
  } finally {
    clearTimeout(timer);
  }
}

function httpApi(base: string): TusinikApi {
  const json = (body: unknown): RequestInit => ({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return {
    getCategories: () => http(base, `/categories`),
    listProcedures: (lang, category) =>
      http(base, `/procedures?lang=${lang}${category ? `&category=${category}` : ""}`),
    getProcedure: (lang, id) => http(base, `/procedures/${encodeURIComponent(id)}?lang=${lang}`),
    ask: (req) => http(base, `/assistant/ask`, json(req)),
    explainDocument: (req) => {
      const fd = new FormData();
      fd.append("lang", req.lang);
      if (req.text) fd.append("text", req.text);
      if (req.file) fd.append("file", req.file);
      return http(base, `/documents/explain`, { method: "POST", body: fd });
    },
    sendFeedback: (req) => http(base, `/feedback`, json(req)),
  };
}

const base = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const api: TusinikApi = base ? httpApi(base.replace(/\/$/, "")) : mockApi;
export const isMockApi = !base;
