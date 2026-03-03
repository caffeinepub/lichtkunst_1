import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { Layers, LayoutDashboard, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/mint", label: "Mint NFT", icon: Sparkles },
] as const;

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({
  children,
  title,
  description,
}: AdminLayoutProps) {
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-52 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive =
                to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "admin-nav-link whitespace-nowrap",
                    isActive && "active",
                  )}
                  data-ocid={
                    to === "/admin"
                      ? "nav.admin_link"
                      : to === "/admin/collections"
                        ? "nav.collections_link"
                        : "nav.gallery_link"
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="heading-display text-3xl text-foreground text-glow-amber">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground text-sm mt-1.5">
                {description}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
