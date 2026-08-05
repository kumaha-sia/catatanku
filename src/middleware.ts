import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/transactions/:path*",
    "/budgets/:path*",
    "/savings/:path*",
    "/debts/:path*",
    "/assets/:path*",
    "/investments/:path*",
    "/insights/:path*",
    "/chat/:path*",
    "/settings/:path*",
    "/family/:path*",
  ],
};
