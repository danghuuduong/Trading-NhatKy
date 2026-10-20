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
  DatePicker,
  Popconfirm,
  App,
  Card,
  Space,
  Tooltip,
  Badge,
} from "antd";
import type { TableProps } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleFilled,
  FireOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  UrgentTask,
  PriorityLevel,
  TaskStatus,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from "./types";

export default function UrgentTasks() {
  const { message } = App.useApp();
  const [tasks, setTasks] = useState<UrgentTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Filters & Search
  const [searchText, setSearchText] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Modal create / edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<UrgentTask | null>(null);
  const [form] = Form.useForm();

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Không thể tải danh sách công việc");
      const data = await res.json();
      setTasks(data);
    } catch (error: any) {
      message.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Sync form values when modal opens
  useEffect(() => {
    if (isModalOpen) {
      if (editingTask) {
        form.setFieldsValue({
          title: editingTask.title,
          dueTime: editingTask.dueTime ? dayjs(editingTask.dueTime) : dayjs(),
          priority: editingTask.priority,
          status: editingTask.status,
          note: editingTask.note || "",
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          dueTime: dayjs().add(1, "hour"),
          priority: "LOW",
          status: "PENDING",
          note: "",
        });
      }
    }
  }, [isModalOpen, editingTask, form]);

  // Open modal create
  const handleCreateClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open modal edit
  const handleEditClick = (task: UrgentTask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Delete single task
  const handleDeleteSingle = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa không thành công");
      message.success("Đã xóa công việc");
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
      fetchTasks();
    } catch (error: any) {
      message.error("Lỗi khi xóa: " + error.message);
    }
  };

  // Delete selected tasks (bulk delete)
  const handleDeleteBatch = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRowKeys }),
      });
      if (!res.ok) throw new Error("Xóa hàng loạt không thành công");
      const data = await res.json();
      message.success(`Đã xóa thành công ${data.count ?? selectedRowKeys.length} công việc!`);
      setSelectedRowKeys([]);
      fetchTasks();
    } catch (error: any) {
      message.error("Lỗi khi xóa: " + error.message);
    }
  };

  // Quick toggle priority directly from table
  const handleQuickPriorityChange = async (task: UrgentTask, newPriority: PriorityLevel) => {
    try {
      const res = await fetch(`/api/tasks?id=${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (!res.ok) throw new Error("Cập nhật mức độ ưu tiên thất bại");
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, priority: newPriority } : t))
      );
      message.success("Đã cập nhật mức độ ưu tiên");
    } catch (error: any) {
      message.error("Lỗi: " + error.message);
    }
  };

  // Quick toggle status directly from table
  const handleQuickStatusChange = async (task: UrgentTask, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks?id=${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
      message.success("Đã cập nhật trạng thái");
    } catch (error: any) {
      message.error("Lỗi: " + error.message);
    }
  };

  // Submit modal form
  const handleModalSubmit = async (values: any) => {
    try {
      const payload = {
        title: values.title,
        dueTime: values.dueTime ? values.dueTime.toISOString() : new Date().toISOString(),
        priority: values.priority,
        status: values.status,
        note: values.note ? values.note.trim() : "",
      };

      if (editingTask) {
        const res = await fetch(`/api/tasks?id=${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Cập nhật công việc thất bại");
        message.success("Cập nhật công việc thành công");
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Tạo công việc thất bại");
        message.success("Tạo công việc mới thành công");
      }

      setIsModalOpen(false);
      fetchTasks();
    } catch (error: any) {
      message.error("Lỗi: " + error.message);
    }
  };

  // Sort and filter tasks
  // Sort and filter tasks: Mặc định không ưu tiên theo mức độ, việc mới tạo luôn lên đầu danh sách
  const sortedAndFilteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchSearch =
          !searchText ||
          task.title.toLowerCase().includes(searchText.toLowerCase()) ||
          (task.note && task.note.toLowerCase().includes(searchText.toLowerCase()));
        const matchPriority =
          filterPriority === "ALL" || task.priority === filterPriority;
        const matchStatus =
          filterStatus === "ALL" || task.status === filterStatus;
        return matchSearch && matchPriority && matchStatus;
      })
      .sort((a, b) => {
        // Việc mới tạo luôn lên đầu danh sách
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        return b.id.localeCompare(a.id);
      });
  }, [tasks, searchText, filterPriority, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const urgent = tasks.filter((t) => t.priority === "URGENT" && t.status !== "COMPLETED").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    return { total, urgent, inProgress, completed };
  }, [tasks]);

  // Table row selection
  const rowSelection: TableProps<UrgentTask>["rowSelection"] = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
  };

  // Table columns
  const columns: TableProps<UrgentTask>["columns"] = [
    {
      title: "1. Tiêu đề công việc",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: UrgentTask) => {
        const isCompleted = record.status === "COMPLETED";
        return (
          <div className="flex items-center gap-2.5">
            <span
              className={`font-semibold text-sm ${isCompleted
                ? "line-through text-gray-400 font-normal italic"
                : "text-gray-800"
                }`}
            >
              {text}
            </span>
          </div>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 220,
      render: (note: string, record: UrgentTask) => {
        const isCompleted = record.status === "COMPLETED";
        if (!note || note.trim() === "") {
          return <span className="text-gray-300 italic text-xs">—</span>;
        }
        return (
          <Tooltip title={note} placement="topLeft">
            <div
              className={`text-xs text-gray-600 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100 max-w-[210px] line-clamp-2 leading-relaxed ${isCompleted ? "line-through opacity-50" : ""
                }`}
            >
              {note}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "2. Thời gian",
      dataIndex: "dueTime",
      key: "dueTime",
      width: 200,
      render: (dueTime: string, record: UrgentTask) => {
        const dateObj = dayjs(dueTime);
        const isCompleted = record.status === "COMPLETED";
        const isOverdue = !isCompleted && dateObj.isBefore(dayjs());

        return (
          <div
            className={`flex items-center gap-2 text-xs ${isCompleted
              ? "line-through text-gray-400"
              : isOverdue
                ? "text-rose-600 font-bold"
                : "text-gray-600 font-medium"
              }`}
          >
            <ClockCircleOutlined
              className={isOverdue && !isCompleted ? "text-rose-500 animate-bounce" : "text-gray-400"}
            />
            <span>{dateObj.format("DD/MM/YYYY HH:mm")}</span>
            {isOverdue && !isCompleted && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                Quá hạn
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "3. Mức độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 175,
      render: (priority: PriorityLevel, record: UrgentTask) => {
        const selectBorderClass =
          priority === "URGENT"
            ? "[&_.ant-select-selector]:!bg-rose-50/70 [&_.ant-select-selector]:!border-rose-300 [&_.ant-select-selector]:!rounded-xl shadow-sm shadow-rose-100"
            : priority === "HIGH"
              ? "[&_.ant-select-selector]:!bg-amber-50/70 [&_.ant-select-selector]:!border-amber-300 [&_.ant-select-selector]:!rounded-xl shadow-sm shadow-amber-100"
              : priority === "MEDIUM"
                ? "[&_.ant-select-selector]:!bg-yellow-50/70 [&_.ant-select-selector]:!border-yellow-300 [&_.ant-select-selector]:!rounded-xl"
                : "[&_.ant-select-selector]:!bg-gray-100/70 [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!rounded-xl";

        return (
          <div onClick={(e) => e.stopPropagation()} className="w-full">
            <Select
              value={priority}
              onChange={(newVal) => handleQuickPriorityChange(record, newVal)}
              className={`w-full text-xs font-bold ${selectBorderClass}`}
              popupMatchSelectWidth={false}
              popupClassName="rounded-xl shadow-xl p-1"
              options={[
                {
                  value: "URGENT",
                  label: (
                    <div className="flex items-center gap-2 py-0.5 font-bold text-rose-600">
                      <FireOutlined className="text-rose-500 animate-pulse text-sm shrink-0" />
                      <span>Khẩn cấp</span>
                    </div>
                  ),
                },
                {
                  value: "HIGH",
                  label: (
                    <div className="flex items-center gap-2 py-0.5 font-bold text-amber-600">
                      <span className="text-amber-500 text-sm leading-none shrink-0">⚡</span>
                      <span>Cao</span>
                    </div>
                  ),
                },
                {
                  value: "MEDIUM",
                  label: (
                    <div className="flex items-center gap-2 py-0.5 font-bold text-yellow-600">
                      <span className="text-yellow-500 text-sm leading-none shrink-0">⭐</span>
                      <span>Trung bình</span>
                    </div>
                  ),
                },
                {
                  value: "LOW",
                  label: (
                    <div className="flex items-center gap-2 py-0.5 font-bold text-gray-500">
                      <span className="text-emerald-500 text-sm leading-none shrink-0">🌱</span>
                      <span>Thấp</span>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        );
      },
    },
    {
      title: "4. Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 175,
      render: (status: TaskStatus, record: UrgentTask) => {
        const selectBorderClass =
          status === "IN_PROGRESS"
            ? "[&_.ant-select-selector]:!bg-amber-50/70 [&_.ant-select-selector]:!border-amber-300 [&_.ant-select-selector]:!rounded-xl shadow-sm shadow-amber-100"
            : status === "COMPLETED"
              ? "[&_.ant-select-selector]:!bg-emerald-50/60 [&_.ant-select-selector]:!border-emerald-200 [&_.ant-select-selector]:!rounded-xl"
              : "[&_.ant-select-selector]:!bg-gray-100/70 [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!rounded-xl";

        return (
          <div onClick={(e) => e.stopPropagation()} className="w-full">
            <Select
              value={status}
              onChange={(newVal) => handleQuickStatusChange(record, newVal)}
              className={`w-full text-xs font-bold ${selectBorderClass}`}
              popupMatchSelectWidth={false}
              popupClassName="rounded-xl shadow-xl p-1"
              options={[
                {
                  value: "PENDING",
                  label: (
                    <div className="flex items-center gap-2 py-0.5 font-bold text-gray-500">
                      <span className="text-sm font-black w-4 text-center leading-none">—</span>
                      <span>Chưa làm</span>
                    </div>
                  ),
                },
                {
                  value: "IN_PROGRESS",
                  label: (
                    <div className="flex items-center gap-2 py-0.5 font-bold text-amber-600">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                      <span>Đang làm</span>
                    </div>
                  ),
                },
                {
                  value: "COMPLETED",
                  label: (
                    <div className="flex items-center gap-2 py-0.5 font-bold text-emerald-600">
                      <CheckCircleFilled className="text-emerald-500 text-sm shrink-0" />
                      <span>Hoàn thành</span>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        );
      },
    },
    {
      title: "5. Hành động",
      key: "actions",
      width: 130,
      render: (_: any, record: UrgentTask) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-cyan-600 hover:text-cyan-700" />}
              onClick={() => handleEditClick(record)}
              className="hover:bg-cyan-50 rounded-lg flex items-center justify-center h-8 w-8"
            />
          </Tooltip>
          <Tooltip title="Xóa công việc">
            <Popconfirm
              title="Xóa công việc này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={() => handleDeleteSingle(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined className="text-rose-500 hover:text-rose-600" />}
                className="hover:bg-rose-50 rounded-lg flex items-center justify-center h-8 w-8"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        className="rounded-2xl"
        styles={{
          body: {
            padding: 24,
          },
        }}
        style={{
          background: "#fff",
          border: "1px solid #f0f0f0",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* Header & Page Title */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          {/* Hàng 1: Tiêu đề + nút thêm */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-rose-200 text-white text-lg">
                <FireOutlined />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-800 tracking-tight m-0">
                  Việc Cần Làm Gấp
                </h1>
                <p className="text-xs text-gray-500 font-medium m-0 mt-0.5">
                  Quản lý các nhiệm vụ khẩn cấp, theo dõi tiến độ và thời hạn tức thời
                </p>
              </div>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateClick}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 border-none text-white font-bold shadow-md shadow-rose-200 flex items-center gap-2"
            >
              Thêm việc mới
            </Button>
          </div>

          {/* Hàng 2: Thống kê */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-1 pt-6 border-t border-gray-100">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Tổng công việc
                </span>
                <span className="text-2xl font-black text-gray-800 mt-1 block">
                  {stats.total}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 text-base">
                <CalendarOutlined />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
                  Khẩn cấp
                </span>
                <span className="text-2xl font-black text-rose-600 mt-1 block">
                  {stats.urgent}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 text-base">
                <FireOutlined />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                  Đang làm
                </span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">
                  {stats.inProgress}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 text-base">
                <SyncOutlined spin={stats.inProgress > 0} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Đã hoàn thành
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {stats.completed}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 text-base">
                <CheckCircleFilled className="text-emerald-500 text-sm shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter + Table: Chung 1 Card */}
        <div className="bg-white rounded-2xl mt-4 border border-gray-100 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-3 border-b border-gray-100">
            {/* Tìm kiếm bên trái */}
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Tìm kiếm công việc..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="w-full md:w-72 h-10 rounded-xl border-gray-200 hover:border-rose-400 focus:border-rose-400"
            />

            {/* Bộ lọc bên phải: nằm ngang */}
            <div className="flex flex-row flex-nowrap items-center gap-3 w-full md:w-auto">
              <Select
                value={filterPriority}
                onChange={setFilterPriority}
                className="w-36 h-10 shrink-0"
                options={[
                  { value: "ALL", label: "Tất cả mức độ" },
                  { value: "URGENT", label: "🔥 Khẩn cấp" },
                  { value: "HIGH", label: "⚡ Cao" },
                  { value: "MEDIUM", label: "⭐ Trung bình" },
                  { value: "LOW", label: "🌱 Thấp" },
                ]}
              />

              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                className="w-40 h-10 shrink-0"
                options={[
                  { value: "ALL", label: "Tất cả trạng thái" },
                  { value: "PENDING", label: "— Chưa làm" },
                  { value: "IN_PROGRESS", label: "🟡 Đang làm" },
                  { value: "COMPLETED", label: "✅ Hoàn thành" },
                ]}
              />

              {/* Xóa hàng loạt */}
              {selectedRowKeys.length > 0 && (
                <div className="flex items-center gap-3 bg-rose-50/70 border border-rose-200 px-4 py-2 rounded-xl animate-fadeIn shrink-0">
                  <span className="text-xs font-bold text-rose-700 whitespace-nowrap">
                    Đã chọn <span className="underline">{selectedRowKeys.length}</span> công việc
                  </span>

                  <Popconfirm
                    title={`Xóa tất cả ${selectedRowKeys.length} công việc đã chọn?`}
                    description="Các công việc này sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu."
                    onConfirm={handleDeleteBatch}
                    okText="Xóa tất cả"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      className="rounded-lg font-bold shadow-sm"
                    >
                      Xóa đã chọn
                    </Button>
                  </Popconfirm>
                </div>
              )}
            </div>
          </div>

          {/* Main Table */}
          <div className="p-2">
            <Table<UrgentTask>
              rowKey="id"
              rowSelection={rowSelection}
              columns={columns}
              dataSource={sortedAndFilteredTasks}
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng cộng ${total} công việc`,
                className: "pr-4",
              }}
              rowClassName={(record) =>
                record.status === "COMPLETED"
                  ? "bg-gray-50/60 transition-all hover:bg-gray-100/50"
                  : "transition-all hover:bg-rose-50/20"
              }
            />
          </div>
        </div>

      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500"></span>
            <span className="text-base font-bold text-gray-800">
              {editingTask ? "Cập nhật Công việc" : "Thêm Việc Cần Làm Gấp"}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
        className="rounded-2xl overflow-hidden"
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ priority: "LOW", status: "PENDING" }}
          onFinish={handleModalSubmit}
          className="pt-4 space-y-4"
        >
          {/* Title */}
          <Form.Item
            name="title"
            label={<span className="font-bold text-gray-700 text-xs">1. Tiêu đề công việc</span>}
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề công việc!" }]}
          >
            <Input
              placeholder="Ví dụ: Rút tiền trước 15h, Chốt lệnh Vàng trước tin CPI, Xem lại SL..."
              className="h-11 rounded-xl border-gray-200 hover:border-rose-400 focus:border-rose-400 focus:shadow-none"
            />
          </Form.Item>

          {/* Time & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="dueTime"
              label={<span className="font-bold text-gray-700 text-xs">2. Thời gian / Thời hạn</span>}
              rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
            >
              <DatePicker
                showTime={{ format: "HH:mm" }}
                format="DD/MM/YYYY HH:mm"
                className="w-full h-11 rounded-xl border-gray-200 hover:border-rose-400 focus:border-rose-400"
                placeholder="Chọn ngày và giờ"
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label={<span className="font-bold text-gray-700 text-xs">3. Mức độ ưu tiên</span>}
              rules={[{ required: true, message: "Vui lòng chọn mức độ ưu tiên!" }]}
            >
              <Select
                className="w-full h-11"
                options={[
                  { value: "URGENT", label: "🔥 Khẩn cấp (Làm ngay)" },
                  { value: "HIGH", label: "⚡ Cao" },
                  { value: "MEDIUM", label: "⭐ Trung bình" },
                  { value: "LOW", label: "🌱 Thấp" },
                ]}
              />
            </Form.Item>
          </div>

          {/* Status */}
          <Form.Item
            name="status"
            label={<span className="font-bold text-gray-700 text-xs">4. Trạng thái</span>}
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select
              className="w-full h-11"
              options={[
                {
                  value: "PENDING",
                  label: (
                    <div className="flex items-center gap-2 font-bold text-gray-500">
                      <span className="text-sm font-black w-4 text-center leading-none">—</span>
                      <span>Chưa làm gì</span>
                    </div>
                  ),
                },
                {
                  value: "IN_PROGRESS",
                  label: (
                    <div className="flex items-center gap-2 font-bold text-amber-600">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span>Đang làm (Đang thực hiện)</span>
                    </div>
                  ),
                },
                {
                  value: "COMPLETED",
                  label: (
                    <div className="flex items-center gap-2 font-bold text-emerald-600">
                      <CheckCircleFilled className="text-emerald-500 text-sm" />
                      <span>Hoàn thành</span>
                    </div>
                  ),
                },
              ]}
            />
          </Form.Item>

          {/* Ghi chú */}
          <Form.Item
            name="note"
            label={<span className="font-bold text-gray-700 text-xs">Ghi chú</span>}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú chi tiết hoặc lưu ý cho công việc này..."
              className="rounded-xl border-gray-200 hover:border-rose-400 focus:border-rose-400 focus:shadow-none text-xs"
            />
          </Form.Item>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="h-10 px-5 rounded-xl font-semibold border-gray-200 hover:border-gray-400"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 border-none text-white font-bold shadow-md shadow-rose-200"
            >
              {editingTask ? "Cập nhật" : "Lưu công việc"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
