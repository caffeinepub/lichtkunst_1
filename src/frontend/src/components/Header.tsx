import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { Loader2, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useIsAdmin } from "../hooks/useQueries";
import { useAuth } from "../lib/auth-utils";

export function Header() {
  const { isAuthenticated, login, logout, isLoggingIn, isInitializing } =
    useAuth();
  const { data: isAdmin } = useIsAdmin();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Gallery" },
    { to: "/collections", label: "Collections" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ] as const;

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ── Artist identity — shown exactly once ── */}
          <Link
            to="/"
            className="flex-shrink-0 group"
            data-ocid="nav.gallery_link"
          >
            <div className="flex flex-col leading-none">
              <span className="heading-serif text-base sm:text-lg text-foreground group-hover:text-accent transition-colors duration-200 text-glow-amber">
                Istvan Seidel
              </span>
              <span className="font-body text-[0.65rem] sm:text-xs text-muted-foreground tracking-widest uppercase">
                Lichtkünstler · Light Artist
              </span>
            </div>
          </Link>

          {/* ── Navigation ── */}
          <nav
            className="hidden sm:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded transition-colors duration-150",
                  isActive(link.to)
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground",
                )}
                data-ocid={
                  link.to === "/"
                    ? "nav.gallery_link"
                    : link.to === "/collections"
                      ? "nav.collections_link"
                      : "nav.admin_link"
                }
              >
                {link.to === "/admin" && (
                  <ShieldCheck className="inline-block w-3 h-3 mr-1 opacity-70" />
                )}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Single auth button ── */}
          <div className="flex-shrink-0">
            {isInitializing ? (
              <Button variant="ghost" size="sm" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-border/70 hover:border-accent/60 hover:text-accent text-muted-foreground"
                data-ocid="header.logout_button"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-sm font-medium"
                data-ocid="header.login_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                )}
                <span>Sign in</span>
              </Button>
            )}
          </div>
        </div>

        {/* ── Mobile nav ── */}
        <div className="sm:hidden flex items-center gap-3 pb-2 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "whitespace-nowrap text-xs font-medium pb-0.5 border-b border-transparent transition-colors",
                isActive(link.to)
                  ? "text-accent border-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-ocid={
                link.to === "/"
                  ? "nav.gallery_link"
                  : link.to === "/collections"
                    ? "nav.collections_link"
                    : "nav.admin_link"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
