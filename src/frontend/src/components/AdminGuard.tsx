import { Button } from "@/components/ui/button";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAuth } from "../lib/auth-utils";

interface AdminGuardProps {
  children: ReactNode;
}

// Accept both the live principal and the draft principal so admin works on both environments
const ADMIN_PRINCIPALS = new Set([
  "uorkh-nazas-r5n3p-kj44w-gwm4i-liaj3-jqjll-ws44w-7dlve-3mshw-sae",
  "kcznz-vfjcj-xmtzc-aw23m-th6f7-43fd3-ytu3i-ot3ig-nuwnj-oba6h-fqe",
  "d5t6k-adjdl-ak3tk-xi2mp-lpwl2-wx2mt-35n2k-xy7nd-l5kbv-cyb6v-mqe",
]);

export function AdminGuard({ children }: AdminGuardProps) {
  const { login, isLoggingIn } = useAuth();
  const { identity, loginStatus } = useInternetIdentity();

  const principalStr = identity?.getPrincipal().toString() ?? null;
  const isRealIdentity = !!principalStr && principalStr !== "2vxsx-fae";
  const isAdminUser = isRealIdentity && ADMIN_PRINCIPALS.has(principalStr);

  // Latch: once admin is confirmed, never revoke on transient status bounces
  const confirmedAdmin = useRef(false);
  if (isAdminUser) confirmedAdmin.current = true;

  // Still initializing — show spinner
  if (loginStatus === "initializing" || loginStatus === "logging-in") {
    return (
      <div
        className="container mx-auto px-4 py-24 flex justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Admin confirmed — grant access
  if (confirmedAdmin.current || isAdminUser) {
    return <>{children}</>;
  }

  // Not logged in at all
  if (!isRealIdentity) {
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

  // Logged in but wrong principal — show principal so admin can add it
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
      <ShieldAlert className="w-12 h-12 text-destructive" />
      <h2 className="heading-serif text-2xl text-foreground">Access Denied</h2>
      <p className="text-muted-foreground max-w-xs">
        Your account does not have admin privileges.
      </p>
      <div className="mt-4 p-4 bg-muted rounded-lg text-left max-w-md w-full">
        <p className="text-xs text-muted-foreground mb-1 font-mono">
          Your Principal ID (copy this and send to admin):
        </p>
        <p className="text-xs font-mono break-all text-foreground select-all">
          {principalStr}
        </p>
      </div>
    </div>
  );
}
