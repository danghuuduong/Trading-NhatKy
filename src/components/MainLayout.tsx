"use client";

import React, { useState } from "react";
import { Layout, Menu, Button, Drawer, message } from "antd";
import {
  HistoryOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NodeIndexOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import VividFireIcon from "@/components/UrgentTasks/VividFireIcon";

const { Sider, Content, Header } = Layout;

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
    key: "/accounts",
    icon: <UserOutlined className="text-lg" />,
    label: "Quản lý Account",
  },
  {
    key: "/urgent-tasks",
    icon: <VividFireIcon size="sm" />,
    label: "Việc cần làm gấp",
  },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      message.success("Đã đăng xuất");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const selectedKey =
    MENU_ITEMS.find((item) =>
      item.key === "/" ? pathname === "/" : pathname.startsWith(item.key)
    )?.key || "/";

  const navigate = (key: string) => {
    router.push(key);
    setMobileDrawerOpen(false);
  };

  // Nội dung Sidebar / Drawer dùng chung
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* Logo */}
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
            {/* Desktop: nút fold/unfold */}
            <div className="hidden md:block">
              {!collapsed ? (
                <Button
                  type="text"
                  icon={<MenuFoldOutlined className="text-gray-500 hover:text-cyan-500" />}
                  onClick={() => setCollapsed(true)}
                  className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100"
                />
              ) : (
                <Button
                  type="text"
                  icon={<MenuUnfoldOutlined className="text-gray-500 hover:text-cyan-500" />}
                  onClick={() => setCollapsed(false)}
                  className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100"
                />
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          className="pt-4 border-none font-medium"
          onClick={({ key }) => navigate(key)}
          items={MENU_ITEMS}
        />
      </div>

      {/* Đăng xuất */}
      <div className="p-3 border-t border-gray-100">
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full flex items-center justify-start text-xs font-semibold rounded-lg hover:bg-red-50"
        >
          {!collapsed && "Đăng xuất"}
        </Button>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex">
        <Sider
          collapsible
          collapsed={collapsed}
          theme="light"
          width={260}
          className="shadow-md border-r border-gray-100 min-h-screen flex flex-col"
          trigger={null}
        >
          <SidebarContent />
        </Sider>
      </div>

      <Layout className="flex-1 flex flex-col min-w-0">
        {/* ── Mobile Header ── */}
        <Header className="md:hidden flex items-center justify-between bg-white border-b border-gray-100 shadow-sm px-4 h-14 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden p-1 border border-gray-100">
              <img src="/logoChinh.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-base tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              NHẬT KÝ
            </span>
          </div>
          <Button
            type="text"
            icon={<MenuOutlined className="text-gray-600 text-lg" />}
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100"
          />
        </Header>

        {/* ── Mobile Drawer ── */}
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          placement="left"
          width={260}
          className="md:hidden"
          styles={{ body: { padding: 0 } }}
          closeIcon={<CloseOutlined />}
          title={null}
        >
          <SidebarContent />
        </Drawer>

        {/* ── Content ── */}
        <Content className="p-3 md:p-6 flex-1 w-full min-w-0 overflow-hidden">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
