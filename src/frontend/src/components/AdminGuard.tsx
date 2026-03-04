import { Button } from "@/components/ui/button";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAuth } from "../lib/auth-utils";

interface AdminGuardProps {
  children: ReactNode;
}

// Accept both the live principal and the draft principal so admin works on both environments
const ADMIN_PRINCIPALS = new Set([
  "uorkh-nazas-r5n3p-kj44w-gwm4i-liaj3-jqjll-ws44w-7dlve-3mshw-sae", // live
  "kcznz-vfjcj-xmtzc-aw23m-th6f7-43fd3-ytu3i-ot3ig-nuwnj-oba6h-fqe", // draft
]);

/**
 * How this works:
 *
 * The useInternetIdentity hook runs its init effect TWICE:
 *   1st pass: creates authClient → setAuthClient() → finally: setStatus("idle")
 *   2nd pass: authClient exists → isAuthenticated() → setIdentity() → finally: setStatus("idle")
 *
 * So the first "idle" arrives BEFORE identity is set. We must wait for the 2nd
 * idle (when identity has also been resolved) before making an access decision.
 *
 * Strategy: count how many times status settles to "idle". On the 1st idle we
 * start a brief grace window. On the 2nd idle (or as soon as identity appears)
 * we mark ourselves as truly ready. An identified admin bypasses all waits.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { login, isLoggingIn } = useAuth();
  const {
    identity,
    loginStatus,
    isLoggingIn: authLoggingIn,
  } = useInternetIdentity();

  const principalStr = identity?.getPrincipal().toString() ?? null;
  const isRealIdentity = !!principalStr && principalStr !== "2vxsx-fae";
  const isAdminUser = isRealIdentity && ADMIN_PRINCIPALS.has(principalStr);

  // Once confirmed admin, latch forever — never drop access due to status bounces.
  const confirmedAdmin = useRef(false);
  if (isAdminUser) confirmedAdmin.current = true;

  // Count how many times status has reached "idle" (not counting "initializing").
  const idleCountRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loginStatus === "idle") {
      idleCountRef.current += 1;
      // After the 2nd idle we're confident identity has been resolved.
      // Also accept 1st idle if identity is already set (fast path on re-mount).
      if (idleCountRef.current >= 2 || identity !== undefined) {
        setReady(true);
      } else {
        // Wait for the 2nd idle — give the effect a moment to complete
        const t = setTimeout(() => setReady(true), 200);
        return () => clearTimeout(t);
      }
    }
    // While logging-in, reset ready so spinner shows
    if (loginStatus === "logging-in") {
      setReady(false);
      idleCountRef.current = 0;
    }
    if (loginStatus === "success") {
      setReady(true);
    }
  }, [loginStatus, identity]);

  // Show spinner while:
  // - Still waiting for auth to settle, AND
  // - We haven't confirmed admin yet
  if (!confirmedAdmin.current && (!ready || authLoggingIn)) {
    return (
      <div
        className="container mx-auto px-4 py-24 flex justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Admin confirmed — grant access.
  if (confirmedAdmin.current || isAdminUser) {
    return <>{children}</>;
  }

  // Not logged in at all.
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

  // Logged in with a different principal — not admin.
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
      <ShieldAlert className="w-12 h-12 text-destructive" />
      <h2 className="heading-serif text-2xl text-foreground">Access Denied</h2>
      <p className="text-muted-foreground max-w-xs">
        Your account does not have admin privileges.
      </p>
      <div className="mt-4 p-4 bg-muted rounded-lg text-left max-w-md w-full">
        <p className="text-xs text-muted-foreground mb-1 font-mono">
          Your Principal ID (copy this):
        </p>
        <p className="text-xs font-mono break-all text-foreground select-all">
          {principalStr}
        </p>
        <p className="text-xs text-muted-foreground mt-3 mb-1 font-mono">
          Expected Admin Principals:
        </p>
        {[...ADMIN_PRINCIPALS].map((p) => (
          <p
            key={p}
            className="text-xs font-mono break-all text-muted-foreground"
          >
            {p}
          </p>
        ))}
        <p className="text-xs text-muted-foreground mt-3 font-mono">
          Match:{" "}
          <span
            className={
              principalStr && ADMIN_PRINCIPALS.has(principalStr)
                ? "text-green-500"
                : "text-destructive"
            }
          >
            {principalStr && ADMIN_PRINCIPALS.has(principalStr)
              ? "YES ✓"
              : "NO ✗"}
          </span>
        </p>
      </div>
    </div>
  );
}
