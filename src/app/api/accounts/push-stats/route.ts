import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// POST /api/accounts/push-stats - Cập nhật thống kê từ Tool Baccarat
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taiKhoan = body.taiKhoan ? String(body.taiKhoan).trim() : "";
    const toolName = body.toolName ? String(body.toolName).trim() : "01";
    const result = body.result || body.ketQua; // "win" | "thua"
    const profitDelta = Number(body.profitDelta ?? body.profitThayDoi) || 0;

    if (!taiKhoan) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin tài khoản (taiKhoan)" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. Tìm account
    const account = await db.collection("accounts").findOne({ taiKhoan });
    if (!account) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy tài khoản "${taiKhoan}"` },
        { status: 404 }
      );
    }

    const phanTramChiuThue = Number(account.phanTramChiuThue ?? 50);
    const delta = Math.round(profitDelta * 100) / 100;
    const hoaHongDelta = Math.round(delta * (phanTramChiuThue / 100) * 100) / 100;

    const tools: any[] = Array.isArray(account.tools) ? account.tools : [];
    const existingTool = tools.find((t) => String(t.toolName) === String(toolName));

    const isWin = result === "win";
    const isThua = result === "thua";
    const kl = Math.round(Number(body.khoiLuong ?? body.KhoiluongVaoLenh ?? 0) * 100) / 100;
    const phiGD = Math.round(Number(body.phi ?? body.PhiGiaodich ?? 0) * 100) / 100;
    const hasTut = body.tut !== undefined && body.tut !== null;
    const tutVal = hasTut ? Math.round(Number(body.tut) * 100) / 100 : 0;
    // Trạng thái bot: snapshot ghi đè — dùng $set, không cộng dồn
    const hasTiSo = body.tiSo !== undefined && body.tiSo !== null;
    const hasKhung = body.khungB !== undefined && body.khungA !== undefined;
    const hasBotN = body.botN !== undefined && body.botN !== null;

    if (!existingTool) {
      // 2a. Chưa có toolName này -> push phần tử mới vào mảng
      const curWin = isWin ? 1 : 0;
      const curLoss = isThua ? 1 : 0;
      const newTool = {
        toolName: String(toolName),
        win: curWin,
        Thua: curLoss,
        profit: delta,
        KhoiluongVaoLenh: kl,
        PhiGiaodich: phiGD,
        ...(hasTut ? { tut: tutVal } : {}),
        // Trạng thái bot: snapshot ghi đè mỗi ván
        ...(hasTiSo ? { tiSo: Number(body.tiSo) } : {}),
        ...(hasKhung ? { khungB: Number(body.khungB), khungA: Number(body.khungA) } : {}),
        ...(hasBotN ? { botN: Number(body.botN) } : {}),
        currentWinStreak: curWin,
        currentLossStreak: curLoss,
        chuoiThangLienTiepCaoNhat: curWin,
        chuoiThuaLienTiepCaoNhat: curLoss,
        hoaHongHienTai: hoaHongDelta,
        tongHoaHongDaThu: 0,
      };

      await db.collection("accounts").updateOne(
        { taiKhoan },
        {
          $push: { tools: newTool as any },
          $set: { updatedAt: new Date() },
        }
      );
    } else {
      // 2b. Đã có toolName -> update các thông số và chuỗi thắng/thua
      let curWin = Number(existingTool.currentWinStreak) || 0;
      let curLoss = Number(existingTool.currentLossStreak) || 0;
      let maxWin = Number(existingTool.chuoiThangLienTiepCaoNhat) || 0;
      let maxLoss = Number(existingTool.chuoiThuaLienTiepCaoNhat) || 0;

      if (isWin) {
        curWin += 1;
        curLoss = 0;
        if (curWin > maxWin) maxWin = curWin;
      } else if (isThua) {
        curLoss += 1;
        curWin = 0;
        if (curLoss > maxLoss) maxLoss = curLoss;
      }

      await db.collection("accounts").updateOne(
        { taiKhoan },
        {
          $inc: {
            "tools.$[elem].win": isWin ? 1 : 0,
            "tools.$[elem].Thua": isThua ? 1 : 0,
            "tools.$[elem].profit": delta,
            "tools.$[elem].KhoiluongVaoLenh": kl,
            "tools.$[elem].PhiGiaodich": phiGD,
            "tools.$[elem].hoaHongHienTai": hoaHongDelta,
          },
          $set: {
            "tools.$[elem].currentWinStreak": curWin,
            "tools.$[elem].currentLossStreak": curLoss,
            "tools.$[elem].chuoiThangLienTiepCaoNhat": maxWin,
            "tools.$[elem].chuoiThuaLienTiepCaoNhat": maxLoss,
            ...(hasTut ? { "tools.$[elem].tut": tutVal } : {}),
            // Ghi đè trạng thái bot (snapshot — không dùng $inc)
            ...(hasTiSo ? { "tools.$[elem].tiSo": Number(body.tiSo) } : {}),
            ...(hasKhung ? { "tools.$[elem].khungB": Number(body.khungB), "tools.$[elem].khungA": Number(body.khungA) } : {}),
            ...(hasBotN ? { "tools.$[elem].botN": Number(body.botN) } : {}),
            updatedAt: new Date(),
          },
        },
        {
          arrayFilters: [{ "elem.toolName": String(toolName) }],
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật dữ liệu cho tool "${toolName}" của tài khoản "${taiKhoan}" (Hoa hồng: ${hoaHongDelta > 0 ? `+${hoaHongDelta}` : hoaHongDelta}K)`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
