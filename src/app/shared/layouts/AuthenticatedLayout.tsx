"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext, useCurrentUserQuery, useLogoutMutation } from "../auth/useAuth";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

export interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data, isLoading, isError } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (isError || !data?.user)) {
      router.replace("/login");
    }
  }, [isLoading, isError, data, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-zinc-500">Loading session...</p>
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-zinc-500">Redirecting to login...</p>
      </div>
    );
  }

  const user = data.user;
  const isProblemsActive = pathname === "/problems" || pathname?.startsWith("/problems/");

  return (
    <AuthContext.Provider value={{ user }}>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        {/* Application Header */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
              LLD Platform
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-zinc-400 select-all">{user.email}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              isLoading={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Application Shell Body */}
        <div className="flex flex-1 min-h-[calc(100vh-3.5rem)]">
          {/* Navigation Sidebar */}
          <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4">
            <nav className="space-y-1">
              <Link
                href="/problems"
                className={`flex items-center px-3 py-2 text-sm rounded transition-colors ${
                  isProblemsActive
                    ? "bg-zinc-800 text-zinc-100 font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                Problems
              </Link>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto bg-zinc-950 p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
