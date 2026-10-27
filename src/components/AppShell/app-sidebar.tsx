"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Snowflake } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { navItems } from "./nav-items";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Me = {
  name?: string;
  email?: string;
};

function getInitials(name?: string) {
  if (!name) return "AR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

async function logout() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/logout`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Falha ao sair");
}

export function AppSidebar({ me }: { me: Me | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: handleLogout, isPending: isPendingLogout } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
    onError: () => toast.error("Erro ao sair"),
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-500/30">
            <Snowflake size={18} strokeWidth={2.4} />
          </span>
          <span className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-blue-500 text-base tracking-tight">
              Ar-IF
            </span>
            <span className="text-[11px] text-muted-foreground">
              Painel de climatização
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Sair"
              className="data-[active=false]:hover:bg-blue-50/60"
              disabled={isPendingLogout}
              onClick={() => handleLogout()}
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                  {getInitials(me?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">{me?.name}</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {me?.email}
                </span>
              </div>
              <LogOut className="ml-auto text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
