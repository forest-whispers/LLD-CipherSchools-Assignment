"use client";

import React, { useState } from "react";
import { useLoginMutation } from "@/app/shared/auth/useAuth";
import { Button, Input } from "@/app/shared/components";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLoginMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          LLD Platform
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5">
          Sign in or create an account with your email and password
        </p>
      </div>

      {loginMutation.isError && (
        <div
          role="alert"
          className="mb-4 p-3 rounded border border-red-800/80 bg-red-950/40 text-red-300 text-xs"
        >
          {loginMutation.error?.message || "Failed to log in. Please check your credentials."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="developer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loginMutation.isPending}
          autoFocus
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loginMutation.isPending}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={loginMutation.isPending}
          disabled={loginMutation.isPending || !email.trim() || !password}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}
