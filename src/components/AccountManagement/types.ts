export interface ToolStat {
  toolName: string;
  win: number;
  Thua: number;
  profit: number;
  KhoiluongVaoLenh?: number;
  PhiGiaodich?: number;
  tut?: number;
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
