import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// POST /api/accounts/settle-commission - Thu hoa hồng của một account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.accountId;
    const taiKhoan = body.taiKhoan;

    if (!id && !taiKhoan) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID hoặc tài khoản" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const query = id ? { _id: new ObjectId(id) } : { taiKhoan };
    const account = await db.collection("accounts").findOne(query);

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tài khoản" },
        { status: 404 }
      );
    }

    const tools = Array.isArray(account.tools) ? account.tools : [];

    // Chuyển hoa hồng hiện tại sang tổng hoa hồng đã thu cho từng tool con
    const updatedTools = tools.map((t: any) => {
      const cur = Number(t.hoaHongHienTai) || 0;
      const daThu = Number(t.tongHoaHongDaThu) || 0;
      return {
        ...t,
        tongHoaHongDaThu: Math.round((daThu + cur) * 100) / 100,
        hoaHongHienTai: 0,
      };
    });

    await db.collection("accounts").updateOne(query, {
      $set: {
        tools: updatedTools,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã thu hoa hồng thành công!",
      tools: updatedTools,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
