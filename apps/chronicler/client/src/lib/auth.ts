import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3003", // Server runs on port 3003
});

export const { signIn, signUp, signOut, useSession } = authClient;
