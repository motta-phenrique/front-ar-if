"use client";

import { useState } from "react";
import { Boxes, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  useBlocksList,
  useCreateBlock,
  useUpdateBlock,
} from "@/api/blocks";
import { useCampusOptions } from "@/api/campus";
import type { Block } from "@/api/entities";
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

export default function BlocksPage() {
  const { data: campus, isLoading: loadingCampus } = useCampusOptions();
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null);
  // Fall back to the first campus until the user picks one explicitly.
  const campusId =
    selectedCampusId ?? (campus && campus.length > 0 ? campus[0].id : "");

  const {
    data: blocks,
    isLoading: loadingBlocks,
    isError,
  } = useBlocksList(campusId || undefined);
  const createBlock = useCreateBlock();
  const updateBlock = useUpdateBlock();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Block | null>(null);

  function handleCreate(name: string) {
    if (!campusId) return;
    createBlock.mutate(
      { name, campusId },
      {
        onSuccess: () => {
          toast.success("Bloco criado");
          setCreating(false);
        },
        onError: (e) => toast.error(e.message || "Erro ao criar bloco"),
      },
    );
  }

  function handleUpdate(name: string) {
    if (!editing) return;
    updateBlock.mutate(
      { id: editing.id, name },
      {
        onSuccess: () => {
          toast.success("Bloco atualizado");
          setEditing(null);
        },
        onError: (e) => toast.error(e.message || "Erro ao atualizar bloco"),
      },
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-blue-500">
            Estrutura
          </span>
          <h2 className="text-2xl font-bold leading-tight">Blocos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os blocos de cada campus.
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          disabled={!campusId}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <Plus />
          Novo bloco
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Campus
        </label>
        {loadingCampus ? (
          <Spinner />
        ) : !campus || campus.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Cadastre um campus primeiro.
          </p>
        ) : (
          <NativeSelect
            className="w-full max-w-xs"
            value={campusId}
            onChange={(e) => setSelectedCampusId(e.target.value)}
          >
            {campus.map((c) => (
              <NativeSelectOption key={c.id} value={c.id}>
                {c.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </div>

      <Card className="ring-blue-100/70">
        <CardContent>
          {!campusId ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Selecione um campus para ver os blocos.
            </p>
          ) : loadingBlocks ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Spinner /> Carregando…
            </div>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-destructive">
              Não foi possível carregar os blocos.
            </p>
          ) : !blocks || blocks.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Boxes />
                </EmptyMedia>
                <EmptyTitle>Nenhum bloco neste campus</EmptyTitle>
                <EmptyDescription>
                  Crie o primeiro bloco para começar.
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
                {blocks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(b)}
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
        title="Novo bloco"
        description="Informe o nome do bloco."
        label="Nome do bloco"
        placeholder="Ex.: Bloco A"
        submitting={createBlock.isPending}
        onSubmit={handleCreate}
      />

      <NameFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Editar bloco"
        label="Nome do bloco"
        initialName={editing?.name ?? ""}
        submitting={updateBlock.isPending}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
