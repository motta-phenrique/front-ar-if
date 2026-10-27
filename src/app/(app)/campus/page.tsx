"use client";

import { useState } from "react";
import { Building2, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  useCampusList,
  useCreateCampus,
  useUpdateCampus,
} from "@/api/campus";
import type { Campus } from "@/api/entities";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CampusPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCampusList({ page });
  const createCampus = useCreateCampus();
  const updateCampus = useUpdateCampus();

  const campus = data?.data;
  const meta = data?.meta;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Campus | null>(null);

  function handleCreate(name: string) {
    createCampus.mutate(
      { name },
      {
        onSuccess: () => {
          toast.success("Campus criado");
          setCreating(false);
          setPage(1);
        },
        onError: (e) => toast.error(e.message || "Erro ao criar campus"),
      },
    );
  }

  function handleUpdate(name: string) {
    if (!editing) return;
    updateCampus.mutate(
      { id: editing.id, name },
      {
        onSuccess: () => {
          toast.success("Campus atualizado");
          setEditing(null);
        },
        onError: (e) => toast.error(e.message || "Erro ao atualizar campus"),
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
          <h2 className="text-2xl font-bold leading-tight">Campus</h2>
          <p className="text-sm text-muted-foreground">
            Cadastre e edite os campus monitorados pelo Ar-IF.
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <Plus />
          Novo campus
        </Button>
      </div>

      <Card className="ring-blue-100/70">
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Spinner /> Carregando…
            </div>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-destructive">
              Não foi possível carregar os campus.
            </p>
          ) : !campus || campus.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Building2 />
                </EmptyMedia>
                <EmptyTitle>Nenhum campus ainda</EmptyTitle>
                <EmptyDescription>
                  Comece criando o primeiro campus.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-0 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campus.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(c)}
                        >
                          <Pencil />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta && meta.totalPages > 1 ? (
                <div className="flex items-center justify-between gap-3 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {meta.page} de {meta.totalPages} · {meta.total} campus
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(meta.totalPages, p + 1))
                      }
                    >
                      Próxima
                      <ChevronRight />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <NameFormDialog
        open={creating}
        onOpenChange={setCreating}
        title="Novo campus"
        description="Informe o nome do campus."
        label="Nome do campus"
        placeholder="Ex.: Campus Central"
        submitting={createCampus.isPending}
        onSubmit={handleCreate}
      />

      <NameFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Editar campus"
        label="Nome do campus"
        initialName={editing?.name ?? ""}
        submitting={updateCampus.isPending}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
