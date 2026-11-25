"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./client";
import type { Block } from "./entities";

export const blockKeys = {
  all: ["blocks"] as const,
  byCampus: (campusId: string) => ["blocks", campusId] as const,
};

export function useBlocksList(campusId: string | undefined) {
  return useQuery({
    queryKey: blockKeys.byCampus(campusId ?? ""),
    queryFn: () => apiFetch<Block[]>(`/block/${campusId}`),
    enabled: !!campusId,
  });
}

export function useCreateBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campusId, name }: { name: string; campusId: string }) =>
      apiFetch<Block>(`/block/${campusId}`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: blockKeys.all }),
  });
}

export function useUpdateBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      // ponytail: backend ainda não tem PATCH /block/:id — 404 até ser criado.
      apiFetch<Block>(`/block/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: blockKeys.all }),
  });
}
