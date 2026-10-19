"use client";

import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  HistoryOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NodeIndexOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

const { Sider, Content } = Layout;

// Danh sách các mục menu điều hướng
// Khi muốn tạo thêm các mục khác trong tương lai, bạn chỉ cần:
// 1. Tạo thư mục tương ứng trong `src/app/<tên_route>/page.tsx`
// 2. Thêm mục vào mảng `MENU_ITEMS` dưới đây với `key` là đường dẫn của route đó
export const MENU_ITEMS = [
  {
    key: "/",
    icon: <HistoryOutlined className="text-lg" />,
    label: "Nhật ký giao dịch",
  },
  {
    key: "/methods",
    icon: <NodeIndexOutlined className="text-lg" />,
    label: "Phương pháp giao dịch",
  },
  {
    key: "/urgent-tasks",
    icon: <FireOutlined className="text-lg text-rose-500" />,
    label: "Việc cần làm gấp",
  },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // Xác định menu item nào đang active dựa trên URL hiện tại
  // Nếu đang ở /methods (hoặc các route con của /methods) -> active /methods
  // Ngược lại nếu ở / -> active /
  const selectedKey =
    MENU_ITEMS.find((item) =>
      item.key === "/" ? pathname === "/" : pathname.startsWith(item.key)
    )?.key || "/";

  return (
    <Layout className="min-h-screen bg-gray-50 flex">
      {/* Sidebar bên trái */}
      <Sider
        collapsible
        collapsed={collapsed}
        theme="light"
        width={260}
        className="shadow-md border-r border-gray-100 min-h-screen"
        trigger={null}
      >
        {/* Logo Area */}
        <div className="p-5 flex flex-col gap-3 border-b border-gray-100">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden p-1">
                <img src="/logoChinh.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-black text-lg tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    NHẬT KÝ
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    NHỚ TUÂN THỦ
                  </span>
                </div>
              )}
            </div>
            {!collapsed && (
              <Button
                type="text"
                icon={<MenuFoldOutlined className="text-gray-500 hover:text-cyan-500" />}
                onClick={() => setCollapsed(true)}
                className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100"
              />
            )}
          </div>
          {collapsed && (
            <div className="flex justify-center w-full mt-1">
              <Button
                type="text"
                icon={<MenuUnfoldOutlined className="text-gray-500 hover:text-cyan-500" />}
                onClick={() => setCollapsed(false)}
                className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100"
              />
            </div>
          )}
        </div>

        {/* Menu Điều hướng */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          className="pt-4 border-none font-medium"
          onClick={({ key }) => {
            router.push(key);
          }}
          items={MENU_ITEMS}
        />
      </Sider>

      {/* Main Content Area bên phải */}
      <Layout className="flex-1 flex flex-col bg-gray-50/50">
        <Content className="p-6 flex-1 w-full">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
