import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }: { req: NextRequest; token: any }) => {
        // Allow all auth-related routes
        if (req.nextUrl.pathname.startsWith('/api/authdfs')) {
          return true;
        }
        // For protected routes, require authentication
        if (req.nextUrl.pathname.startsWith('/dashboarddd') || req.nextUrl.pathname.startsWith('/bagdd')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    
  ],
}; 