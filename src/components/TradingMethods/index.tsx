"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Steps,
  Tag,
  Popconfirm,
  Spin,
  Empty,
  App,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Method } from "./types";
import { Condition } from "../TradingJournal/types";

export default function TradingMethods() {
  const { message } = App.useApp();
  const [methods, setMethods] = useState<Method[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMethod, setEditingMethod] = useState<Method | null>(null);
  
  // State for dynamic steps in the form
  const [formSteps, setFormSteps] = useState<string[]>([]);
  
  const [form] = Form.useForm();

  // Load methods and conditions
  const fetchData = async () => {
    setLoading(true);
    try {
      const [methodsRes, conditionsRes] = await Promise.all([
        fetch("/api/methods"),
        fetch("/api/conditions"),
      ]);
      
      if (!methodsRes.ok || !conditionsRes.ok) {
        throw new Error("Failed to load data");
      }
      
      const methodsData = await methodsRes.json();
      const conditionsData = await conditionsRes.json();
      
      setMethods(methodsData);
      setConditions(conditionsData);
    } catch (error: any) {
      message.error("Lỗi khi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal for adding
  const handleAddClick = () => {
    setEditingMethod(null);
    setFormSteps([""]); // Start with 1 empty step
    form.resetFields();
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = (method: Method) => {
    setEditingMethod(method);
    setFormSteps(method.steps.length > 0 ? [...method.steps] : [""]);
    form.setFieldsValue({
      name: method.name,
      conditionIds: method.conditionIds,
    });
    setIsModalOpen(true);
  };

  // Delete a method
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/methods?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete method");
      message.success("Xóa phương pháp thành công");
      fetchData();
    } catch (error: any) {
      message.error("Lỗi khi xóa: " + error.message);
    }
  };

  // Add step to form
  const addStepField = () => {
    setFormSteps([...formSteps, ""]);
  };

  // Remove step from form
  const removeStepField = (index: number) => {
    const updated = formSteps.filter((_, idx) => idx !== index);
    // If no steps left, keep at least one empty step
    setFormSteps(updated.length > 0 ? updated : [""]);
  };

  // Handle step text change
  const handleStepChange = (index: number, value: string) => {
    const updated = [...formSteps];
    updated[index] = value;
    setFormSteps(updated);
  };

  // Handle modal submit
  const handleModalSubmit = async (values: any) => {
    // Filter out empty steps
    const cleanedSteps = formSteps.map(s => s.trim()).filter(s => s !== "");
    
    if (cleanedSteps.length === 0) {
      message.warning("Vui lòng nhập ít nhất một bước trong quy trình!");
      return;
    }

    const payload = {
      name: values.name,
      conditionIds: values.conditionIds || [],
      steps: cleanedSteps,
    };

    try {
      let url = "/api/methods";
      let methodType = "POST";

      if (editingMethod) {
        url = `/api/methods?id=${editingMethod.id}`;
        methodType = "PUT";
      }

      const res = await fetch(url, {
        method: methodType,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save method");

      message.success(
        editingMethod
          ? "Cập nhật phương pháp thành công"
          : "Thêm phương pháp mới thành công"
      );
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      message.error("Lỗi khi lưu phương pháp: " + error.message);
    }
  };

  // Map condition details for rendering
  const getConditionName = (id: string) => {
    const cond = conditions.find((c) => c.id === id);
    return cond ? cond.name : "Chỉ báo không xác định";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Phương pháp Giao dịch</h2>
          <p className="text-sm text-gray-500">
            Quản lý các chiến lược, liên kết chỉ báo kỹ thuật và thiết lập quy trình từng bước chuẩn hóa.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddClick}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 border-none text-gray-900 font-bold shadow-md shadow-cyan-100/50 transition-all duration-200 self-start sm:self-auto"
        >
          Thêm phương pháp
        </Button>
      </div>

      {/* Grid List of Strategies */}
      {methods.length === 0 ? (
        <Card className="border-none shadow-sm rounded-xl py-12">
          <Empty
            description={
              <span className="text-gray-400">
                Chưa có phương pháp giao dịch nào. Hãy bắt đầu bằng cách thêm phương pháp mới!
              </span>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <Card
              key={method.id}
              className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md hover:border-cyan-300 hover:shadow-cyan-50/50 transition-all duration-300 flex flex-col bg-white overflow-hidden group"
              styles={{
                body: { padding: "20px", display: "flex", flexDirection: "column", height: "100%" }
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-gray-50 pb-3 mb-4">
                <h3 className="font-bold text-base text-gray-800 tracking-tight group-hover:text-cyan-600 transition-colors">
                  {method.name}
                </h3>
                <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="text"
                    icon={<EditOutlined className="text-gray-500 hover:text-cyan-500 text-sm" />}
                    onClick={() => handleEditClick(method)}
                    size="small"
                    className="rounded-lg hover:bg-gray-100 flex items-center justify-center w-7 h-7"
                  />
                  <Popconfirm
                    title="Xóa phương pháp này?"
                    description="Tất cả cài đặt quy trình của phương pháp sẽ bị xóa vĩnh viễn."
                    onConfirm={() => handleDelete(method.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined className="text-rose-500 text-sm" />}
                      size="small"
                      className="rounded-lg hover:bg-rose-50 flex items-center justify-center w-7 h-7"
                    />
                  </Popconfirm>
                </div>
              </div>

              {/* Conditions / Indicators */}
              <div className="mb-5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Chỉ báo sử dụng
                </span>
                <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                  {method.conditionIds && method.conditionIds.length > 0 ? (
                    method.conditionIds.map((condId) => (
                      <Tag
                        key={condId}
                        color="cyan"
                        className="rounded-lg px-2 py-0.5 border-cyan-100 text-[11px] font-semibold text-cyan-700 bg-cyan-50/50 m-0"
                      >
                        {getConditionName(condId)}
                      </Tag>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">Không liên kết chỉ báo nào</span>
                  )}
                </div>
              </div>

              {/* Workflow / Steps */}
              <div className="flex-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
                  Quy trình thực hiện
                </span>
                <Steps
                  direction="vertical"
                  size="small"
                  current={-1} // Keeps all steps pending/gray for checklist appearance
                  className="methods-steps-timeline"
                  items={method.steps.map((step, idx) => ({
                    title: (
                      <span className="text-xs font-semibold text-gray-700">
                        Bước {idx + 1}
                      </span>
                    ),
                    description: (
                      <p className="text-xs text-gray-500 mt-0.5 font-medium leading-relaxed">
                        {step}
                      </p>
                    ),
                    icon: (
                      <div className="w-5 h-5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 font-bold text-[10px] flex items-center justify-center shadow-inner">
                        {idx + 1}
                      </div>
                    )
                  }))}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        title={
          <span className="text-base font-bold text-gray-800">
            {editingMethod ? "Cập nhật Phương pháp" : "Thêm Phương pháp mới"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        className="rounded-2xl overflow-hidden"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
          className="pt-4 space-y-4"
        >
          {/* Method Name */}
          <Form.Item
            name="name"
            label={<span className="font-bold text-gray-700 text-xs">Tên Phương pháp</span>}
            rules={[{ required: true, message: "Vui lòng nhập tên phương pháp!" }]}
          >
            <Input
              placeholder="Ví dụ: SMC + Quasimodo, Breakout D1, EMA Cross..."
              className="h-11 rounded-xl border-gray-200 hover:border-cyan-400 focus:border-cyan-400 focus:shadow-none"
            />
          </Form.Item>

          {/* Condition multi-select */}
          <Form.Item
            name="conditionIds"
            label={
              <span className="font-bold text-gray-700 text-xs">
                Liên kết Chỉ báo (từ danh sách Điều kiện sẵn có)
              </span>
            }
          >
            <Select
              mode="multiple"
              placeholder="Chọn chỉ báo sẽ sài trong phương pháp này..."
              className="w-full rounded-xl"
              style={{ width: "100%" }}
              popupClassName="rounded-xl"
              options={conditions.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
          </Form.Item>

          {/* Dynamic Steps Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-700 text-xs">Quy trình từng bước</span>
              <Button
                type="dashed"
                onClick={addStepField}
                icon={<PlusOutlined />}
                size="small"
                className="rounded-lg text-cyan-600 hover:text-cyan-700 border-cyan-200 hover:border-cyan-300 text-xs font-semibold"
              >
                Thêm bước
              </Button>
            </div>
            
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {formSteps.map((stepText, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm shrink-0">
                    S{index + 1}
                  </div>
                  <Input
                    placeholder={`Nội dung bước ${index + 1} (Ví dụ: Chờ giá hồi về vùng FVG của H4...)`}
                    value={stepText}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="h-10 rounded-xl border-gray-200 hover:border-cyan-400 focus:border-cyan-400 focus:shadow-none"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined className="text-gray-400 hover:text-rose-500" />}
                    onClick={() => removeStepField(index)}
                    className="flex items-center justify-center rounded-lg hover:bg-rose-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="h-10 px-5 rounded-xl font-semibold border-gray-200 hover:border-cyan-400 hover:text-cyan-500"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 border-none text-gray-900 font-bold shadow-md shadow-cyan-100"
            >
              {editingMethod ? "Cập nhật" : "Lưu"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
