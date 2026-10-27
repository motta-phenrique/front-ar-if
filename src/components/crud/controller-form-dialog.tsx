"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useBlocksList } from "@/api/blocks";
import { useCampusOptions } from "@/api/campus";
import type { Controller } from "@/api/entities";
import { useRoomsList } from "@/api/rooms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";

const detailsSchema = z.object({
  nickname: z.string().trim().optional(),
  acManufacturer: z.string().trim().optional(),
  irProtocol: z.string().trim().optional(),
});

const createDetailsSchema = detailsSchema.extend({
  deviceId: z.string().trim().min(1, "Informe o identificador do dispositivo"),
});

type CreateDetails = z.infer<typeof createDetailsSchema>;
type EditDetails = z.infer<typeof detailsSchema>;

export type ControllerCreateValues = {
  deviceId: string;
  roomId: string;
  nickname?: string;
  acManufacturer?: string;
  irProtocol?: string;
};
export type ControllerEditValues = {
  nickname?: string;
  acManufacturer?: string;
  irProtocol?: string;
};

/** Drop empty/blank values so we don't send `""` to the API. */
function pruneEmpty<T extends Record<string, string | undefined>>(
  values: T,
): Partial<T> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value && value.trim()) out[key] = value.trim();
  }
  return out as Partial<T>;
}

type ControllerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controller?: Controller | null;
  submitting?: boolean;
  onCreate: (values: ControllerCreateValues) => void;
  onUpdate: (values: ControllerEditValues) => void;
};

export function ControllerFormDialog({
  open,
  onOpenChange,
  controller,
  submitting = false,
  onCreate,
  onUpdate,
}: ControllerFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Remount on each open so the form starts from a clean state. */}
        {open ? (
          controller ? (
            <EditControllerForm
              key={controller.id}
              controller={controller}
              submitting={submitting}
              onCancel={() => onOpenChange(false)}
              onSubmit={onUpdate}
            />
          ) : (
            <CreateControllerForm
              submitting={submitting}
              onCancel={() => onOpenChange(false)}
              onSubmit={onCreate}
            />
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function FormShell({
  title,
  description,
  formId,
  submitting,
  onCancel,
  children,
}: {
  title: string;
  description: string;
  formId: string;
  submitting: boolean;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form={formId}
          disabled={submitting}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          {submitting ? <Spinner /> : null}
          Salvar
        </Button>
      </DialogFooter>
    </>
  );
}

function EditControllerForm({
  controller,
  submitting,
  onCancel,
  onSubmit,
}: {
  controller: Controller;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: ControllerEditValues) => void;
}) {
  const { register, handleSubmit } = useForm<EditDetails>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      nickname: controller.nickname ?? "",
      acManufacturer: controller.acManufacturer ?? "",
      irProtocol: controller.irProtocol ?? "",
    },
  });

  return (
    <FormShell
      title="Editar ar-condicionado"
      description="Atualize os dados do dispositivo."
      formId="controller-form"
      submitting={submitting}
      onCancel={onCancel}
    >
      <form
        id="controller-form"
        onSubmit={handleSubmit((v) => onSubmit(pruneEmpty(v)))}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="nickname">Apelido</FieldLabel>
            <Input
              id="nickname"
              placeholder="Ex.: Ar da Sala 101"
              {...register("nickname")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="acManufacturer">Fabricante</FieldLabel>
            <Input
              id="acManufacturer"
              placeholder="Ex.: Samsung"
              {...register("acManufacturer")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="irProtocol">Protocolo IR</FieldLabel>
            <Input
              id="irProtocol"
              placeholder="Ex.: NEC"
              {...register("irProtocol")}
            />
          </Field>
        </FieldGroup>
      </form>
    </FormShell>
  );
}

function CreateControllerForm({
  submitting,
  onCancel,
  onSubmit,
}: {
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: ControllerCreateValues) => void;
}) {
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

  const { data: rooms } = useRoomsList(blockId || undefined);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const roomId =
    selectedRoomId && rooms?.some((r) => r.id === selectedRoomId)
      ? selectedRoomId
      : (rooms?.[0]?.id ?? "");
  const [roomError, setRoomError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDetails>({
    resolver: zodResolver(createDetailsSchema),
    defaultValues: {
      deviceId: "",
      nickname: "",
      acManufacturer: "",
      irProtocol: "",
    },
  });

  return (
    <FormShell
      title="Novo ar-condicionado"
      description="Cadastre um dispositivo e vincule-o a uma sala."
      formId="controller-form"
      submitting={submitting}
      onCancel={onCancel}
    >
      <form
        id="controller-form"
        onSubmit={handleSubmit((v) => {
          if (!roomId) {
            setRoomError("Selecione uma sala");
            return;
          }
          const { deviceId, ...rest } = v;
          onSubmit({ deviceId: deviceId.trim(), roomId, ...pruneEmpty(rest) });
        })}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="deviceId">
              Identificador do dispositivo
            </FieldLabel>
            <Input
              id="deviceId"
              placeholder="Ex.: ESP32-A1B2C3"
              autoFocus
              {...register("deviceId")}
            />
            <FieldError errors={[errors.deviceId]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="campus">Campus</FieldLabel>
            <NativeSelect
              id="campus"
              className="w-full"
              value={campusId}
              onChange={(e) => {
                setSelectedCampusId(e.target.value);
                setSelectedBlockId(null);
                setSelectedRoomId(null);
              }}
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
          </Field>

          <Field>
            <FieldLabel htmlFor="block">Bloco</FieldLabel>
            <NativeSelect
              id="block"
              className="w-full"
              value={blockId}
              onChange={(e) => {
                setSelectedBlockId(e.target.value);
                setSelectedRoomId(null);
              }}
              disabled={!blocks || blocks.length === 0}
            >
              {blocks && blocks.length > 0 ? (
                blocks.map((b) => (
                  <NativeSelectOption key={b.id} value={b.id}>
                    {b.name}
                  </NativeSelectOption>
                ))
              ) : (
                <NativeSelectOption value="">Nenhum bloco</NativeSelectOption>
              )}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="room">Sala</FieldLabel>
            <NativeSelect
              id="room"
              className="w-full"
              value={roomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setRoomError(null);
              }}
              disabled={!rooms || rooms.length === 0}
            >
              {rooms && rooms.length > 0 ? (
                rooms.map((r) => (
                  <NativeSelectOption key={r.id} value={r.id}>
                    {r.name}
                  </NativeSelectOption>
                ))
              ) : (
                <NativeSelectOption value="">Nenhuma sala</NativeSelectOption>
              )}
            </NativeSelect>
            {roomError ? (
              <p className="text-xs text-destructive">{roomError}</p>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="c-nickname">Apelido (opcional)</FieldLabel>
            <Input
              id="c-nickname"
              placeholder="Ex.: Ar da Sala 101"
              {...register("nickname")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="c-acManufacturer">
              Fabricante (opcional)
            </FieldLabel>
            <Input
              id="c-acManufacturer"
              placeholder="Ex.: Samsung"
              {...register("acManufacturer")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="c-irProtocol">
              Protocolo IR (opcional)
            </FieldLabel>
            <Input
              id="c-irProtocol"
              placeholder="Ex.: NEC"
              {...register("irProtocol")}
            />
          </Field>
        </FieldGroup>
      </form>
    </FormShell>
  );
}
