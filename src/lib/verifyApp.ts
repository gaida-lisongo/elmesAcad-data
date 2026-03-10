type VerifyResponse = {
  success: boolean;
  data?: {
    clientComplete: any;
  };
  error?: string;
};

function buildFallbackResponse(): VerifyResponse {
  const now = new Date().toISOString();

  return {
    success: true,
    data: {
      clientComplete: {
        _id: "local-client-complete",
        clientId: {
          _id: "local-client",
          nomComplet: process.env.NEXT_PUBLIC_UNIV || "Client local",
          email: "local@app.test",
          logo: "",
          isActive: true,
        },
        packageId: {
          _id: "local-package",
          titre: "Local",
          description: "Fallback local verification",
          benefices: [],
          avantages: [],
          features: [],
          prix: 0,
          modules: [],
          createdAt: now,
          updatedAt: now,
        },
        quotite: 0,
        solde: 0,
        createdAt: now,
        updatedAt: now,
      },
    },
  };
}

export async function verifyApp(): Promise<VerifyResponse> {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000/api";
  const uuid = process.env.UUID || "bf26724f-6d1d-4a35-bdfe-fa638c5f4a8e";

  const timeoutMs = Number(process.env.VERIFY_APP_TIMEOUT_MS || "12000");
  const failOpen =
    process.env.VERIFY_APP_FAIL_OPEN === "true" ||
    (process.env.VERIFY_APP_FAIL_OPEN !== "false" &&
      process.env.NODE_ENV !== "production");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/client/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uuid }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const message = `verifyApp http ${response.status}`;
      if (failOpen) {
        console.error(message, "-> fail-open enabled");
        return buildFallbackResponse();
      }
      return { success: false, error: message };
    }

    const json = await response.json();
    return json;
  } catch (error: any) {
    console.error("verifyApp fetch error:", error?.message || error);

    if (failOpen) {
      return buildFallbackResponse();
    }

    return {
      success: false,
      error: error?.message || "Verification service unavailable",
    };
  } finally {
    clearTimeout(timer);
  }
}
