import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_auth_token")?.value;
  const isAuthenticated = token === "authenticated";

  // Nếu chưa đăng nhập và truy cập trang khác /login -> Chuyển hướng đến /login
  if (!isAuthenticated && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Nếu đã đăng nhập mà vẫn vào /login -> Chuyển hướng về trang chủ /
  if (isAuthenticated && pathname === "/login") {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (để bot Baccarat và các tool gọi API mà không bị chặn)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (ảnh logo, svg...)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
  ],
};
