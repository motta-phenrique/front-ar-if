"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./client";
import type { Room } from "./entities";

export const roomKeys = {
  all: ["rooms"] as const,
  byBlock: (blockId: string) => ["rooms", blockId] as const,
};

export function useRoomsList(blockId: string | undefined) {
  return useQuery({
    queryKey: roomKeys.byBlock(blockId ?? ""),
    queryFn: () => apiFetch<Room[]>(`/api/rooms/${blockId}`),
    enabled: !!blockId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; blockId: string }) =>
      apiFetch<Room>("/api/rooms", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomKeys.all }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiFetch<Room>(`/api/rooms/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomKeys.all }),
  });
}
