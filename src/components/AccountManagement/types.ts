export interface ToolStat {
  toolName: string;
  win: number;
  Thua: number;
  profit: number;
  chuoiThangLienTiepCaoNhat?: number;
  chuoiThuaLienTiepCaoNhat?: number;
  currentWinStreak?: number;
  currentLossStreak?: number;
  hoaHongHienTai: number;     // Hoa hồng hiện tại của riêng tool này
  tongHoaHongDaThu: number;   // Tổng hoa hồng đã bị thu của riêng tool này
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
}

export interface AccountFormValues {
  name?: string;
  taiKhoan: string;
  pass: string;
  phanTramChiuThue: number;
}
