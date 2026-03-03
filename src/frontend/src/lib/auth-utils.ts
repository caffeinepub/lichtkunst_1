import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function useAuth() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal().toString() ?? null;

  return {
    isAuthenticated,
    login,
    logout: clear,
    principal,
    isLoggingIn,
    isInitializing,
  };
}
