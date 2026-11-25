"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./client";
import type { Controller, ControllerState } from "./entities";

export const controllerKeys = {
  all: ["controllers"] as const,
  byRoom: (roomId: string) => ["controllers", roomId] as const,
};

export function useControllersList(roomId: string | undefined) {
  return useQuery({
    queryKey: controllerKeys.byRoom(roomId ?? ""),
    queryFn: () => apiFetch<Controller[]>(`/controller/room/${roomId}`),
    enabled: !!roomId,
  });
}

export function useCreateController() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, name }: { roomId: string; name: string }) =>
      apiFetch<Controller>(`/controller/${roomId}`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: controllerKeys.all }),
  });
}

/** Envia só os campos alterados; a resposta (estado salvo) atualiza a lista. */
export function useUpdateControllerState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...state }: Partial<ControllerState> & { id: string }) =>
      apiFetch<Controller>(`/controller/${id}/state`, {
        method: "PATCH",
        body: JSON.stringify(state),
      }),
    onSuccess: (updated) =>
      queryClient.setQueryData<Controller[]>(
        controllerKeys.byRoom(updated.roomId),
        (list) => list?.map((c) => (c.id === updated.id ? updated : c)),
      ),
  });
}

export function useDeleteController() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/controller/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: controllerKeys.all }),
  });
}
