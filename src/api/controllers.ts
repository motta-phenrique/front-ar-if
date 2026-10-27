"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./client";
import type { Controller } from "./entities";

export const controllerKeys = {
  all: ["controllers"] as const,
};

export type CreateControllerBody = {
  deviceId: string;
  roomId: string;
  nickname?: string;
  acManufacturer?: string;
  irProtocol?: string;
};

export type UpdateControllerBody = {
  nickname?: string;
  acManufacturer?: string;
  irProtocol?: string;
};

export function useControllersList() {
  return useQuery({
    queryKey: controllerKeys.all,
    queryFn: () => apiFetch<Controller[]>("/api/controllers"),
  });
}

export function useCreateController() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateControllerBody) =>
      apiFetch<Controller>("/api/controllers", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: controllerKeys.all }),
  });
}

export function useUpdateController() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & UpdateControllerBody) =>
      apiFetch<Controller>(`/api/controllers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: controllerKeys.all }),
  });
}
