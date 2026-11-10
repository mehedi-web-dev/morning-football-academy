import { createAuthClient } from "better-auth/react";

/**
 * Morning Football Academy Auth Client
 * Configured to connect to the dedicated Express backend (http://localhost:5000)
 * Supports cross-origin credentialed session management with Better Auth
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signOut, useSession } = authClient;
