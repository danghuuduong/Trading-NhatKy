export interface ToolStat {
  toolName: string;
  win: number;
  Thua: number;
  profit: number;
  KhoiluongVaoLenh?: number;
  PhiGiaodich?: number;
  tut?: number;
  // Trạng thái nội tại bot — snapshot ghi đè mỗi ván, dùng để khôi phục khi tắt/mất mạng
  tiSo?: number;    // Tỉ số hiện tại (bot 1/3/4/5)
  khungB?: number;  // Khung biên dưới hiện tại (bot 1/3/4/5)
  khungA?: number;  // Khung biên trên hiện tại (bot 1/3/4/5)
  botN?: number;    // Bộ đếm nhân hiện tại (bot 2K)
  chuoiThangLienTiepCaoNhat?: number;
  chuoiThuaLienTiepCaoNhat?: number;
  currentWinStreak?: number;
  currentLossStreak?: number;
  hoaHongHienTai: number;     // Hoa hồng hiện tại của riêng tool này
  tongHoaHongDaThu: number;   // Tổng hoa hồng đã bị thu của riêng tool này
  [key: string]: any;        // Tự do mở rộng bất kỳ trường nào trong tương lai mà không bị lỗi TypeScript
}

export interface AccountItem {
  id: string;
  name?: string;
  taiKhoan: string;
  pass: string;
  phanTramChiuThue: number;   // 0 -> 100 (%)
  ngayThamGia: string;
  tools: ToolStat[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;        // Tự do mở rộng bất kỳ trường nào trong tương lai
}

export interface AccountFormValues {
  name?: string;
  taiKhoan: string;
  pass: string;
  phanTramChiuThue: number;
}
