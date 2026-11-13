"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, App, ConfigProvider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type LoginValues = { username: string; password: string };

function LoginForm() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Tài khoản hoặc mật khẩu không chính xác!");
      }

      message.success("Đăng nhập thành công!");
      // Dùng window.location.href để tải lại toàn bộ trạng thái cookie
      window.location.href = "/";
    } catch (err: any) {
      message.error(err.message || "Lỗi đăng nhập!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_#e0e7ff_0%,_#f8fafc_55%)]">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 px-8 py-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 p-2 mb-4 flex items-center justify-center">
            <img src="/logoChinh.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <Title level={3} className="!mb-1 !text-slate-900 !font-semibold">
            Đăng nhập
          </Title>
          <Text className="!text-slate-500">Quản lý Nhật ký & Tài khoản</Text>
        </div>

        <Form
          name="loginForm"
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tài khoản" }]}
          >
            <Input
              prefix={<UserOutlined className="text-slate-400 mr-1" />}
              placeholder="Tên tài khoản"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400 mr-1" />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item className="!mt-6 !mb-0">
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#1e3a8a", borderRadius: 10, fontSize: 15 },
        components: { Button: { controlHeightLG: 48, fontWeight: 600 } },
      }}
    >
      <App>
        <LoginForm />
      </App>
    </ConfigProvider>
  );
}
