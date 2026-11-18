import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
        phone: {
          type: "string",
          required: false,
        },
        area: {
          type: "string",
          required: false,
        },
        bio: {
          type: "string",
          required: false,
        },
      },
    }),

    jwtClient(),
  ],
})

export const { signIn, signUp, useSession } = authClient
