import { Button } from "@/components/ui/button";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import { useAuth } from "../lib/auth-utils";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, login, isLoggingIn } = useAuth();
  const { isInitializing: iiInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsAdmin();

  // Wait for identity initialization before making any auth decisions
  if (isLoading || iiInitializing) {
    return (
      <div
        className="container mx-auto px-4 py-24 flex justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
        <ShieldAlert className="w-12 h-12 text-muted-foreground" />
        <div>
          <h2 className="heading-serif text-2xl text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground">
            Please sign in to access the admin area.
          </p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          data-ocid="header.login_button"
        >
          {isLoggingIn ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          Sign in
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h2 className="heading-serif text-2xl text-foreground">
          Access Denied
        </h2>
        <p className="text-muted-foreground max-w-xs">
          Your account does not have admin privileges.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
