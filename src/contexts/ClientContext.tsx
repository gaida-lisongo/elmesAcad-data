"use client";

import React, { createContext, useContext, useEffect } from "react";
import type { ClientData } from "@/types/client";

const COOKIE_NAME = "app_client";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h in seconds

// ─── Cookie helpers ────────────────────────────────────────────────────────────
function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

export function getClientCookie(): ClientData | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────
const ClientContext = createContext<ClientData | null>(null);

export function ClientProvider({
  data,
  children,
}: {
  data: ClientData;
  children: React.ReactNode;
}) {
  // Persist sanitized data in cookie once on mount
  useEffect(() => {
    setCookie(COOKIE_NAME, JSON.stringify(data), COOKIE_MAX_AGE);
  }, [data]);

  return (
    <ClientContext.Provider value={data}>{children}</ClientContext.Provider>
  );
}

export function useClientData(): ClientData {
  const ctx = useContext(ClientContext);
  if (!ctx) {
    throw new Error("useClientData must be used inside <ClientProvider>");
  }
  return ctx;
}
