import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/AppShell/app-header";
import { AppSidebar } from "@/components/AppShell/app-sidebar";
import { serverFetch } from "@/lib/server-api";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  const res = await serverFetch("/user/me");

  if (res.status === 401) {
    redirect("/login");
  }

  const me = await res.json().catch(() => null);

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar me={me} />
      <SidebarInset className="bg-background">
        <AppHeader />
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
