import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// POST /api/accounts/login - Xác thực đăng nhập từ Tool
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taiKhoan = body.taiKhoan ? String(body.taiKhoan).trim() : "";
    const pass = body.pass ? String(body.pass).trim() : "";

    if (!taiKhoan || !pass) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ tài khoản và mật khẩu" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const account = await db.collection("accounts").findOne({ taiKhoan });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Tài khoản không tồn tại trên hệ thống" },
        { status: 401 }
      );
    }

    if (account.pass !== pass) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      account: {
        id: account._id.toString(),
        name: account.name || account.taiKhoan,
        taiKhoan: account.taiKhoan,
        profitHoaHongDaGhiNhan: account.profitHoaHongDaGhiNhan ?? 0,
        tools: Array.isArray(account.tools) ? account.tools : [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
