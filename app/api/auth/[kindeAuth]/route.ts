import { handleAuth, handleLogout } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { kindeAuth: string } }) {
  const authRequest = await handleAuth(request);
  return authRequest;
}

export async function POST(request: NextRequest) {
  const logoutRequest = await handleLogout(request);
  return logoutRequest;
}
