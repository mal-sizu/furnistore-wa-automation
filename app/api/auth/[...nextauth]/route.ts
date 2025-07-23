// Provide a sensible default so dev doesn't crash if NEXTAUTH_URL isn't set
if (!process.env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = "http://localhost:3000"

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// ----------------------------------------------------------------------------
// NOTE: replace the placeholder env-var names with the real ones you added in
// .env.local (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET)
// ----------------------------------------------------------------------------
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/drive.readonly",
        },
      },
    }),
  ],
  // Use the real secret in prod - generate your own 32-char string.
  // In local dev we fall back to a hard-coded value to avoid crashes.
  secret: process.env.AUTH_SECRET ?? "dev-secret-please-change",
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    // 1) expose Google access-token on the JWT
    // @ts-ignore
    async jwt({ token, account }) {
      if (account?.access_token) token.accessToken = account.access_token
      return token
    },
    // 2) move it onto `session`
    // @ts-ignore
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined
      return session
    },
  },
}

// v4 pattern: create **one** handler and export it for both verbs
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
