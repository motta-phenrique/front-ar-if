"use client";

import { useState } from "react";
import {
  Droplets,
  Fan,
  Flame,
  Minus,
  MoveHorizontal,
  MoveVertical,
  Plus,
  Power,
  PowerOff,
  Snowflake,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { useBlocksList } from "@/api/blocks";
import { useCampusOptions } from "@/api/campus";
import {
  useControllersList,
  useCreateController,
  useDeleteController,
  useUpdateControllerState,
} from "@/api/controllers";
import type {
  AcFan,
  AcMode,
  Controller,
  ControllerState,
} from "@/api/entities";
import { useRoomsList, useSendRoomCommand } from "@/api/rooms";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const MODES: { value: AcMode; label: string; icon: typeof Snowflake }[] = [
  { value: "COOL", label: "Refrigerar", icon: Snowflake },
  { value: "HEAT", label: "Aquecer", icon: Flame },
  { value: "DRY", label: "Desumidificar", icon: Droplets },
  { value: "FAN", label: "Ventilar", icon: Fan },
];

const FANS: { value: AcFan; label: string }[] = [
  { value: "AUTO", label: "Auto" },
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
];

const MIN_TEMP = 16;
const MAX_TEMP = 31;

export default function DevicesPage() {
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

  const {
    data: controllers,
    isLoading,
    isError,
  } = useControllersList(roomId || undefined);
  const createController = useCreateController();
  const sendCommand = useSendRoomCommand();

  const [creating, setCreating] = useState(false);

  function handleCreate(name: string) {
    if (!roomId) return;
    createController.mutate(
      { roomId, name },
      {
        onSuccess: () => {
          toast.success("Ar-condicionado cadastrado");
          setCreating(false);
        },
        onError: (e) => toast.error(e.message || "Erro ao cadastrar"),
      },
    );
  }

  function handleCommand(action: "TURN_ON" | "TURN_OFF") {
    if (!roomId) return;
    sendCommand.mutate(
      { id: roomId, action },
      {
        onSuccess: () =>
          toast.success(
            action === "TURN_ON" ? "Sala ligada" : "Sala desligada",
          ),
        onError: (e) => toast.error(e.message || "Erro ao enviar comando"),
      },
    );
  }

  const hasControllers = !!controllers && controllers.length > 0;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-blue-500">
            Equipamentos
          </span>
          <h2 className="text-2xl font-bold leading-tight">Ar-condicionados</h2>
          <p className="text-sm text-muted-foreground">
            Escolha a sala e controle cada aparelho.
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          disabled={!roomId}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <Plus />
          Novo ar-condicionado
        </Button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <LabeledSelect
            label="Campus"
            value={campusId}
            onChange={(v) => {
              setSelectedCampusId(v);
              setSelectedBlockId(null);
              setSelectedRoomId(null);
            }}
            options={campus}
            emptyLabel="Nenhum campus"
          />
          <LabeledSelect
            label="Bloco"
            value={blockId}
            onChange={(v) => {
              setSelectedBlockId(v);
              setSelectedRoomId(null);
            }}
            options={blocks}
            emptyLabel="Nenhum bloco"
          />
          <LabeledSelect
            label="Sala"
            value={roomId}
            onChange={setSelectedRoomId}
            options={rooms}
            emptyLabel="Nenhuma sala"
          />
        </div>

        {hasControllers && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleCommand("TURN_ON")}
              disabled={sendCommand.isPending}
            >
              <Power />
              Ligar todos
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCommand("TURN_OFF")}
              disabled={sendCommand.isPending}
            >
              <PowerOff />
              Desligar todos
            </Button>
          </div>
        )}
      </div>

      {!roomId ? (
        <StatusCard>
          Selecione um campus, bloco e sala para ver os ar-condicionados.
        </StatusCard>
      ) : isLoading ? (
        <StatusCard>
          <Spinner /> Carregando…
        </StatusCard>
      ) : isError ? (
        <StatusCard className="text-destructive">
          Não foi possível carregar os ar-condicionados.
        </StatusCard>
      ) : !hasControllers ? (
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Snowflake />
                </EmptyMedia>
                <EmptyTitle>Nenhum ar-condicionado nesta sala</EmptyTitle>
                <EmptyDescription>
                  Cadastre o primeiro dispositivo para começar.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {controllers.map((c) => (
            <ControllerCard key={c.id} controller={c} />
          ))}
        </div>
      )}

      <NameFormDialog
        open={creating}
        onOpenChange={setCreating}
        title="Novo ar-condicionado"
        description="Informe o nome do dispositivo nesta sala."
        label="Nome"
        placeholder="Ex.: Ar da Sala 101"
        submitting={createController.isPending}
        onSubmit={handleCreate}
      />
    </div>
  );
}

