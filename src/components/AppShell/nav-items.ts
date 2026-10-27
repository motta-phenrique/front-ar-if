import {
  Boxes,
  Building2,
  Cpu,
  DoorOpen,
  LayoutDashboard,
  Snowflake,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campus", href: "/campus", icon: Building2 },
  { label: "Blocos", href: "/blocks", icon: Boxes },
  { label: "Salas", href: "/rooms", icon: DoorOpen },
  { label: "Ar-condicionados", href: "/devices", icon: Snowflake },
  { label: "Controladores", href: "/controllers", icon: Cpu },
  { label: "Usuários", href: "/users", icon: Users },
];
