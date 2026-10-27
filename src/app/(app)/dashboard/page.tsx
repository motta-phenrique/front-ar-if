import { redirect } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BellRing,
  BluetoothSearching,
  Boxes,
  Building2,
  DoorOpen,
  Power,
  Snowflake,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serverFetch } from "@/lib/server-api";

type Stat = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
};

const stats: Stat[] = [
  { label: "Campus", value: "3", delta: "+1 este ano", icon: Building2 },
  { label: "Blocos", value: "18", delta: "+2 últimos 30 dias", icon: Boxes },
  { label: "Salas monitoradas", value: "126", delta: "+8 últimos 30 dias", icon: DoorOpen },
  { label: "Ar-condicionados ativos", value: "94", delta: "78% do total", icon: Snowflake },
];

type DeviceStatus = "online" | "ocioso" | "offline";

type Device = {
  room: string;
  block: string;
  temp: number;
  setpoint: number;
  status: DeviceStatus;
};

const devices: Device[] = [
  { room: "Sala 201", block: "Bloco A", temp: 22.4, setpoint: 22, status: "online" },
  { room: "Sala 105", block: "Bloco B", temp: 25.1, setpoint: 23, status: "online" },
  { room: "Lab. Redes", block: "Bloco C", temp: 19.8, setpoint: 20, status: "ocioso" },
  { room: "Auditório", block: "Bloco A", temp: 26.7, setpoint: 24, status: "online" },
  { room: "Sala 309", block: "Bloco D", temp: 0, setpoint: 22, status: "offline" },
  { room: "Biblioteca", block: "Bloco A", temp: 23.0, setpoint: 23, status: "online" },
];

const statusBadge: Record<
  DeviceStatus,
  { label: string; className: string; dotClass: string }
> = {
  online: {
    label: "Online",
    className: "bg-blue-50 text-blue-700 border-blue-100",
    dotClass: "bg-blue-500",
  },
  ocioso: {
    label: "Ocioso",
    className: "bg-amber-50 text-amber-700 border-amber-100",
    dotClass: "bg-amber-500",
  },
  offline: {
    label: "Offline",
    className: "bg-slate-100 text-slate-500 border-slate-200",
    dotClass: "bg-slate-400",
  },
};

type ActivityEntry = {
  who: string;
  what: string;
  where: string;
  when: string;
};

const activity: ActivityEntry[] = [
  { who: "Carla M.", what: "ajustou setpoint para 22°C", where: "Bloco A · Sala 201", when: "há 4 min" },
  { who: "Sistema", what: "religou ar-condicionado", where: "Bloco B · Sala 105", when: "há 18 min" },
  { who: "João P.", what: "desligou unidade", where: "Bloco C · Lab. Redes", when: "há 1 h" },
  { who: "Sistema", what: "marcou como offline", where: "Bloco D · Sala 309", when: "há 2 h" },
  { who: "Marina L.", what: "criou agendamento", where: "Bloco A · Auditório", when: "ontem" },
];

export default async function DashboardPage() {

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-blue-500">
          Visão geral
        </span>
        <h2 className="text-2xl font-bold leading-tight">
          Bem-vindo ao <span className="text-blue-500">painel Ar-IF.</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe a climatização do campus em tempo real.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="ring-blue-100/70">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">
                    {stat.label}
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </CardTitle>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-500 ring-1 ring-blue-100">
                  <Icon size={18} />
                </span>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                  <ArrowUpRight size={12} />
                  {stat.delta}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 ring-blue-100/70">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Status dos ar-condicionados</CardTitle>
              <CardDescription>
                Leituras das unidades nas últimas horas.
              </CardDescription>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-100" variant="outline">
              <Activity className="size-3" />
              ao vivo
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {devices.map((device) => {
              const meta = statusBadge[device.status];
              return (
                <div
                  key={device.room}
                  className="group flex items-start justify-between gap-3 rounded-lg border border-blue-100/70 bg-gradient-to-br from-white to-blue-50/40 p-3 transition-colors hover:border-blue-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Snowflake size={16} />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium leading-none">
                        {device.room}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {device.block}
                      </p>
                      <div className="flex items-center gap-3 pt-1.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Thermometer size={12} className="text-blue-500" />
                          {device.status === "offline"
                            ? "—"
                            : `${device.temp.toFixed(1)}°C`}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Power size={12} className="text-blue-500" />
                          {device.setpoint}°C
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.className}`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${meta.dotClass}`}
                    />
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="ring-blue-100/70">
          <CardHeader>
            <CardTitle className="text-base">Atividade recente</CardTitle>
            <CardDescription>
              Últimas ações registradas no painel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((entry, i) => (
              <div key={i} className="flex gap-3">
                <span className="relative mt-1 flex size-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />
                  <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
                </span>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{entry.who}</span>{" "}
                    <span className="text-muted-foreground">{entry.what}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.where} · {entry.when}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