function ControllerCard({ controller: c }: { controller: Controller }) {
  const update = useUpdateControllerState();
  const remove = useDeleteController();
  const busy = update.isPending;

  function change(state: Partial<ControllerState>) {
    update.mutate(
      { id: c.id, ...state },
      { onError: (e) => toast.error(e.message || "Erro ao enviar comando") },
    );
  }

  function handleDelete() {
    if (!confirm(`Remover "${c.name}"?`)) return;
    remove.mutate(c.id, {
      onSuccess: () => toast.success("Ar-condicionado removido"),
      onError: (e) => toast.error(e.message || "Erro ao remover"),
    });
  }

  return (
    <Card
      className={cn(
        "transition-colors",
        c.power ? "ring-blue-200 dark:ring-blue-900" : "opacity-90",
      )}
    >
      <CardContent className="space-y-5">
        {/* Cabeçalho: nome + liga/desliga */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{c.name}</p>
            <p className="text-xs text-muted-foreground">
              {c.power ? "Ligado" : "Desligado"}
              {busy && " · enviando…"}
            </p>
          </div>
          <Button
            size="icon"
            aria-label={c.power ? "Desligar" : "Ligar"}
            aria-pressed={c.power}
            onClick={() => change({ power: !c.power })}
            disabled={busy}
            className={cn(
              "size-11 rounded-full",
              c.power
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {busy ? <Spinner /> : <Power />}
          </Button>
        </div>

        <fieldset
          disabled={!c.power || busy}
          className="space-y-5 disabled:opacity-50"
        >
          {/* Temperatura */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              aria-label="Diminuir temperatura"
              onClick={() => change({ temp: c.temp - 1 })}
              disabled={c.temp <= MIN_TEMP}
            >
              <Minus />
            </Button>
            <span className="w-24 text-center text-4xl font-bold tabular-nums">
              {c.temp}
              <span className="text-xl font-medium text-muted-foreground">
                °C
              </span>
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Aumentar temperatura"
              onClick={() => change({ temp: c.temp + 1 })}
              disabled={c.temp >= MAX_TEMP}
            >
              <Plus />
            </Button>
          </div>

          {/* Modo */}
          <Section label="Modo">
            <div className="grid grid-cols-4 gap-1.5">
              {MODES.map(({ value, label, icon: Icon }) => (
                <Choice
                  key={value}
                  active={c.mode === value}
                  onClick={() => change({ mode: value })}
                  className="flex-col gap-1 py-2 text-[11px]"
                >
                  <Icon className="size-4" />
                  {label}
                </Choice>
              ))}
            </div>
          </Section>

          {/* Ventilação */}
          <Section label="Ventilação">
            <div className="grid grid-cols-4 gap-1.5">
              {FANS.map(({ value, label }) => (
                <Choice
                  key={value}
                  active={c.fan === value}
                  onClick={() => change({ fan: value })}
                  className="py-1.5 text-xs"
                >
                  {label}
                </Choice>
              ))}
            </div>
          </Section>

          {/* Extras */}
          <div className="space-y-2.5">
            <ToggleRow
              icon={MoveVertical}
              label="Oscilação vertical"
              checked={c.swingVertical}
              onChange={(v) => change({ swingVertical: v })}
              disabled={!c.power || busy}
            />
            <ToggleRow
              icon={MoveHorizontal}
              label="Oscilação horizontal"
              checked={c.swingHorizontal}
              onChange={(v) => change({ swingHorizontal: v })}
              disabled={!c.power || busy}
            />
            <ToggleRow
              icon={Zap}
              label="Turbo"
              checked={c.turbo}
              onChange={(v) => change({ turbo: v })}
              disabled={!c.power || busy}
            />
          </div>
        </fieldset>

        <div className="flex justify-end border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={remove.isPending}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
            Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Choice({
  active,
  className,
  ...props
}: React.ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center rounded-md border font-medium transition-colors disabled:cursor-not-allowed",
        active
          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "border-border hover:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onChange,
  disabled,
}: {
  icon: typeof Zap;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="inline-flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        {label}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </label>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
  emptyLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[] | undefined;
  emptyLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <NativeSelect
        className="w-56"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!options || options.length === 0}
      >
        {options && options.length > 0 ? (
          options.map((o) => (
            <NativeSelectOption key={o.id} value={o.id}>
              {o.name}
            </NativeSelectOption>
          ))
        ) : (
          <NativeSelectOption value="">{emptyLabel}</NativeSelectOption>
        )}
      </NativeSelect>
    </div>
  );
}

function StatusCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent
        className={cn(
          "flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground",
          className,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
