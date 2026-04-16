"use client";

import { adminClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { magicLinkClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getPublicAppUrl } from "./env-public";

export const authClient = createAuthClient({
  baseURL: getPublicAppUrl(),
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", input: false },
        twoFactorEnabled: { type: "boolean", input: false },
      },
    }),
    magicLinkClient(),
    twoFactorClient({ twoFactorPage: "/two-factor" }),
    adminClient(),
  ],
});
