"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  App,
  Space,
  Tooltip,
} from "antd";
import type { TableProps } from "antd";
import {
  UserAddOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  UserOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  PercentageOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { AccountItem, AccountFormValues, ToolStat } from "./types";

const PHAN_TRAM_OPTIONS = [
  { label: "0%", value: 0 },
  { label: "10%", value: 10 },
  { label: "20%", value: 20 },
  { label: "30%", value: 30 },
  { label: "40%", value: 40 },
  { label: "50% (Mặc định)", value: 50 },
  { label: "60%", value: 60 },
  { label: "70%", value: 70 },
  { label: "80%", value: 80 },
  { label: "90%", value: 90 },
  { label: "100%", value: 100 },
];

export default function AccountManagement() {
  const { message } = App.useApp();
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal thêm / sửa account
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);
  const [form] = Form.useForm<AccountFormValues>();

  // Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      if (!res.ok) throw new Error("Không thể tải danh sách tài khoản");
      const data = await res.json();
      setAccounts(data);
    } catch (error: any) {
      message.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Tính toán metrics cho từng account
  const getAccountMetrics = (record: AccountItem) => {
    const tools = record.tools || [];
    let totalProfit = 0;
    let totalHoaHongHienTai = 0;
    let totalHoaHongDaThu = 0;

    tools.forEach((t) => {
      totalProfit += Number(t.profit) || 0;
      totalHoaHongHienTai += Number(t.hoaHongHienTai) || 0;
      totalHoaHongDaThu += Number(t.tongHoaHongDaThu) || 0;
    });

    return {
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalHoaHongHienTai: Math.round(totalHoaHongHienTai * 100) / 100,
      totalHoaHongDaThu: Math.round(totalHoaHongDaThu * 100) / 100,
    };
  };


  // Đồng bộ dữ liệu Form khi Modal mở
  useEffect(() => {
    if (isModalOpen) {
      if (editingAccount) {
        form.setFieldsValue({
          taiKhoan: editingAccount.taiKhoan,
          pass: editingAccount.pass,
          phanTramChiuThue: editingAccount.phanTramChiuThue ?? 50,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          phanTramChiuThue: 50,
        });
      }
    }
  }, [isModalOpen, editingAccount, form]);

  // Mở modal Thêm
  const handleOpenAdd = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  // Mở modal Sửa
  const handleOpenEdit = (record: AccountItem) => {
    setEditingAccount(record);
    setIsModalOpen(true);
  };

  // Submit Form Thêm / Sửa
  const handleSubmitForm = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        name: editingAccount ? (editingAccount.name || values.taiKhoan.trim()) : values.taiKhoan.trim(),
      };

      if (editingAccount) {
        // Cập nhật
        const res = await fetch(`/api/accounts?id=${editingAccount.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Không thể cập nhật");
        }
        message.success("Cập nhật thông tin tài khoản thành công!");
      } else {
        // Tạo mới
        const res = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Không thể tạo tài khoản");
        }
        message.success("Thêm tài khoản mới thành công!");
      }

      setIsModalOpen(false);
      fetchAccounts();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  // Thu hoa hồng (bấm nút "ĐÃ NHẬN")
  const handleSettleCommission = async (id: string, taiKhoan: string, amount: number) => {
    try {
      const res = await fetch("/api/accounts/settle-commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể thu hoa hồng");
      }
      message.success(
        `Đã thu ${amount > 0 ? `+${amount}` : amount}K hoa hồng của tài khoản ${taiKhoan}!`
      );
      fetchAccounts();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  // Xoá account
  const handleDeleteAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể xóa");
      }
      message.success("Đã xóa tài khoản!");
      fetchAccounts();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  // Xoá tool khỏi mảng tools của account
  const handleDeleteTool = async (account: AccountItem, toolName: string) => {
    try {
      const updatedTools = account.tools.filter((t) => t.toolName !== toolName);
      const res = await fetch(`/api/accounts?id=${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: updatedTools }),
      });
      if (!res.ok) throw new Error("Không thể xoá tool");
      message.success(`Đã xoá tool ${toolName}`);
      fetchAccounts();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  // Reset thống kê tool (Chỉ reset Win, Thua, Chuỗi thắng/thua cao nhất; Giữ nguyên Profit & Hoa hồng)
  const handleResetTool = async (account: AccountItem, toolName: string) => {
    try {
      const updatedTools = account.tools.map((t) =>
        t.toolName === toolName
          ? {
            ...t,
            win: 0,
            Thua: 0,
            currentWinStreak: 0,
            currentLossStreak: 0,
            chuoiThangLienTiepCaoNhat: 0,
            chuoiThuaLienTiepCaoNhat: 0,
            // Giữ nguyên profit, hoaHongHienTai, tongHoaHongDaThu
          }
          : t
      );
      const res = await fetch(`/api/accounts?id=${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: updatedTools }),
      });
      if (!res.ok) throw new Error("Không thể reset tool");
      message.success(`Đã reset thống kê tool ${toolName}`);
      fetchAccounts();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  // Reset ALL toàn bộ thông số của tool về 0 (Win, Thua, Profit, Hoa hồng, Chuỗi...)
  const handleResetAllTool = async (account: AccountItem, toolName: string) => {
    try {
      const updatedTools = account.tools.map((t) =>
        t.toolName === toolName
          ? {
            ...t,
            win: 0,
            Thua: 0,
            profit: 0,
            currentWinStreak: 0,
            currentLossStreak: 0,
            chuoiThangLienTiepCaoNhat: 0,
            chuoiThuaLienTiepCaoNhat: 0,
            hoaHongHienTai: 0,
            tongHoaHongDaThu: 0,
            KhoiluongVaoLenh: 0,
            PhiGiaodich: 0,
            tut: 0,
            tiSo: 0,
            ...(t.botN !== undefined ? { botN: 1 } : {}),
          }
          : t
      );
      const res = await fetch(`/api/accounts?id=${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: updatedTools }),
      });
      if (!res.ok) throw new Error("Không thể reset all tool");
      message.success(`Đã reset toàn bộ thông số của tool ${toolName} về 0`);
      fetchAccounts();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  // ================= BẢNG CHÍNH (MAIN TABLE) =================
  const columns: TableProps<AccountItem>["columns"] = [
    // Cột 1: Tài khoản
    {
      title: "Tài khoản",
      dataIndex: "taiKhoan",
      key: "taiKhoan",
      width: 190,
      render: (taiKhoan: string, record: AccountItem) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm">
            <UserOutlined />
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded border border-blue-200/60 inline-block text-xs">
              {taiKhoan}
            </span>
          </div>
        </div>
      ),
    },
    // Cột 2: Ngày tham gia
    {
      title: "Ngày tham gia",
      dataIndex: "ngayThamGia",
      key: "ngayThamGia",
      width: 140,
      render: (dateStr: string) => {
        const d = dayjs(dateStr);
        return (
          <div className="flex items-center gap-1.5 text-gray-600 text-xs">
            <CalendarOutlined className="text-gray-400" />
            <span>{d.isValid() ? d.format("DD/MM/YYYY") : "—"}</span>
          </div>
        );
      },
    },
    // Cột 3: Tổng profit
    {
      title: "Tổng profit",
      key: "tongProfit",
      width: 160,
      render: (_, record: AccountItem) => {
        const { totalProfit } = getAccountMetrics(record);
        const isPos = totalProfit >= 0;
        return (
          <span
            className={`font-black text-sm px-2.5 py-1 rounded  inline-block ${isPos
              ? "text-emerald-700  border-emerald-200"
              : "text-rose-700  border-rose-200"
              }`}
          >
            {isPos ? `+${totalProfit.toLocaleString()}` : totalProfit.toLocaleString()} K
          </span>
        );
      },
    },
    // Cột 4: Hoa hồng Đã thu
    {
      title: "Hoa hồng Đã thu",
      key: "tongHoaHongDaThu",
      width: 170,
      render: (_, record: AccountItem) => {
        const { totalHoaHongDaThu } = getAccountMetrics(record);
        return (
          <span className="font-bold text-green-700  px-2.5 py-1 rounded  text-sm inline-block">
            +{totalHoaHongDaThu.toLocaleString()} K
          </span>
        );
      },
    },
    // Cột 5: Hoa Hồng hiện tại + Nút [ĐÃ NHẬN]
    {
      title: "Hoa Hồng hiện tại",
      key: "hoaHongHienTai",
      width: 250,
      render: (_, record: AccountItem) => {
        const { totalHoaHongHienTai } = getAccountMetrics(record);
        const isPos = totalHoaHongHienTai >= 0;
        const hasCommission = totalHoaHongHienTai !== 0;

        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-black text-sm px-2.5 py-1 rounded border inline-block ${isPos
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-rose-700 bg-rose-50 border-rose-200"
                }`}
            >
              {isPos ? `+${totalHoaHongHienTai.toLocaleString()}` : totalHoaHongHienTai.toLocaleString()} K
            </span>

            <Popconfirm
              title="Xác nhận thu hoa hồng?"
              description={`Xác nhận đã nhận ${isPos ? `+${totalHoaHongHienTai}` : totalHoaHongHienTai}K hoa hồng từ tài khoản ${record.taiKhoan}?`}
              onConfirm={() => handleSettleCommission(record.id, record.taiKhoan, totalHoaHongHienTai)}
              okText="Nhận"
              cancelText="Hủy"
              disabled={!hasCommission}
            >
              <Button
                type="primary"
                size="small"
                disabled={!hasCommission}
                icon={<CheckCircleOutlined />}
                className={hasCommission ? "bg-emerald-600 hover:bg-emerald-500 font-bold" : ""}
              >
                NHẬN
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
    // Cột 6: Thao tác
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record: AccountItem) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết & Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-blue-600 hover:text-blue-700 text-base" />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xoá account">
            <Popconfirm
              title="Xoá tài khoản này?"
              description={`Bạn có chắc muốn xoá tài khoản ${record.taiKhoan}?`}
              onConfirm={() => handleDeleteAccount(record.id)}
              okText="Xoá"
              cancelText="Huỷ"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined className="text-base" />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ================= BẢNG MỞ RỘNG (EXPANDED ROW - CHI TIẾT TỪNG TOOL) =================
  const expandedRowRender = (record: AccountItem) => {
    const list = record.tools || [];

    const subColumns = [
      {
        title: "Tên Tool",
        dataIndex: "toolName",
        key: "toolName",
        render: (toolName: string) => (
          <span className="font-bold text-blue-600 font-mono text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
            {toolName}
          </span>
        ),
      },
      {
        title: "Thắng / Thua",
        key: "win_loss",
        render: (_: any, t: ToolStat) => (
          <div className="flex items-center gap-1 font-bold text-xs">
            <Tag color="success" className="font-bold px-1.5 py-0.5 text-xs m-0">
              {t.win ?? 0}
            </Tag>
            <span className="text-gray-400 font-semibold">/</span>
            <Tag color="error" className="font-bold px-1.5 py-0.5 text-xs m-0">
              {t.Thua ?? 0}
            </Tag>
          </div>
        ),
      },
      {
        title: "Lợi nhuận",
        dataIndex: "profit",
        key: "profit",
        render: (profit: number) => {
          const num = Number(profit) || 0;
          const isPos = num >= 0;
          return (
            <span
              className={`font-black text-xs px-2 py-0.5 rounded ${isPos
                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                : "text-rose-700 bg-rose-50 border border-rose-200"
                }`}
            >
              {isPos ? `+${num.toLocaleString()}` : num.toLocaleString()} K
            </span>
          );
        },
      },
      {
        title: "%",
        key: "winrate",
        render: (_: any, t: ToolStat) => {
          const total = (t.win || 0) + (t.Thua || 0);
          const rate = total > 0 ? (((t.win || 0) / total) * 100).toFixed(1) : "0.0";
          return (
            <span className="font-semibold text-gray-700 text-xs">
              {rate}%
            </span>
          );
        },
      },
      {
        title: "Khối lượng",
        dataIndex: "KhoiluongVaoLenh",
        key: "KhoiluongVaoLenh",
        render: (val: number) => {
          const num = Number(val) || 0;
          return (
            <span className="font-semibold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {num.toLocaleString()} K
            </span>
          );
        },
      },
      {
        title: "Phí",
        dataIndex: "PhiGiaodich",
        key: "PhiGiaodich",
        render: (val: number) => {
          const num = Number(val) || 0;
          return (
            <span className="font-semibold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {num.toLocaleString()} K
            </span>
          );
        },
      },
      {
        title: "Tụt",
        dataIndex: "tut",
        key: "tut",
        render: (val: number) => {
          const num = Number(val) || 0;
          return (
            <Tag color={num > 0 ? "volcano" : "default"} className="font-bold px-2 py-0.5 text-xs m-0">
              {num > 0 ? `-${num.toLocaleString()}` : "0"} K
            </Tag>
          );
        },
      },
      {
        title: "Thắng / Thua Max",
        key: "max_streaks",
        render: (_: any, t: ToolStat) => {
          const maxWin = t.chuoiThangLienTiepCaoNhat ?? 0;
          const currentWin = t.currentWinStreak ?? 0;
          const maxLoss = t.chuoiThuaLienTiepCaoNhat ?? 0;
          const currentLoss = t.currentLossStreak ?? 0;
          return (
            <div className="flex items-center gap-1 font-bold text-xs">
              <Tooltip title={`Chuỗi thắng hiện tại: ${currentWin} ván`}>
                <Tag color="orange" className="font-bold px-1.5 py-0.5 text-xs m-0">
                  {maxWin} ❄️
                </Tag>
              </Tooltip>
              <span className="text-gray-400 font-semibold">/</span>
              <Tooltip title={`Chuỗi thua hiện tại: ${currentLoss} ván`}>
                <Tag color="purple" className="font-bold px-1.5 py-0.5 text-xs m-0">
                  {maxLoss} 🔥
                </Tag>
              </Tooltip>
            </div>
          );
        },
      },
      // Cột Tỉ số / Khung: hiển thị trạng thái nội tại bot — snapshot từ API
      // Bot TíSố (1/3/4/5): "tiSo / [khungB, khungA]"  VD: 1 / [-4, 4]
      // Bot 2K: "n / [n]"  VD: 3 / [3]
      {
        title: "Tỉ số / Khung",
        key: "tiSo_khung",
        render: (_: any, t: ToolStat) => {
          // Bot 2K chỉ có botN, không có tiSo/khungB/khungA
          if (t.botN !== undefined && t.tiSo === undefined) {
            const n = Number(t.botN) || 1;
            return (
              <Tooltip title={`Bộ đếm nhân hiện tại: ${n}`}>
                <span className="font-mono text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {n} / [{n}]
                </span>
              </Tooltip>
            );
          }
          // Bot TíSố: hiển thị tiSo / [khungB, khungA]
          const tiSo = t.tiSo ?? "—";
          const kB = t.khungB;
          const kA = t.khungA;
          if (kB === undefined || kA === undefined) {
            return <span className="text-gray-400 text-xs">—</span>;
          }
          const color = Number(tiSo) > 0 ? "blue" : Number(tiSo) < 0 ? "volcano" : "default";
          return (
            <Tooltip title={`Tỉ số: ${tiSo} | Khung: [${kB}, ${kA}]`}>
              <span className="font-mono font-bold text-xs">
                <Tag color={color} className="font-bold px-1.5 py-0.5 text-xs m-0">
                  {tiSo}
                </Tag>
                <span className="text-gray-500"> / [{kB}, {kA}]</span>
              </span>
            </Tooltip>
          );
        },
      },
      // Cột MỚI 1: Hoa Hồng hiện tại của Tool
      {
        title: "Hoa Hồng hiện tại",
        dataIndex: "hoaHongHienTai",
        key: "hoaHongHienTai",
        render: (val: number) => {
          const num = Number(val) || 0;
          const isPos = num >= 0;
          return (
            <Tag color={isPos ? "success" : "error"} className="font-bold px-2 py-0.5 text-xs">
              {isPos ? `+${num}` : num} K
            </Tag>
          );
        },
      },
      // Cột MỚI 2: Tổng hoa hồng đã thu của Tool
      {
        title: "Hoa hồng đã thu",
        dataIndex: "tongHoaHongDaThu",
        key: "tongHoaHongDaThu",
        render: (val: number) => {
          const num = Number(val) || 0;
          return (
            <Tag color="gold" className="font-bold px-2 py-0.5 text-xs">
              +{num.toLocaleString()} K
            </Tag>
          );
        },
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 200,
        render: (_: any, t: ToolStat) => (
          <Space size="small">
            <Popconfirm
              title="Reset thống kê tool?"
              description={`Đưa Win, Thua, Chuỗi kỷ lục -> về 0? (Profit và Hoa hồng được giữ nguyên)`}
              onConfirm={() => handleResetTool(record, t.toolName)}
              okText="Reset"
              cancelText="Huỷ"
            >
              <Button size="small" type="default">
                Reset
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Reset ALL tất cả chỉ số?"
              onConfirm={() => handleResetAllTool(record, t.toolName)}
              okText="Reset All"
              cancelText="Huỷ"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger ghost>
                Reset All
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Xoá tool này?"
              onConfirm={() => handleDeleteTool(record, t.toolName)}
              okText="Xoá"
              cancelText="Huỷ"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase text-slate-600 tracking-wider">
              Tool Sử dụng
            </span>
            <Tag color="cyan" className="font-semibold text-xs">
              Thuế: {record.phanTramChiuThue ?? 50}%
            </Tag>
          </div>
        </div>
        <Table
          columns={subColumns}
          dataSource={list.map((t, idx) => ({ ...t, key: t.toolName || idx }))}
          pagination={false}
          size="small"
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "Chưa có thông số tool nào được ghi nhận" }}
        />
      </div>
    );
  };

  const editingMetrics = editingAccount ? getAccountMetrics(editingAccount) : null;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <UserOutlined className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">
              Quản lý Account & Tool Baccarat
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý tài khoản, mật khẩu, theo dõi % hoa hồng phải chịu và thu hoa hồng theo chu kỳ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAccounts}
            loading={loading}
            className="hover:border-blue-500"
          >
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 font-semibold"
          >
            Thêm account
          </Button>
        </div>
      </div>


      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <Table
          columns={columns}
          dataSource={accounts.map((acc) => ({ ...acc, key: acc.id }))}
          loading={loading}
          expandable={{
            expandedRowRender,
            rowExpandable: () => true,
          }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng số ${total} tài khoản`,
          }}
          scroll={{ x: "max-content" }}
          className="account-custom-table"
        />
      </div>

      {/* Modal Thêm / Sửa Account */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-bold">
            <UserAddOutlined className="text-blue-600" />
            <span>{editingAccount ? "Thông tin chi tiết & Sửa tài khoản" : "Tạo tài khoản mới"}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleSubmitForm}
        onCancel={() => setIsModalOpen(false)}
        okText={editingAccount ? "Lưu thay đổi" : "Tạo tài khoản"}
        cancelText="Hủy"
        destroyOnHidden
        width="min(520px, 95vw)"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ phanTramChiuThue: 50 }}
          className="mt-4"
        >
          <Form.Item
            label="Tài khoản"
            name="taiKhoan"
            rules={[{ required: true, message: "Vui lòng nhập tài khoản đăng nhập!" }]}
          >
            <Input
              placeholder="VD: user01, botbaccarat01..."
              prefix={<UserOutlined className="text-gray-400" />}
              disabled={!!editingAccount}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="pass"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu..."
              prefix={<KeyOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label="Mức hoa hồng chịu"
            name="phanTramChiuThue"
            rules={[{ required: true, message: "Vui lòng chọn mức hoa hồng phải chịu!" }]}
            tooltip="Tỷ lệ % hoa hồng tính trên số tiền thắng/thua của bot"
          >
            <Select
              options={PHAN_TRAM_OPTIONS}
              placeholder="Chọn tỷ lệ %..."
              suffixIcon={<PercentageOutlined className="text-blue-500" />}
            />
          </Form.Item>



          {/* Khi Edit: Hiển thị thêm các thông tin tài chính của account */}
          {editingAccount && editingMetrics && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mt-2 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Thông số tài chính hiện tại
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="text-gray-500">Hoa hồng hiện tại:</div>
                  <div
                    className={`font-black text-sm mt-0.5 ${editingMetrics.totalHoaHongHienTai >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                  >
                    {editingMetrics.totalHoaHongHienTai >= 0
                      ? `+${editingMetrics.totalHoaHongHienTai}`
                      : editingMetrics.totalHoaHongHienTai} K
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="text-gray-500">Hoa hồng đã thu:</div>
                  <div className="font-black text-sm text-amber-600 mt-0.5">
                    +{editingMetrics.totalHoaHongDaThu} K
                  </div>
                </div>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}
