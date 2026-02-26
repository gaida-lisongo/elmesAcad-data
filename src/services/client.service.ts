/**
 * client.service.ts
 *
 * Central service for accessing the verified client data.
 * Must be used inside a component wrapped by <ClientProvider>.
 *
 * Usage:
 *   import { useClientService } from "@/services/client.service";
 *   const { client, pkg, hasFeature, hasModule } = useClientService();
 */

"use client";

import { useClientData, getClientCookie } from "@/contexts/ClientContext";
import type { ClientData } from "@/types/client";

// ─── Hook (use inside React components) ───────────────────────────────────────
export function useClientService() {
  const data: ClientData = useClientData();

  return {
    /** Full subscription record */
    subscription: data,

    /** Client (institution) info */
    client: data.clientId,

    /** Subscribed package */
    pkg: data.packageId,

    /** Remaining balance */
    solde: data.solde,

    /** Billing rate */
    quotite: data.quotite,

    /**
     * Check whether the subscribed package includes a feature by partial match.
     * e.g. hasFeature("stages") → true if any feature string contains "stages"
     */
    hasFeature: (keyword: string) =>
      data.packageId.features.some((f) =>
        f.toLowerCase().includes(keyword.toLowerCase()),
      ),

    /**
     * Check whether a module ID is included in the subscribed package.
     */
    hasModule: (moduleId: string) => data.packageId.modules.includes(moduleId),
  };
}

// ─── Utility (use outside React, e.g. in middleware or helpers) ───────────────
export { getClientCookie };
