import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// GET /api/accounts - Lấy danh sách account
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const accounts = await db
      .collection("accounts")
      .find({})
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const mapped = accounts.map((item) => {
      const rawTools = Array.isArray(item.tools) ? item.tools : [];
      const tools = rawTools.map((t: any) => ({
        toolName: String(t.toolName || "01"),
        win: Number(t.win) || 0,
        Thua: Number(t.Thua) || 0,
        profit: Number(t.profit) || 0,
        chuoiThangLienTiepCaoNhat: Number(t.chuoiThangLienTiepCaoNhat) || 0,
        chuoiThuaLienTiepCaoNhat: Number(t.chuoiThuaLienTiepCaoNhat) || 0,
        currentWinStreak: Number(t.currentWinStreak) || 0,
        currentLossStreak: Number(t.currentLossStreak) || 0,
        hoaHongHienTai: Number(t.hoaHongHienTai) || 0,
        tongHoaHongDaThu: Number(t.tongHoaHongDaThu) || 0,
      }));

      return {
        id: item._id.toString(),
        name: item.name || item.taiKhoan,
        taiKhoan: item.taiKhoan,
        pass: item.pass || "",
        phanTramChiuThue: item.phanTramChiuThue !== undefined ? Number(item.phanTramChiuThue) : 50,
        ngayThamGia: item.ngayThamGia || item.createdAt || new Date().toISOString(),
        tools,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/accounts - Tạo account mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taiKhoan = body.taiKhoan ? String(body.taiKhoan).trim() : "";
    const pass = body.pass ? String(body.pass).trim() : "";
    const name = body.name ? String(body.name).trim() : taiKhoan;
    const phanTramChiuThue = body.phanTramChiuThue !== undefined ? Number(body.phanTramChiuThue) : 50;

    if (!taiKhoan || !pass) {
      return NextResponse.json(
        { error: "Tài khoản và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Kiểm tra tài khoản đã tồn tại chưa
    const existing = await db.collection("accounts").findOne({ taiKhoan });
    if (existing) {
      return NextResponse.json(
        { error: `Tài khoản "${taiKhoan}" đã tồn tại trên hệ thống` },
        { status: 400 }
      );
    }

    const now = new Date();
    const newAccount = {
      name: name || taiKhoan,
      taiKhoan,
      pass,
      phanTramChiuThue,
      ngayThamGia: now.toISOString(),
      tools: [], // Mảng danh sách tool rỗng ban đầu
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("accounts").insertOne(newAccount);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newAccount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/accounts - Cập nhật thông tin account
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get("id");
    const body = await request.json();
    const id = queryId || body.id;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID account" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateFields.name = String(body.name).trim();
    if (body.pass !== undefined) updateFields.pass = String(body.pass).trim();
    if (body.phanTramChiuThue !== undefined) {
      updateFields.phanTramChiuThue = Number(body.phanTramChiuThue);
    }
    if (body.tools !== undefined && Array.isArray(body.tools)) {
      updateFields.tools = body.tools;
    }

    await db.collection("accounts").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/accounts - Xóa account
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID account" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("accounts").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy account để xóa" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Đã xóa account thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
