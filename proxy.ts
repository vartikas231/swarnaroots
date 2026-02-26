import { withAuth } from "next-auth/middleware";

function isPublicAdminPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

export default withAuth(
  () => {},
  {
    secret: process.env.NEXTAUTH_SECRET ?? "local-dev-only-secret-change-me",
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (isPublicAdminPath(pathname)) {
          return true;
        }

        const role = token?.role;
        return role === "ADMIN" || role === "SUPER_ADMIN";
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  },
);

export const config = {
  matcher: ["/admin/:path*"],
};
