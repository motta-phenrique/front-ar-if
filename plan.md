# Ar-IF — Design interno

Sistema de gestão de climatização para campus. Telas autenticadas vivem sob `(app)` route group.

## Paleta (vinda da tela de login)

- **Gradiente externo:** `radial-gradient(ellipse at 65% 35%, #ffffff 0%, #eff6ff 50%, #bfdbfe 100%)` — usado em telas de auth
- **Brand "Ar-IF":** `text-blue-500`
- **Primary:** `oklch(62.3% 0.214 259.815)` (blue-500)
- **Tints internas:** `blue-50` (`#eff6ff`), `blue-100` (`#dbeafe`), `blue-200` (`#bfdbfe`)
- **Cards:** `bg-card` com `ring-1 ring-foreground/10` (já é o default do shadcn Card)

## Navegação (sidebar)

- Dashboard — `/dashboard` (`LayoutDashboard`)
- Campus — `/campus` (`Building2`)
- Blocos — `/blocks` (`Boxes`)
- Salas — `/rooms` (`DoorOpen`)
- Ar-condicionados — `/devices` (`Snowflake`)
- Controladores — `/controllers` (`Cpu`)
- Usuários — `/users` (`Users`)

> Apenas `/dashboard` está implementado nesta primeira passada. Os demais ficam como itens de menu para completar depois.

## Estrutura de arquivos

```
src/app/(app)/
  layout.tsx              ← SidebarProvider + AppSidebar + AppHeader
  dashboard/page.tsx      ← stats, status grid, recent activity
src/components/AppShell/
  app-sidebar.tsx
  app-header.tsx
  nav-items.ts            ← lista compartilhada de rotas/ícones
```

## Sidebar — variant

Usa a `Sidebar` do shadcn em `variant="inset"` para ficar com cantos arredondados e respiração à volta do conteúdo. As variáveis `--sidebar-*` em `globals.css` são re-tingidas com azul muito suave para casar com a tela de login.

## Dashboard

- 4 cards de estatísticas no topo: Campus, Blocos, Salas, Ar-condicionados ativos
- Grid de status dos ar-condicionados (online/offline/em uso) com badges coloridas
- Card lateral de "Atividade recente" (lista simples)

Dados são placeholders — a integração com a API (`/api/campus`, `/api/blocks`, etc.) entra numa próxima passada.
