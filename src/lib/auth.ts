import type { UserRole } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/src/lib/db";
import { verifyPassword } from "@/src/lib/password";

const ADMIN_ROLES: UserRole[] = ["ADMIN", "SUPER_ADMIN"];

function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "local-dev-only-secret-change-me",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password || !isAdminRole(user.role)) {
          return null;
        }

        const validPassword = verifyPassword(password, user.password);
        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? "");
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};

export function roleCanManageAdmins(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}
