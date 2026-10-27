"use client";

import { useState } from "react";
import { Pencil, Plus, Snowflake } from "lucide-react";
import { toast } from "sonner";

import {
  useControllersList,
  useCreateController,
  useUpdateController,
} from "@/api/controllers";
import type { Controller } from "@/api/entities";
import {
  ControllerFormDialog,
  type ControllerCreateValues,
  type ControllerEditValues,
} from "@/components/crud/controller-form-dialog";
import { Badge } from "@/components/ui/badge";
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

export default function DevicesPage() {
  const { data: controllers, isLoading, isError } = useControllersList();
  const createController = useCreateController();
  const updateController = useUpdateController();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Controller | null>(null);

  function handleCreate(values: ControllerCreateValues) {
    createController.mutate(values, {
      onSuccess: () => {
        toast.success("Ar-condicionado cadastrado");
        setCreating(false);
      },
      onError: (e) => toast.error(e.message || "Erro ao cadastrar"),
    });
  }

  function handleUpdate(values: ControllerEditValues) {
    if (!editing) return;
    updateController.mutate(
      { id: editing.id, ...values },
      {
        onSuccess: () => {
          toast.success("Ar-condicionado atualizado");
          setEditing(null);
        },
        onError: (e) => toast.error(e.message || "Erro ao atualizar"),
      },
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-blue-500">
            Equipamentos
          </span>
          <h2 className="text-2xl font-bold leading-tight">Ar-condicionados</h2>
          <p className="text-sm text-muted-foreground">
            Cadastre os dispositivos e mantenha seus dados atualizados.
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <Plus />
          Novo ar-condicionado
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
              Não foi possível carregar os ar-condicionados.
            </p>
          ) : !controllers || controllers.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Snowflake />
                </EmptyMedia>
                <EmptyTitle>Nenhum ar-condicionado ainda</EmptyTitle>
                <EmptyDescription>
                  Cadastre o primeiro dispositivo para começar.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Apelido</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Protocolo IR</TableHead>
                  <TableHead className="w-0 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {controllers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Snowflake className="size-4 text-blue-500" />
                        {c.deviceId}
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.nickname || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.acManufacturer ? (
                        <Badge
                          variant="outline"
                          className="border-blue-100 bg-blue-50 text-blue-700"
                        >
                          {c.acManufacturer}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.irProtocol || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
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
          )}
        </CardContent>
      </Card>

      <ControllerFormDialog
        open={creating}
        onOpenChange={setCreating}
        submitting={createController.isPending}
        onCreate={handleCreate}
        onUpdate={() => {}}
      />

      <ControllerFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        controller={editing}
        submitting={updateController.isPending}
        onCreate={() => {}}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
