import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                username: credentials.email as string,
                password: credentials.password as string,
              }),
            }
          )
          if (!res.ok) return null
          const data = await res.json()
          return {
            id: "authenticated",
            email: credentials.email as string,
            accessToken: data.access_token,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (user) token.accessToken = (user as any).accessToken
      return token
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(session as any).accessToken = token.accessToken
      session.user.id = token.sub ?? ""
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
