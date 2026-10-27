"use client";

import { useState } from "react";
import { DoorOpen, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { useBlocksList } from "@/api/blocks";
import { useCampusOptions } from "@/api/campus";
import type { Room } from "@/api/entities";
import { useCreateRoom, useRoomsList, useUpdateRoom } from "@/api/rooms";
import { NameFormDialog } from "@/components/crud/name-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RoomsPage() {
  const { data: campus } = useCampusOptions();
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null);
  const campusId =
    selectedCampusId ?? (campus && campus.length > 0 ? campus[0].id : "");

  const { data: blocks } = useBlocksList(campusId || undefined);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const blockId =
    selectedBlockId && blocks?.some((b) => b.id === selectedBlockId)
      ? selectedBlockId
      : (blocks?.[0]?.id ?? "");

  const {
    data: rooms,
    isLoading: loadingRooms,
    isError,
  } = useRoomsList(blockId || undefined);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);

  function handleCreate(name: string) {
    if (!blockId) return;
    createRoom.mutate(
      { name, blockId },
      {
        onSuccess: () => {
          toast.success("Sala criada");
          setCreating(false);
        },
        onError: (e) => toast.error(e.message || "Erro ao criar sala"),
      },
    );
  }

  function handleUpdate(name: string) {
    if (!editing) return;
    updateRoom.mutate(
      { id: editing.id, name },
      {
        onSuccess: () => {
          toast.success("Sala atualizada");
          setEditing(null);
        },
        onError: (e) => toast.error(e.message || "Erro ao atualizar sala"),
      },
    );
  }

  const hasBlocks = !!blocks && blocks.length > 0;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-blue-500">
            Estrutura
          </span>
          <h2 className="text-2xl font-bold leading-tight">Salas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as salas de cada bloco.
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          disabled={!blockId}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <Plus />
          Nova sala
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Campus
          </label>
          <NativeSelect
            className="w-56"
            value={campusId}
            onChange={(e) => setSelectedCampusId(e.target.value)}
            disabled={!campus || campus.length === 0}
          >
            {campus && campus.length > 0 ? (
              campus.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.name}
                </NativeSelectOption>
              ))
            ) : (
              <NativeSelectOption value="">Nenhum campus</NativeSelectOption>
            )}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Bloco
          </label>
          <NativeSelect
            className="w-56"
            value={blockId}
            onChange={(e) => setSelectedBlockId(e.target.value)}
            disabled={!hasBlocks}
          >
            {hasBlocks ? (
              blocks.map((b) => (
                <NativeSelectOption key={b.id} value={b.id}>
                  {b.name}
                </NativeSelectOption>
              ))
            ) : (
              <NativeSelectOption value="">Nenhum bloco</NativeSelectOption>
            )}
          </NativeSelect>
        </div>
      </div>

      <Card className="ring-blue-100/70">
        <CardContent>
          {!blockId ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Selecione um campus e um bloco para ver as salas.
            </p>
          ) : loadingRooms ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Spinner /> Carregando…
            </div>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-destructive">
              Não foi possível carregar as salas.
            </p>
          ) : !rooms || rooms.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <DoorOpen />
                </EmptyMedia>
                <EmptyTitle>Nenhuma sala neste bloco</EmptyTitle>
                <EmptyDescription>
                  Crie a primeira sala para começar.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-0 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(r)}
                      >
                        <Pencil />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NameFormDialog
        open={creating}
        onOpenChange={setCreating}
        title="Nova sala"
        description="Informe o nome da sala."
        label="Nome da sala"
        placeholder="Ex.: Sala 101"
        submitting={createRoom.isPending}
        onSubmit={handleCreate}
      />

      <NameFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Editar sala"
        label="Nome da sala"
        initialName={editing?.name ?? ""}
        submitting={updateRoom.isPending}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
