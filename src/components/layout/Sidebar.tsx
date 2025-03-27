import {
  ChevronsLeft,
  ChevronsRight,
  File,
  Home,
  Settings,
  User,
  Inbox
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"

import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"
import { Logo } from "./Logo"

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()
  const location = useLocation();
  const pathname = location.pathname;
  const [isBusiness, setIsBusiness] = useState(false);

  useEffect(() => {
    // Check if the current route is part of the business section
    setIsBusiness(pathname.startsWith('/business'));
  }, [pathname]);

  return (
    <div
      className={cn(
        "group flex h-full w-[var(--sidebar-width)] flex-col border-r bg-spotify-darker duration-300 ease-in-out motion-reduce:transition-none",
        collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]"
      )}
    >
      <div className="space-y-4 py-4">
        <div className="hidden px-3 py-2 md:block">
          {!collapsed && (
            <Link to="/" className="px-4">
              <Logo />
            </Link>
          )}
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">
            Dashboard
          </h2>
          <div className="space-y-1">
            <Link
              to="/PrivateDashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white",
                pathname === "/PrivateDashboard" && "bg-spotify-accent text-white"
              )}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/profile"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white",
                pathname === "/profile" && "bg-spotify-accent text-white"
              )}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white",
                pathname === "/settings" && "bg-spotify-accent text-white"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            {/* Add Client Requests link - typically only show for admin/support roles */}
            <Link
              to="/client-requests"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white",
                pathname === "/client-requests" && "bg-spotify-accent text-white"
              )}
            >
              <Inbox className="h-4 w-4" />
              <span>Client Requests</span>
            </Link>
          </div>
        </div>
        {isBusiness && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">
              Business
            </h2>
            <div className="space-y-1">
              <Link
                to="/business/units"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white",
                  pathname === "/business/units" && "bg-spotify-accent text-white"
                )}
              >
                <File className="h-4 w-4" />
                <span>Units</span>
              </Link>
            </div>
          </div>
        )}
        <div className="mt-auto border-t pt-4">
          <div className="flex items-center px-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-300/20"
            >
              <ChevronsLeft
                className={cn("h-4 w-4 text-muted-foreground transition-transform", collapsed ? "" : "rotate-180")}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
