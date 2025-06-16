import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req }) => {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/bag/:path*"],
}; 