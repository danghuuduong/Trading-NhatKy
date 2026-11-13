import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const envUser = process.env.ADMIN_USERNAME || "admin";
    const envPass = process.env.ADMIN_PASSWORD || "admin";

    const inputUser = String(username || "").trim();
    const inputPass = String(password || "").trim();

    if (!inputUser || !inputPass) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ tài khoản và mật khẩu" },
        { status: 400 }
      );
    }

    if (inputUser !== envUser || inputPass !== envPass) {
      return NextResponse.json(
        { success: false, error: "Tài khoản hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
    });

    // Đặt cookie xác thực HttpOnly thời hạn 30 ngày
    response.cookies.set({
      name: "admin_auth_token",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3 * 24 * 60 * 60, // 30 ngày
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
