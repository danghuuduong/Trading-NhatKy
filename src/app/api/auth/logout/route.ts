import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Đã đăng xuất",
  });

  // Xoá cookie
  response.cookies.set({
    name: "admin_auth_token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
