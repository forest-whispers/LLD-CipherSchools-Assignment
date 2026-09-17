"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext, useCurrentUserQuery, useLogoutMutation } from "../auth/useAuth";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { useSessionsQuery } from "../practice/usePractice";

export interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data, isLoading, isError } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    isError: isSessionsError,
  } = useSessionsQuery(Boolean(data?.user));

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
          <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col h-[calc(100vh-3.5rem)] sticky top-14">
            <nav className="space-y-1 shrink-0">
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

            {/* Practice History Section */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex-1 flex flex-col min-h-0">
              <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0">
                Practice History
              </div>

              {/* Scrollable session list */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-xs">
                {isSessionsLoading ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-zinc-500">
                    <Spinner size="sm" />
                    <span>Loading history...</span>
                  </div>
                ) : isSessionsError ? (
                  <div className="px-3 py-3 text-zinc-500 text-xs">
                    Failed to load history.
                  </div>
                ) : !sessionsData?.sessions || sessionsData.sessions.length === 0 ? (
                  <div className="px-3 py-3 text-zinc-500 space-y-1">
                    <p className="font-medium text-zinc-400">No practice sessions yet.</p>
                    <p className="text-[11px] text-zinc-600">
                      Start a problem to begin practicing.
                    </p>
                  </div>
                ) : (
                  sessionsData.sessions.map((session) => {
                    const isActive = pathname === `/lld-session/${session.id}`;
                    return (
                      <Link
                        key={session.id}
                        href={`/lld-session/${session.id}`}
                        className={`group block px-3 py-2 rounded transition-colors ${
                          isActive
                            ? "bg-zinc-800 text-zinc-100 font-medium"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                      >
                        <div className="text-xs truncate font-medium">
                          {session.problem.title}
                        </div>
                        <div className="text-[10px] font-mono uppercase text-zinc-500 group-hover:text-zinc-400 mt-0.5">
                          {session.problem.difficulty}
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
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
