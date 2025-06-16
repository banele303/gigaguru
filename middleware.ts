import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req }: { req: NextRequest }) => {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/bag/:path*"],
}; 