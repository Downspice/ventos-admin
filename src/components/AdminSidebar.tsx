import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  ArrowLeftRight,
  Settings,
  AlertTriangle,
  Wallet,
  Gift,
  Percent,
  Images,
  Store,
  Receipt,
} from "lucide-react"
import { useAccess } from "@/hooks/useAccess"
import { resolveAvatarSrc } from "@/lib/avatar-presets"

type NavItem = {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { to: "/employees", label: "Employees", icon: Users, permission: "employees.read" },
      { to: "/roles", label: "Roles", icon: ShieldCheck, permission: "roles.read" },
      { to: "/commissions", label: "Commissions", icon: Percent, permission: "employees.read" },
    ],
  },
  {
    label: "Compliance",
    items: [
      { to: "/audit", label: "Audit log", icon: ClipboardList, permission: "audit.read" },
      { to: "/fraud", label: "Fraud", icon: AlertTriangle, permission: "audit.read" },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3, permission: "reports.sales.read" },
      { to: "/sales", label: "Sales", icon: Receipt, permission: "sales.read" },
      { to: "/registers", label: "Registers", icon: Store, permission: "sales.read" },
      { to: "/finance", label: "Finance", icon: Wallet, permission: "reports.financial.read" },
      { to: "/loyalty", label: "Loyalty", icon: Gift },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/settings", label: "Settings", icon: Settings, permission: "settings.read" },
      { to: "/media", label: "Media", icon: Images, permission: "media.read" },
      { to: "/import-export", label: "Import / export", icon: ArrowLeftRight, permission: "import.export" },
    ],
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { business, user, can } = useAccess()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[slot=sidebar-menu-button]:p-1.5!">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 p-1 border border-primary/20 shadow-regular-xs">
                <img
                  src="/icon-square.png"
                  alt="Ventos"
                  className="size-full object-contain filter drop-shadow-2xs"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Ventos Admin</span>
                {business ? (
                  <span className="truncate text-xs text-muted-foreground">{business.name}</span>
                ) : null}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (item.permission && !can(item.permission)) return null
                  const isActive = pathname === item.to
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                      >
                        <Link to={item.to}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? user?.email?.split("@")[0] ?? "Admin",
            email: user?.email ?? "",
            avatar: resolveAvatarSrc(user?.avatarUrl) ?? "",
          }}
          profileUser={user ?? undefined}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
