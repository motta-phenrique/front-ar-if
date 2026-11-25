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
    queryFn: () => apiFetch<Room[]>(`/room/block/${blockId}`),
    enabled: !!blockId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, name }: { name: string; blockId: string }) =>
      apiFetch<Room>(`/room/${blockId}`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomKeys.all }),
  });
}

// ponytail: backend ainda não tem PATCH /room/:id — 404 até ser criado.
export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiFetch<Room>(`/room/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomKeys.all }),
  });
}

/** Liga/desliga todos os ar-condicionados da sala. */
export function useSendRoomCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["controllers"] }),
    mutationFn: ({ id, action }: { id: string; action: "TURN_ON" | "TURN_OFF" }) =>
      apiFetch<void>(`/room/${id}/command`, {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
  });
}
