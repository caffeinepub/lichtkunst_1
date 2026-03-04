import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function useAuth() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const principalStr = identity?.getPrincipal().toString() ?? null;
  // Anonymous principal is "2vxsx-fae" — not a real logged-in user
  const isAuthenticated = !!principalStr && principalStr !== "2vxsx-fae";
  const principal = isAuthenticated ? principalStr : null;

  return {
    isAuthenticated,
    login,
    logout: clear,
    principal,
    isLoggingIn,
    isInitializing,
  };
}
