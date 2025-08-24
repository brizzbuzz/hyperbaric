import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001", // Server runs on port 3001
});

export const { signIn, signUp, signOut, useSession } = authClient;
