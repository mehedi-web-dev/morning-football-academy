import { createAuthClient } from "better-auth/react";

/**
 * Morning Football Academy Auth Client
 * Routes all authentication requests through the frontend same-origin Next.js /api/auth rewrites proxy.
 * Eliminates cross-origin cookie restrictions by managing sessions on the same origin as the frontend.
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signOut, useSession } = authClient;
