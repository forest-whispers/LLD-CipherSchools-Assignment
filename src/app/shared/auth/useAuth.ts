"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, AuthUser, LoginInput } from "./auth.api";

export const authKeys = {
  currentUser: ["auth", "currentUser"] as const,
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginInput) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.currentUser, { user: data.user });
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
      router.push("/problems");
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.currentUser, null);
      queryClient.removeQueries({ queryKey: authKeys.currentUser });
      router.push("/login");
    },
  });
}

interface AuthContextType {
  user: AuthUser;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthUser() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthUser must be used within AuthenticatedLayout");
  }
  return context.user;
}
