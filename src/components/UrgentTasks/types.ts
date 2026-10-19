export type PriorityLevel = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface UrgentTask {
  id: string;
  title: string;
  dueTime: string; // ISO string format
  priority: PriorityLevel;
  status: TaskStatus;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; color: string; order: number; bg: string; border: string; text: string }
> = {
  URGENT: {
    label: "Khẩn cấp",
    color: "red",
    order: 1,
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
  },
  HIGH: {
    label: "Cao",
    color: "orange",
    order: 2,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  MEDIUM: {
    label: "Trung bình",
    color: "gold",
    order: 3,
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
  },
  LOW: {
    label: "Thấp",
    color: "default",
    order: 4,
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-600",
  },
};

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; text: string; bg: string }
> = {
  PENDING: {
    label: "—",
    text: "text-gray-400",
    bg: "bg-gray-100",
  },
  IN_PROGRESS: {
    label: "Đang làm",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  COMPLETED: {
    label: "Hoàn thành",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
  },
};
