"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./client";
import type { Campus, Paginated } from "./entities";

/** `limit` is capped at 100 by the API. */
export const CAMPUS_MAX_LIMIT = 100;

export type ListCampusParams = {
  page?: number;
  limit?: number;
};

export const campusKeys = {
  all: ["campus"] as const,
  list: (params: ListCampusParams) => ["campus", "list", params] as const,
};

function campusListOptions(params: ListCampusParams) {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  const query = search.toString();

  return {
    queryKey: campusKeys.list(params),
    queryFn: () =>
      apiFetch<Paginated<Campus>>(`/campus${query ? `?${query}` : ""}`),
  };
}

/** Paginated listing — returns `{ data, meta }`. */
export function useCampusList(params: ListCampusParams = {}) {
  return useQuery(campusListOptions(params));
}

/**
 * Flat list for pickers/selects. Asks for the largest page the API allows so
 * the dropdowns aren't silently cut off at the default page size.
 */
export function useCampusOptions() {
  return useQuery({
    ...campusListOptions({ limit: CAMPUS_MAX_LIMIT }),
    select: (res: Paginated<Campus>) => res.data,
  });
}

export function useCreateCampus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string }) =>
      apiFetch<Campus>("/campus", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: campusKeys.all }),
  });
}

export function useUpdateCampus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiFetch<Campus>(`/campus/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: campusKeys.all }),
  });
}
