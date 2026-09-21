import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "./AdminSidebar"
import { useAccess } from "../hooks/useAccess"
import { clearTokens } from "../lib/auth-storage"

const pageTitles: Record<string, string> = {
  "/": "Overview",
  "/employees": "Employees",
  "/roles": "Roles",
  "/commissions": "Commissions",
  "/audit": "Audit Log",
  "/fraud": "Fraud & activity",
  "/reports": "Reports",
  "/sales": "Sales",
  "/registers": "Registers",
  "/finance": "Finance",
  "/loyalty": "Loyalty",
  "/settings": "Settings",
  "/import-export": "Import / Export",
}

export function AdminShell() {
  const { pathname } = useLocation()
  const { user } = useAccess()
  const pageTitle = pageTitles[pathname] ?? "Admin"

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        {/* Top header bar — AlignUI style matching maintenance app */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-stroke-soft-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-regular-xs">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <h1 className="text-paragraph-sm font-semibold text-text-strong-950">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3 pr-4">
            {user ? (
              <span className="text-paragraph-xs text-text-sub-600">
                {user.email}
              </span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearTokens()
                window.location.href = "/login"
              }}
            >
              Sign out
            </Button>
          </div>
        </header>

        {/* Page content with maintenance app subtle radial gradient */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(circle,rgba(249,115,22,0.01)_0%,rgba(245,240,240,0.01)_38%,rgba(249,115,22,0.01)_100%)] p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
