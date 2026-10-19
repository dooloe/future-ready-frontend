import { queryOptions } from "@tanstack/react-query";
import { api } from "./client";
import type { CategoryId, Lang } from "./types";

export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: () => api.getCategories(), staleTime: Infinity });

export const proceduresQuery = (lang: Lang, category?: CategoryId) =>
  queryOptions({
    queryKey: ["procedures", lang, category ?? "all"],
    queryFn: () => api.listProcedures(lang, category),
  });

export const procedureQuery = (lang: Lang, id: string) =>
  queryOptions({ queryKey: ["procedure", lang, id], queryFn: () => api.getProcedure(lang, id) });
