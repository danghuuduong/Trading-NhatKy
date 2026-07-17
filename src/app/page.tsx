"use client";

import React, { useState } from "react";
import { Layout, Menu, Card, Avatar } from "antd";
import {
  HistoryOutlined,
  BookOutlined,
  UserOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import TradingJournal from "@/components/TradingJournal";

const { Sider, Content } = Layout;

export default function Dashboard() {
  // Trạng thái chọn menu điều hướng: 'transactions' hoặc 'courses'
  const [selectedKey, setSelectedKey] = useState<string>("transactions");
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <Layout className="min-h-screen bg-gray-50 flex">
      {/* Sidebar bên trái */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        width={260}
        className="shadow-md border-r border-gray-100 sticky top-0 h-screen overflow-y-auto"
      >
        {/* Logo Area */}
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-200">
            <GlobalOutlined className="text-xl" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                NEXUS
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Dashboard V1.0
              </span>
            </div>
          )}
        </div>

        {/* Menu Điều hướng */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          className="pt-4 border-none font-medium"
          onClick={({ key }) => setSelectedKey(key)}
          items={[
            {
              key: "transactions",
              icon: <HistoryOutlined className="text-lg" />,
              label: "Nhật ký giao dịch",
            },
            {
              key: "courses",
              icon: <BookOutlined className="text-lg" />,
              label: "Khóa học",
            },
          ]}
        />

        {/* Thông tin tài khoản phía dưới Sidebar */}
        {!collapsed && (
          <div className="absolute bottom-16 left-4 right-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-cyan-50/30 border border-cyan-100/30 flex items-center gap-3">
            <Avatar size="default" icon={<UserOutlined />} className="bg-cyan-400 text-white shadow" />
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-gray-700 truncate">Tài khoản chính</h4>
              <p className="text-[10px] text-cyan-600 font-bold truncate">Premium Account</p>
            </div>
          </div>
        )}
      </Sider>

      {/* Main Content Area bên phải */}
      <Layout className="flex-1 flex flex-col bg-gray-50/50">
        {/* Nội dung chính thay đổi theo Menu được chọn */}
        <Content className="p-6 flex-1 w-full">
          {selectedKey === "transactions" ? (
            <TradingJournal />
          ) : (
            <Card className="border-none shadow-sm h-64 flex items-center justify-center rounded-xl bg-white">
              <div className="text-center space-y-2">
                <BookOutlined className="text-4xl text-cyan-400" />
                <h3 className="text-lg font-bold text-gray-700">Khung giao diện: Khóa học</h3>
                <p className="text-sm text-gray-400">Nội dung chi tiết của Khóa học sẽ hiển thị tại đây.</p>
              </div>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}


