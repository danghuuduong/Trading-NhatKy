"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Radio,
  Checkbox,
  Progress,
  Table,
  Tag,
  Empty,
  Popconfirm,
  Spin,
  Select,
  App,
  Dropdown,
  Rate,
  Tabs,
  Card,
} from "antd";
import type { MenuProps } from "antd";
import {
  PlusOutlined,
  BookOutlined,
  DownOutlined,
  RightOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  UnorderedListOutlined,
  MinusCircleOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  Condition,
  JournalEntry,
  SelectedConditionState,
  SubCondition,
  TimeframeScores,
} from "./types";
import RichTextEditor from "./RichTextEditor";
import { Method } from "../TradingMethods/types";

interface NoteCellProps {
  record: JournalEntry;
  onSave: (id: string, note: string) => Promise<void>;
}

function NoteCell({ record, onSave }: NoteCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempNote, setTempNote] = useState(record.note || "");

  useEffect(() => {
    setTempNote(record.note || "");
  }, [record.note]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    if (tempNote !== record.note) {
      await onSave(record.id, tempNote);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempNote(record.note || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div
        className="relative border border-cyan-400 p-2 rounded-xl bg-white shadow-lg z-50 flex flex-col gap-2"
        style={{ minWidth: "280px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <RichTextEditor
          value={tempNote}
          onChange={setTempNote}
          autoFocus
        />
        <div className="flex justify-end gap-1.5 mt-2">
          <Button size="small" onClick={handleCancel} className="rounded-lg">
            Hủy
          </Button>
          <Button size="small" type="primary" onClick={handleSave} className="bg-cyan-400 hover:bg-cyan-500 border-none text-gray-900 font-semibold rounded-lg">
            Lưu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-cyan-50/50 p-2 rounded-xl border border-transparent hover:border-cyan-200 transition-all duration-200 group relative min-h-[40px] min-w-[150px]"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {record.note ? (
        <div
          className="text-xs text-gray-800 break-words note-content"
          dangerouslySetInnerHTML={{ __html: record.note }}
        />
      ) : (
        <span className="text-gray-300 italic text-xs">Nhấp để thêm ghi chú...</span>
      )}
      <EditOutlined className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity" />
    </div>
  );
}

interface ProfitCellProps {
  record: JournalEntry;
  onSave: (id: string, profit: number | null) => Promise<void>;
}

function ProfitCell({ record, onSave }: ProfitCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState<number | null>(record.profit ?? null);

  useEffect(() => {
    setTempVal(record.profit ?? null);
  }, [record.profit]);

  const handleSave = async () => {
    setIsEditing(false);
    if (tempVal !== record.profit) {
      await onSave(record.id, tempVal);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <InputNumber
          size="small"
          value={tempVal}
          onChange={setTempVal}
          autoFocus
          onBlur={handleSave}
          onPressEnter={handleSave}
          placeholder="Lãi/Lỗ $"
          style={{ width: 85 }}
          className="rounded-lg text-xs"
        />
      </div>
    );
  }

  const val = record.profit;
  if (val == null) {
    return (
      <div
        className="cursor-pointer hover:bg-cyan-50/50 px-2 py-1.5 rounded-lg text-gray-300 italic text-[11px] border border-transparent hover:border-cyan-200 transition-all select-none text-center"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      >
        Nhập...
      </div>
    );
  }

  const isPositive = val > 0;
  const isNegative = val < 0;

  return (
    <div
      className="cursor-pointer hover:bg-cyan-50/50 px-2 py-1.5 rounded-lg border border-transparent hover:border-cyan-200 transition-all duration-200 group relative font-semibold text-xs flex items-center justify-between"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      <span className={isPositive ? "text-emerald-600 font-extrabold" : isNegative ? "text-rose-500 font-extrabold" : "text-gray-500"}>
        {isPositive ? "+" : ""}
        {val} $
      </span>
      <EditOutlined className="opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity ml-1.5 text-[10px]" />
    </div>
  );
}


function ConditionsCell({ conds }: { conds: any[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!conds || conds.length === 0) {
    return <span className="text-gray-300 text-xs italic">—</span>;
  }
  const MAX = 1;
  const visible = expanded ? conds : conds.slice(0, MAX);
  const hidden = conds.length - MAX;
  return (
    <div className="flex flex-col gap-1 max-w-[200px]">
      {visible.map((c: any, index: number) => {
        const tfsLabel = c.timeframes && c.timeframes.length > 0
          ? c.timeframes.join(", ")
          : (c.timeframe ?? "?");
        return (
          <div key={index} className="flex flex-col gap-0.5">
            <Tag color="cyan" className="border-cyan-200 text-cyan-800 rounded-md font-medium text-xs py-0.5 whitespace-normal leading-snug">
              {c.conditionName} ({tfsLabel}: {c.score}đ)
            </Tag>
            {(c.subConditions || []).map((sc: any, si: number) => (
              <Tag key={si} color="geekblue" className="rounded-md font-medium text-xs py-0.5 whitespace-normal leading-snug">
                ↳ {sc.name} (+{sc.bonusPoints}đ)
              </Tag>
            ))}
          </div>
        );
      })}
      {conds.length > MAX && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="mt-0.5 text-md font-bold text-cyan-600 hover:text-cyan-800 underline underline-offset-2 self-start transition-colors cursor-pointer"
        >
          {expanded ? "Thu gọn ▴" : `+${hidden} cái khác ▾`}
        </button>
      )}
    </div>
  );
}

const TIMEFRAMES: (keyof TimeframeScores)[] = ["M15", "M30", "H1", "H2", "H4", "D1"];

const genId = () => Math.random().toString(36).slice(2, 10);

const FOREX_SYMBOL_GROUPS = [
  {
    label: "🥇 Kim loại",
    options: [
      "XAU/USD (Vàng)",
      "XAG/USD (Bạc)",
      "XPT/USD (Bạch kim)",
      "XPD/USD (Palladium)",
    ],
  },
  {
    label: "🪙 Tiền điện tử",
    options: [
      "BTC/USD (Bitcoin)",
      "ETH/USD (Ethereum)",
      "SOL/USD (Solana)",
      "XRP/USD (Ripple)",
      "BNB/USD (BNB)",
    ],
  },
  {
    label: "🌍 Forex",
    options: [
      "EUR/USD (Euro)",
      "GBP/USD (Bảng Anh)",
      "USD/JPY (Yên Nhật)",
      "USD/CHF (Franc Thụy Sĩ)",
      "AUD/USD (Đô la Úc)",
      "USD/CAD (Đô la Canada)",
      "NZD/USD (Đô la New Zealand)",
      "EUR/JPY (Euro - Yên Nhật)",
      "GBP/JPY (Bảng Anh - Yên Nhật)",
      "AUD/JPY (Đô la Úc - Yên Nhật)",
      "EUR/GBP (Euro - Bảng Anh)",
    ],
  },
  {
    label: "⚡ Năng lượng",
    options: [
      "USOIL (Dầu WTI)",
      "UKOIL (Dầu Brent)",
      "NGAS (Khí tự nhiên)",
    ],
  },
  {
    label: "📊 Chỉ số",
    options: [
      "NAS100 (Nasdaq 100)",
      "US30 (Dow Jones)",
      "SPX500 (S&P 500)",
      "GER40 (DAX 40)",
      "UK100 (FTSE 100)",
      "JP225 (Nikkei 225)",
      "HK50 (Hang Seng)",
    ],
  },
];

const getAssessment = (percent: number) => {
  const stars = Number((percent / 20).toFixed(1));
  let advice = "";
  let colorClass = "";
  let bgClass = "";
  let borderClass = "";
  let emoji = "";

  if (percent < 25) {
    advice = "Không nên vào lệnh, cần phân tích kỹ lưỡng lại, hoặc đi Vol bé";
    colorClass = "text-rose-600";
    bgClass = "bg-rose-50/50";
    borderClass = "border-rose-100";
    emoji = "⚠️";
  } else if (percent < 65) {
    advice = "Thận trọng ,đi vol vừa phải hoặc bé";
    colorClass = "text-amber-600";
    bgClass = "bg-amber-50/50";
    borderClass = "border-amber-100";
    emoji = "🛡️";
  } else if (percent < 75) {
    advice = "Nên vào , vol vừa phải ";
    colorClass = "text-lime-600";
    bgClass = "bg-lime-50/50";
    borderClass = "border-lime-100";
    emoji = "📈";
  } else if (percent < 80) {
    advice = "Ổn đó, nên vào Lệnh . Vol ok chút, không được quá to";
    colorClass = "text-cyan-600";
    bgClass = "bg-cyan-50/50";
    borderClass = "border-cyan-100";
    emoji = "✅";
  } else if (percent < 90) {
    advice = "Sịn nha Vol To cũng được, đừng Allin sếp ơi!. Tự tin mà vào lệnh";
    colorClass = "text-emerald-600";
    bgClass = "bg-emerald-50/50";
    borderClass = "border-emerald-100";
    emoji = "🔥";
  } else {
    advice = "Quá ngon, không vào hơi phí ";
    colorClass = "text-violet-600";
    bgClass = "bg-violet-50/50";
    borderClass = "border-violet-100";
    emoji = "💎";
  }

  return { stars, advice, colorClass, bgClass, borderClass, emoji };
};

export default function TradingJournal() {
  const { message } = App.useApp();
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loadingConditions, setLoadingConditions] = useState(true);
  const [loadingJournals, setLoadingJournals] = useState(true);

  const [isCondOpen, setIsCondOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isEditCondOpen, setIsEditCondOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null);
  const [isEditJournalOpen, setIsEditJournalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);

  const [condForm] = Form.useForm();
  const [journalForm] = Form.useForm();
  const [editCondForm] = Form.useForm();
  const [editJournalForm] = Form.useForm();

  const [newSubConds, setNewSubConds] = useState<SubCondition[]>([]);
  const [editSubConds, setEditSubConds] = useState<SubCondition[]>([]);

  const [selectedConditions, setSelectedConditions] = useState<
    Record<string, SelectedConditionState>
  >({});
  const [editSelectedConditions, setEditSelectedConditions] = useState<
    Record<string, SelectedConditionState>
  >({});
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());
  const [expandedEditCardIds, setExpandedEditCardIds] = useState<Set<string>>(new Set());

  // States for Method Verification
  const [methods, setMethods] = useState<Method[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState<string | undefined>(undefined);
  const [formStepsChecked, setFormStepsChecked] = useState<boolean[]>([]);
  const [editSelectedMethodId, setEditSelectedMethodId] = useState<string | undefined>(undefined);
  const [editFormStepsChecked, setEditFormStepsChecked] = useState<boolean[]>([]);

  // Watch direction from form for live advice feedback
  const direction = Form.useWatch("direction", journalForm);
  const editDirection = Form.useWatch("direction", editJournalForm);

  // ---- FETCH ----
  const fetchConditions = async () => {
    try {
      const res = await fetch("/api/conditions");
      if (res.ok) {
        const data = await res.json();
        // Ensure subConditions is always an array
        const normalized = data.map((c: any) => ({
          ...c,
          subConditions: c.subConditions ?? [],
        }));
        setConditions(normalized);
      } else {
        message.error("Lỗi khi tải danh sách điều kiện từ database!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối API điều kiện!");
    } finally {
      setLoadingConditions(false);
    }
  };

  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journals");
      if (res.ok) {
        const data = await res.json();
        setJournals(data);
      } else {
        message.error("Lỗi khi tải danh sách nhật ký!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối API nhật ký!");
    } finally {
      setLoadingJournals(false);
    }
  };

  const fetchMethods = async () => {
    try {
      const res = await fetch("/api/methods");
      if (res.ok) {
        const data = await res.json();
        setMethods(data);
      }
    } catch (e) {
      console.error("Lỗi khi tải phương pháp giao dịch:", e);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    fetchConditions();
    fetchJournals();
    fetchMethods();
  }, []);

  useEffect(() => {
    const initialStates: Record<string, SelectedConditionState> = {};
    conditions.forEach((c) => {
      initialStates[c.id] = {
        checked: false,
        selectedTimeframes: ["H1"],
        checkedSubConditions: [],
      };
    });
    setSelectedConditions((prev) => {
      const updated = { ...initialStates };
      Object.keys(prev).forEach((key) => {
        if (updated[key]) updated[key] = prev[key];
      });
      return updated;
    });
  }, [conditions]);

  // Reset method form state when modal open/close
  useEffect(() => {
    if (isJournalOpen) {
      setSelectedMethodId(undefined);
      setFormStepsChecked([]);
    }
  }, [isJournalOpen]);

  const handleMethodChange = (methodId: string | undefined) => {
    setSelectedMethodId(methodId);
    if (methodId) {
      const method = methods.find((m) => m.id === methodId);
      if (method) {
        setFormStepsChecked(new Array(method.steps.length).fill(false));

        // Auto check conditions associated with this method
        setSelectedConditions((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            updated[key] = {
              ...updated[key],
              checked: false,
            };
          });
          if (method.conditionIds) {
            method.conditionIds.forEach((condId) => {
              if (updated[condId]) {
                updated[condId] = {
                  ...updated[condId],
                  checked: true,
                };
              }
            });
          }
          return updated;
        });
      } else {
        setFormStepsChecked([]);
      }
    } else {
      setFormStepsChecked([]);
    }
  };

  const isSaveDisabled = (() => {
    if (conditions.length === 0) return true;
    if (selectedMethodId) {
      const method = methods.find((m) => m.id === selectedMethodId);
      if (method && method.steps.length > 0) {
        const completedCount = formStepsChecked.filter(Boolean).length;
        return completedCount < method.steps.length;
      }
    }
    return false;
  })();

  const handleEditMethodChange = (methodId: string | undefined) => {
    setEditSelectedMethodId(methodId);
    if (methodId) {
      const method = methods.find((m) => m.id === methodId);
      if (method) {
        setEditFormStepsChecked(new Array(method.steps.length).fill(false));
      } else {
        setEditFormStepsChecked([]);
      }
    } else {
      setEditFormStepsChecked([]);
    }
  };

  const isEditSaveDisabled = (() => {
    if (conditions.length === 0) return true;
    if (editSelectedMethodId) {
      const method = methods.find((m) => m.id === editSelectedMethodId);
      if (method && method.steps.length > 0) {
        const completedCount = editFormStepsChecked.filter(Boolean).length;
        return completedCount < method.steps.length;
      }
    }
    return false;
  })();

  // ---- SCORE CALCULATION ----
  const calcCondScore = (cond: Condition, state: SelectedConditionState): number => {
    if (!state.checked) return 0;
    const base = (state.selectedTimeframes || []).reduce((sum, tf) => sum + (cond.scores[tf] || 0), 0);
    const subBonus = (cond.subConditions || [])
      .filter((sc) => state.checkedSubConditions.includes(sc.id))
      .reduce((s, sc) => s + sc.bonusPoints, 0);
    return base + subBonus;
  };

  // Tổng điểm: base + bonus phụ đã chọn (VD: RSI 5đ + phân kỳ 2đ = 7đ)
  const currentTotalScore = conditions.reduce((sum, cond) => {
    const state = selectedConditions[cond.id];
    return state ? sum + calcCondScore(cond, state) : sum;
  }, 0);

  const editTotalScore = conditions.reduce((sum, cond) => {
    const state = editSelectedConditions[cond.id];
    return state ? sum + calcCondScore(cond, state) : sum;
  }, 0);

  // Mẫu số: chỉ tính max base score (không cộng bonus phụ vào mẫu)
  const maxPossibleScore = conditions.reduce((sum, cond) => {
    const scores = Object.values(cond.scores);
    const maxBase = scores.reduce((s, score) => s + (score > 0 ? score : 0), 0);
    return sum + maxBase;
  }, 0);

  const progressPercent = Math.round(Math.min((currentTotalScore / 100) * 100, 100));

  const editProgressPercent = Math.round(Math.min((editTotalScore / 100) * 100, 100));

  const selectedCount = Object.values(selectedConditions).filter(c => c.checked).length;
  const editSelectedCount = Object.values(editSelectedConditions).filter(c => c.checked).length;

  // ---- CONDITION CRUD ----
  const handleSaveCondition = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        scores: {
          M15: values.M15 ?? 0,
          M30: values.M30 ?? 0,
          H1: values.H1 ?? 0,
          H2: values.H2 ?? 0,
          H4: values.H4 ?? 0,
          D1: values.D1 ?? 0,
        },
        subConditions: newSubConds,
      };
      const res = await fetch("/api/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        message.success("Lưu điều kiện mới lên database thành công!");
        await fetchConditions();
        condForm.resetFields();
        setNewSubConds([]);
        setIsCondOpen(false);
      } else {
        message.error("Lỗi máy chủ khi tạo điều kiện!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi gửi điều kiện!");
    }
  };

  const openEditCondition = (cond: Condition) => {
    setEditingCondition(cond);
    editCondForm.setFieldsValue({
      name: cond.name,
      M15: cond.scores.M15,
      M30: cond.scores.M30,
      H1: cond.scores.H1,
      H2: cond.scores.H2,
      H4: cond.scores.H4,
      D1: cond.scores.D1,
    });
    setEditSubConds(cond.subConditions || []);
    setIsEditCondOpen(true);
  };

  const handleUpdateCondition = async (values: any) => {
    if (!editingCondition) return;
    try {
      const payload = {
        name: values.name,
        scores: {
          M15: values.M15 ?? 0,
          M30: values.M30 ?? 0,
          H1: values.H1 ?? 0,
          H2: values.H2 ?? 0,
          H4: values.H4 ?? 0,
          D1: values.D1 ?? 0,
        },
        subConditions: editSubConds,
      };
      const res = await fetch(`/api/conditions?id=${editingCondition.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        message.success("Cập nhật điều kiện thành công!");
        await fetchConditions();
        editCondForm.resetFields();
        setEditSubConds([]);
        setIsEditCondOpen(false);
        setEditingCondition(null);
      } else {
        message.error("Lỗi máy chủ khi cập nhật điều kiện!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi cập nhật điều kiện!");
    }
  };

  const handleDeleteCondition = async (id: string) => {
    try {
      const res = await fetch(`/api/conditions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Đã xóa điều kiện khỏi database.");
        await fetchConditions();
      } else {
        message.error("Lỗi máy chủ khi xóa điều kiện!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi gửi yêu cầu xóa!");
    }
  };

  // ---- JOURNAL CRUD ----
  const handleSaveJournal = async (values: any) => {
    try {
      const satisfiedDetails = conditions
        .filter((c) => selectedConditions[c.id]?.checked)
        .map((c) => {
          const state = selectedConditions[c.id];
          const timeframes = state.selectedTimeframes || [];
          const checkedSubs = (c.subConditions || []).filter((sc) =>
            state.checkedSubConditions.includes(sc.id)
          );
          return {
            conditionId: c.id,
            conditionName: c.name,
            timeframe: timeframes[0] ?? "H1",
            timeframes,
            score: calcCondScore(c, state),
            subConditions: checkedSubs.map((sc) => ({
              name: sc.name,
              bonusPoints: sc.bonusPoints,
            })),
          };
        });

      const selectedMethod = methods.find((m) => m.id === selectedMethodId);
      const payload = {
        direction: values.direction,
        symbol: values.symbol ?? null,
        totalScore: currentTotalScore,
        maxScore: maxPossibleScore,
        conditions: satisfiedDetails,
        entry: values.entry ?? null,
        sl: values.sl ?? null,
        tp: values.tp ?? null,
        vol: values.vol ?? null,
        note: values.note ?? "",
        methodId: selectedMethodId ?? null,
        methodName: selectedMethod ? selectedMethod.name : null,
      };

      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success("Ghi nhật ký giao dịch thành công!");
        await fetchJournals();
        journalForm.resetFields();
        const resetStates: Record<string, SelectedConditionState> = {};
        conditions.forEach((c) => {
          resetStates[c.id] = {
            checked: false,
            selectedTimeframes: ["H1"],
            checkedSubConditions: [],
          };
        });
        setSelectedConditions(resetStates);
        setExpandedCardIds(new Set());
        setIsJournalOpen(false);
      } else {
        message.error("Lỗi máy chủ khi lưu nhật ký!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi gửi nhật ký!");
    }
  };

  const openEditJournal = (journal: JournalEntry) => {
    setEditingJournal(journal);
    editJournalForm.setFieldsValue({
      symbol: journal.symbol ?? null,
      direction: journal.direction,
      entry: journal.entry,
      sl: journal.sl,
      tp: journal.tp,
      vol: journal.vol,
      note: journal.note ?? "",
      profit: journal.profit,
      result: journal.result,
      methodId: journal.methodId ?? undefined,
    });
    setEditSelectedMethodId(journal.methodId || undefined);

    if (journal.methodId) {
      const method = methods.find((m) => m.id === journal.methodId);
      if (method) {
        setEditFormStepsChecked(new Array(method.steps.length).fill(true));
      } else {
        setEditFormStepsChecked([]);
      }
    } else {
      setEditFormStepsChecked([]);
    }

    const initialEditStates: Record<string, SelectedConditionState> = {};
    conditions.forEach((c) => {
      const savedCond = journal.conditions?.find((jc) => jc.conditionId === c.id);
      if (savedCond) {
        let selectedTfs: (keyof TimeframeScores)[] = [];
        if (savedCond.timeframes) {
          selectedTfs = [...savedCond.timeframes];
        } else if (savedCond.timeframe) {
          selectedTfs = [savedCond.timeframe];
        } else {
          selectedTfs = ["H1"];
        }

        const checkedSubs: string[] = [];
        if (c.subConditions && savedCond.subConditions) {
          savedCond.subConditions.forEach((savedSub) => {
            const match = c.subConditions?.find((sc) => sc.name === savedSub.name);
            if (match) {
              checkedSubs.push(match.id);
            }
          });
        }

        initialEditStates[c.id] = {
          checked: true,
          selectedTimeframes: selectedTfs,
          checkedSubConditions: checkedSubs,
        };
      } else {
        initialEditStates[c.id] = {
          checked: false,
          selectedTimeframes: ["H1"],
          checkedSubConditions: [],
        };
      }
    });

    setEditSelectedConditions(initialEditStates);
    setIsEditJournalOpen(true);
  };

  const handleUpdateJournal = async (values: any) => {
    if (!editingJournal) return;
    try {
      const satisfiedDetails = conditions
        .filter((c) => editSelectedConditions[c.id]?.checked)
        .map((c) => {
          const state = editSelectedConditions[c.id];
          const timeframes = state.selectedTimeframes || [];
          const checkedSubs = (c.subConditions || []).filter((sc) =>
            state.checkedSubConditions.includes(sc.id)
          );
          return {
            conditionId: c.id,
            conditionName: c.name,
            timeframe: timeframes[0] ?? "H1",
            timeframes,
            score: calcCondScore(c, state),
            subConditions: checkedSubs.map((sc) => ({
              name: sc.name,
              bonusPoints: sc.bonusPoints,
            })),
          };
        });

      const selectedMethod = methods.find((m) => m.id === editSelectedMethodId);
      const payload = {
        direction: values.direction,
        symbol: values.symbol ?? null,
        totalScore: editTotalScore,
        maxScore: maxPossibleScore,
        conditions: satisfiedDetails,
        entry: values.entry ?? null,
        sl: values.sl ?? null,
        tp: values.tp ?? null,
        vol: values.vol ?? null,
        note: values.note ?? "",
        profit: values.profit ?? null,
        result: values.result ?? null,
        methodId: editSelectedMethodId ?? null,
        methodName: selectedMethod ? selectedMethod.name : null,
      };
      const res = await fetch(`/api/journals?id=${editingJournal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        message.success("Cập nhật nhật ký thành công!");
        await fetchJournals();
        editJournalForm.resetFields();
        setEditSelectedConditions({});
        setEditSelectedMethodId(undefined);
        setEditFormStepsChecked([]);
        setIsEditJournalOpen(false);
        setEditingJournal(null);
      } else {
        message.error("Lỗi máy chủ khi cập nhật nhật ký!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi cập nhật nhật ký!");
    }
  };

  const handleDeleteJournal = async (id: string) => {
    try {
      const res = await fetch(`/api/journals?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Đã xóa nhật ký khỏi database.");
        await fetchJournals();
      } else {
        message.error("Lỗi máy chủ khi xóa nhật ký!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi gửi yêu cầu xóa!");
    }
  };

  const handleUpdateNote = async (id: string, note: string) => {
    try {
      const res = await fetch(`/api/journals?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        message.success("Cập nhật ghi chú thành công!");
        await fetchJournals();
      } else {
        message.error("Lỗi máy chủ khi cập nhật ghi chú!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi cập nhật ghi chú!");
    }
  };

  const handleUpdateProfit = async (id: string, profit: number | null) => {
    try {
      const res = await fetch(`/api/journals?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profit }),
      });
      if (res.ok) {
        message.success("Cập nhật Lãi / Lỗ thành công!");
        await fetchJournals();
      } else {
        message.error("Lỗi máy chủ khi cập nhật Lãi / Lỗ!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi cập nhật Lãi / Lỗ!");
    }
  };


  const handleUpdateResult = async (id: string, result: "WIN" | "LOSE" | "DRAW" | null) => {
    try {
      const res = await fetch(`/api/journals?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });
      if (res.ok) {
        message.success("Cập nhật kết quả thành công!");
        await fetchJournals();
      } else {
        message.error("Lỗi máy chủ khi cập nhật kết quả!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi cập nhật kết quả!");
    }
  };

  const handleUpdateDirection = async (id: string, direction: "BUY" | "SELL") => {
    try {
      const res = await fetch(`/api/journals?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (res.ok) {
        message.success("Cập nhật hướng thành công!");
        await fetchJournals();
      } else {
        message.error("Lỗi máy chủ khi cập nhật hướng!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối khi cập nhật hướng!");
    }
  };

  // ---- STATE HELPERS ----
  const handleCheckboxChange = (condId: string, checked: boolean) => {
    setSelectedConditions((prev) => ({
      ...prev,
      [condId]: { ...prev[condId], checked },
    }));
    // Auto-expand card khi chọn checkbox
    if (checked) {
      setExpandedCardIds((prev) => new Set(prev).add(condId));
    }
  };

  const handleEditCheckboxChange = (condId: string, checked: boolean) => {
    setEditSelectedConditions((prev) => ({
      ...prev,
      [condId]: { ...prev[condId], checked },
    }));
    // Auto-expand khi check
    if (checked) {
      setExpandedEditCardIds((prev) => new Set(prev).add(condId));
    }
  };

  const toggleExpandCard = (condId: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(condId)) next.delete(condId);
      else next.add(condId);
      return next;
    });
  };

  const toggleExpandEditCard = (condId: string) => {
    setExpandedEditCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(condId)) next.delete(condId);
      else next.add(condId);
      return next;
    });
  };

  // Toggle multi-select timeframes for CREATE modal
  const handleTimeframeToggle = (condId: string, tf: keyof TimeframeScores) => {
    setSelectedConditions((prev) => {
      const cur = prev[condId]?.selectedTimeframes ?? ["H1"];
      const has = cur.includes(tf);
      const next = has ? cur.filter((t) => t !== tf) : [...cur, tf];
      return {
        ...prev,
        [condId]: { ...prev[condId], selectedTimeframes: next.length > 0 ? next : [tf] },
      };
    });
  };

  // Toggle multi-select timeframes for EDIT modal
  const handleEditTimeframeToggle = (condId: string, tf: keyof TimeframeScores) => {
    setEditSelectedConditions((prev) => {
      const cur = prev[condId]?.selectedTimeframes ?? ["H1"];
      const has = cur.includes(tf);
      const next = has ? cur.filter((t) => t !== tf) : [...cur, tf];
      return {
        ...prev,
        [condId]: { ...prev[condId], selectedTimeframes: next.length > 0 ? next : [tf] },
      };
    });
  };

  const handleSubCondCheck = (condId: string, subId: string, checked: boolean) => {
    setSelectedConditions((prev) => {
      const current = prev[condId]?.checkedSubConditions ?? [];
      const updated = checked
        ? [...current, subId]
        : current.filter((id) => id !== subId);
      return { ...prev, [condId]: { ...prev[condId], checkedSubConditions: updated } };
    });
  };

  const handleEditSubCondCheck = (condId: string, subId: string, checked: boolean) => {
    setEditSelectedConditions((prev) => {
      const current = prev[condId]?.checkedSubConditions ?? [];
      const updated = checked
        ? [...current, subId]
        : current.filter((id) => id !== subId);
      return { ...prev, [condId]: { ...prev[condId], checkedSubConditions: updated } };
    });
  };

  // ---- SUB-CONDITION LIST EDITOR ----
  const addSubCond = (
    list: SubCondition[],
    setList: React.Dispatch<React.SetStateAction<SubCondition[]>>
  ) => setList([...list, { id: genId(), name: "", bonusPoints: 0 }]);

  const updateSubCond = (
    list: SubCondition[],
    setList: React.Dispatch<React.SetStateAction<SubCondition[]>>,
    idx: number,
    field: keyof SubCondition,
    value: any
  ) => setList(list.map((sc, i) => (i === idx ? { ...sc, [field]: value } : sc)));

  const removeSubCond = (
    list: SubCondition[],
    setList: React.Dispatch<React.SetStateAction<SubCondition[]>>,
    idx: number
  ) => setList(list.filter((_, i) => i !== idx));

  // Sub-condition editor UI (function, NOT a component defined inside render)
  const renderSubCondEditor = (
    list: SubCondition[],
    setList: React.Dispatch<React.SetStateAction<SubCondition[]>>
  ) => (
    <div className="mt-4">
      <hr className="border-gray-100 mb-3" />
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-800 text-xs uppercase tracking-wide">
          Điều kiện phụ (bonus điểm)
        </span>
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => addSubCond(list, setList)}
          className="rounded-lg text-cyan-600 border-cyan-300 hover:border-cyan-400"
        >
          Thêm
        </Button>
      </div>
      {list.length === 0 && (
        <p className="text-gray-400 text-xs italic">
          Không có điều kiện phụ. Bấm "Thêm" để tạo.
        </p>
      )}
      <div className="space-y-2">
        {list.map((sc, idx) => (
          <div key={sc.id} className="flex items-center gap-2">
            <Input
              placeholder="Tên điều kiện phụ (VD: Phân kỳ)"
              value={sc.name}
              onChange={(e) => updateSubCond(list, setList, idx, "name", e.target.value)}
              className="rounded-lg flex-1"
              size="small"
            />
            <InputNumber
              min={-100}
              max={100}
              controls={false}
              placeholder="điểm"
              value={sc.bonusPoints}
              onChange={(val) => updateSubCond(list, setList, idx, "bonusPoints", val ?? 0)}
              className="rounded-lg w-20"
              size="small"
            />
            <Button
              type="text"
              danger
              size="small"
              icon={<MinusCircleOutlined />}
              onClick={() => removeSubCond(list, setList, idx)}
              className="hover:bg-rose-50 rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );

  // ---- TABLE COLUMNS ----
  const conditionColumns = [
    {
      title: "Tên điều kiện",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Condition) => (
        <div>
          <span className="font-semibold text-gray-800">{text}</span>
          {record.subConditions && record.subConditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {record.subConditions.map((sc) => (
                <Tag key={sc.id} color="geekblue" className="text-xs rounded-md">
                  {sc.name} ({sc.bonusPoints > 0 ? "+" : ""}{sc.bonusPoints}đ)
                </Tag>
              ))}
            </div>
          )}
        </div>
      ),
    },
    { title: "M15", key: "M15", render: (_: any, r: Condition) => <span>{r.scores.M15}</span> },
    { title: "M30", key: "M30", render: (_: any, r: Condition) => <span>{r.scores.M30}</span> },
    { title: "H1", key: "H1", render: (_: any, r: Condition) => <span>{r.scores.H1}</span> },
    { title: "H2", key: "H2", render: (_: any, r: Condition) => <span>{r.scores.H2}</span> },
    { title: "H4", key: "H4", render: (_: any, r: Condition) => <span>{r.scores.H4}</span> },
    { title: "D1", key: "D1", render: (_: any, r: Condition) => <span>{r.scores.D1}</span> },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Condition) => (
        <div className="flex gap-2">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditCondition(record)}
            className="hover:bg-cyan-50 text-cyan-600 rounded-lg"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa điều kiện này không?"
            onConfirm={() => handleDeleteCondition(record.id)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ className: "bg-rose-500 hover:bg-rose-600 border-none" }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-rose-50 rounded-lg" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const journalColumns = [
    {
      title: "Cặp / Đồng",
      dataIndex: "symbol",
      key: "symbol",
      width: 100,
      render: (val: string | null) =>
        val ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
            {val}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      title: "Phương pháp",
      dataIndex: "methodName",
      key: "methodName",
      width: 140,
      render: (val: string | null) =>
        val ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-bold text-[10px] border border-cyan-100 uppercase tracking-wider">
            {val}
          </span>
        ) : (
          <span className="text-gray-400 italic text-[11px]">Không dùng</span>
        ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (text: string) => <span className="text-xs text-gray-600">{text}</span>,
    },
    {
      title: "Hướng",
      key: "direction",
      width: 110,
      render: (_: any, record: JournalEntry) => {
        const dirItems: MenuProps["items"] = [
          {
            key: "BUY",
            label: (
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                🟩 BUY
              </div>
            ),
          },
          {
            key: "SELL",
            label: (
              <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                🟥 SELL
              </div>
            ),
          },
        ];
        const isBuy = record.direction === "BUY";
        return (
          <Dropdown
            menu={{
              items: dirItems,
              selectedKeys: [record.direction],
              onClick: ({ key }) => {
                if (key !== record.direction) {
                  handleUpdateDirection(record.id, key as "BUY" | "SELL");
                }
              },
            }}
            trigger={["click"]}
          >
            <span
              className={`inline-flex whitespace-nowrap items-center gap-1 px-2 py-1 rounded-full font-bold text-xs cursor-pointer hover:opacity-80 transition-all select-none border ${isBuy
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-rose-50 text-rose-600 border-rose-200"
                }`}
            >
              {isBuy ? "🟩 BUY" : "🟥 SELL"}
              <DownOutlined className="text-[9px] opacity-60" />
            </span>
          </Dropdown>
        );
      },
    },
    {
      title: "Entry",
      dataIndex: "entry",
      key: "entry",
      width: 90,
      render: (val: number | null) => val != null ? <span className="font-medium text-gray-800">{val}</span> : <span className="text-gray-300">—</span>,
    },
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 90,
      render: (val: number | null) => val != null ? <span className="font-medium text-rose-500">{val}</span> : <span className="text-gray-300">—</span>,
    },
    {
      title: "TP",
      dataIndex: "tp",
      key: "tp",
      width: 90,
      render: (val: number | null) => val != null ? <span className="font-medium text-emerald-500">{val}</span> : <span className="text-gray-300">—</span>,
    },
    {
      title: "Vol",
      dataIndex: "vol",
      key: "vol",
      width: 70,
      render: (val: number | null) => val != null ? <span className="font-medium text-gray-700">{val}</span> : <span className="text-gray-300">—</span>,
    },
    {
      title: "Điểm",
      key: "score",
      width: 80,
      render: (_: any, record: JournalEntry) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-800 text-xs">
            {record.totalScore}/100
          </span>
          <span className="text-[10px] text-cyan-600 font-bold">
            ({Math.round(Math.min((record.totalScore / 100) * 100, 100))}%)
          </span>
        </div>
      ),
    },
    {
      title: "Nhận định",
      key: "assessment",
      width: 300,
      render: (_: any, record: JournalEntry) => {
        const pct = Math.round(Math.min((record.totalScore / 100) * 100, 100));
        const { advice, colorClass, bgClass, borderClass, emoji } = getAssessment(pct);

        const face =
          pct >= 90 ? "🤩"
            : pct >= 80 ? "😄"
              : pct >= 65 ? "🙂"
                : pct >= 25 ? "😐"
                  : record.totalScore > 0 ? "😢"
                    : "—";

        if (record.totalScore === 0 && !record.conditions?.length) {
          return <span className="text-gray-300 text-xs">—</span>;
        }

        return (
          <div className={`min-w-[200px] flex flex-col gap-1 px-2 py-1.5 rounded-xl border ${bgClass} ${borderClass}`}>
            <div className="flex items-center gap-1.5">
              <span className="text-xl leading-none">{face}</span>
              <span className={`text-[10px] font-black uppercase tracking-wide ${colorClass}`}>
                {emoji} {pct}%
              </span>
            </div>
            <div className={`text-[10px] font-semibold leading-snug ${colorClass} opacity-90`}>
              {advice}
            </div>
          </div>
        );
      },
    },
    {
      title: "Kết quả",
      key: "result",
      width: 160,
      render: (_: any, record: JournalEntry) => {
        const items: MenuProps["items"] = [
          {
            key: "PENDING",
            label: (
              <span className="font-bold text-amber-500">
                Đang chờ kết quả
              </span>
            ),
          },
          {
            key: "WIN",
            label: (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <TrophyOutlined /> Thắng (WIN)
              </span>
            ),
          },
          {
            key: "DRAW",
            label: (
              <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                <MinusCircleOutlined /> Hòa (DRAW)
              </span>
            ),
          },
          {
            key: "LOSE",
            label: (
              <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                <CloseCircleOutlined /> Thua (LOSE)
              </span>
            ),
          },
        ];

        const isPending = !record.result;

        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                const newResult = key === "PENDING" ? null : (key as "WIN" | "LOSE" | "DRAW");
                handleUpdateResult(record.id, newResult);
              },
            }}
            trigger={["click"]}
          >
            <div className="inline-flex items-center gap-1.5 cursor-pointer select-none w-max">
              {isPending ? (
                <span className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all">
                  {/* Pulse dot */}
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Đang chờ kết quả
                  <DownOutlined className="text-[9px] opacity-60" />
                </span>
              ) : record.result === "WIN" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all">
                  <TrophyOutlined /> Thắng (WIN)
                  <DownOutlined className="text-[9px] opacity-60" />
                </span>
              ) : record.result === "DRAW" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all">
                  <MinusCircleOutlined /> Hòa (DRAW)
                  <DownOutlined className="text-[9px] opacity-60" />
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all">
                  <CloseCircleOutlined /> Thua (LOSE)
                  <DownOutlined className="text-[9px] opacity-60" />
                </span>
              )}
            </div>
          </Dropdown>
        );
      },
    },
    {
      title: "Lãi / Lỗ",
      key: "profit",
      width: 120,
      render: (_: any, record: JournalEntry) => (
        <ProfitCell record={record} onSave={handleUpdateProfit} />
      ),
    },
    {
      title: "Ghi chú",
      key: "note",
      width: 250,
      render: (_: any, record: JournalEntry) => (
        <NoteCell record={record} onSave={handleUpdateNote} />
      ),
    },
    {
      title: "Điều kiện",
      dataIndex: "conditions",
      key: "conditions",
      width: 230,
      render: (conds: any[]) => <ConditionsCell conds={conds} />,
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_: any, record: JournalEntry) => (
        <div className="flex gap-1">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditJournal(record)}
            className="hover:bg-cyan-50 text-cyan-600 rounded-lg"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhật ký này không?"
            onConfirm={() => handleDeleteJournal(record.id)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ className: "bg-rose-500 hover:bg-rose-600 border-none" }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-rose-50 rounded-lg" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24, color: "0ce2e2ff" }} spin />;

  const [activeTab, setActiveTab] = useState("journals");
  const [statTimeRange, setStatTimeRange] = useState<"all" | "7d" | "30d" | "90d">("all");

  return (
    <div className="space-y-6">
      {/* ===== CARD 1: HỆ THỐNG NHẬT KÝ GIAO DỊCH ===== */}
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 ">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Nhật ký Giao dịch
            </h2>
            <p className="text-sm text-gray-400">
              Đánh giá chất lượng lệnh trước khi vào lệnh.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "conditions" && (
              <Button
                onClick={() => { condForm.resetFields(); setNewSubConds([]); setIsCondOpen(true); }}
                icon={<PlusOutlined />}
                className="!h-12 px-5 rounded-xl border border-gray-200 hover:border-cyan-400 hover:text-cyan-500 font-semibold transition-all duration-200 shadow-sm"
              >
                Tạo Điều Kiện
              </Button>
            )}
            {activeTab === "journals" && (
              <Button
                type="primary"
                onClick={() => setIsJournalOpen(true)}
                icon={<BookOutlined />}
                className="!h-12 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 border-none text-gray-900 font-semibold transition-all duration-200 shadow-sm shadow-cyan-100"
              >
                Tạo Nhật Ký
              </Button>
            )}
          </div>
        </div>

        {/* TABS: JOURNALS & CONDITIONS */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          style={{
            "--tab-active-color": "#06b6d4",
          } as React.CSSProperties}
          tabBarStyle={{
            marginBottom: 24,
            borderBottom: "2px solid #f0f0f0",
          }}
          items={[
            {
              key: "journals",
              label: (
                <span className="flex items-center gap-2 font-semibold px-1">
                  <InfoCircleOutlined />
                  Lịch sử Nhật ký Giao dịch
                </span>
              ),
              children: (
                <div>
                  {loadingJournals ? (
                    <div className="py-12 flex justify-center"><Spin indicator={antIcon} /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table
                        columns={journalColumns}
                        dataSource={journals}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        locale={{
                          emptyText: (
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description={<span className="text-gray-400 text-sm">Chưa có nhật ký nào. Nhấn <b>Tạo Nhật Ký</b>!</span>}
                            />
                          ),
                        }}
                      />
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "conditions",
              label: (
                <span className="flex items-center gap-2 font-semibold px-1">
                  <UnorderedListOutlined />
                  Danh sách Điều kiện
                </span>
              ),
              children: (
                <div>
                  {loadingConditions ? (
                    <div className="py-12 flex justify-center"><Spin indicator={antIcon} /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table
                        columns={conditionColumns}
                        dataSource={conditions}
                        rowKey="id"
                        pagination={false}
                        locale={{
                          emptyText: (
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description={<span className="text-gray-400 text-sm">Chưa có điều kiện nào. Nhấn <b>Tạo Điều Kiện</b>!</span>}
                            />
                          ),
                        }}
                      />
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* ===== CARD 2: THỐNG KÊ HIỆU SUẤT THẮNG/THUA ===== */}
      {(() => {
        // Helper to parse dates like "13/07/2026 18:27:30"
        const parseDateVN = (dateStr: string) => {
          try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) return d;
            const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (match) {
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1;
              const year = parseInt(match[3], 10);
              return new Date(year, month, day);
            }
          } catch (e) { }
          return null;
        };

        // ---- TIME FILTER ----
        const now = Date.now();
        const timeRanges: Record<string, number> = {
          all: 0,
          "7d": 7 * 24 * 3600 * 1000,
          "30d": 30 * 24 * 3600 * 1000,
          "90d": 90 * 24 * 3600 * 1000,
        };

        const filteredJournals = statTimeRange === "all"
          ? journals
          : journals.filter((j) => {
            const d = parseDateVN(j.createdAt);
            if (!d) return false;
            const ts = d.getTime();
            return now - ts <= timeRanges[statTimeRange];
          });

        // Resolve logs if they have a WIN/LOSE/DRAW result OR if profit is explicitly entered (non-zero)
        const resolved = filteredJournals.filter((j) =>
          j.result === "WIN" ||
          j.result === "LOSE" ||
          j.result === "DRAW" ||
          (j.profit !== null && j.profit !== undefined && Number(j.profit) !== 0)
        );

        const wins = resolved.filter((j) =>
          j.result === "WIN" ||
          (j.result !== "LOSE" && j.result !== "DRAW" && j.profit !== null && j.profit !== undefined && Number(j.profit) > 0)
        );

        const losses = resolved.filter((j) =>
          j.result === "LOSE" ||
          (j.result !== "WIN" && j.result !== "DRAW" && j.profit !== null && j.profit !== undefined && Number(j.profit) < 0)
        );

        const draws = resolved.filter((j) =>
          j.result === "DRAW" ||
          (j.result !== "WIN" && j.result !== "LOSE" && j.profit !== null && j.profit !== undefined && Number(j.profit) === 0)
        );

        const total = resolved.length;
        const winPct = total > 0 ? Math.round((wins.length / total) * 100) : 0;
        const losePct = total > 0 ? Math.round((losses.length / total) * 100) : 0;
        const drawPct = total > 0 ? 100 - winPct - losePct : 0;

        // Circle progress helper variables
        const r = 50;
        const cx = 70;
        const cy = 70;
        const circ = 2 * Math.PI * r;
        const winArc = (winPct / 100) * circ;
        const drawArc = (drawPct / 100) * circ;
        const loseArc = (losePct / 100) * circ;

        // Profits (safely cast to Number)
        const winsProfit = wins.reduce((acc, j) => acc + (Number(j.profit) || 0), 0);
        const lossesProfit = losses.reduce((acc, j) => acc + (Number(j.profit) || 0), 0);
        const drawsProfit = draws.reduce((acc, j) => acc + (Number(j.profit) || 0), 0);
        const netProfit = resolved.reduce((acc, j) => acc + (Number(j.profit) || 0), 0);

        // Per-symbol stats (wins, losses, draws, profit)
        const symbolMap: Record<string, { wins: number; losses: number; draws: number; profit: number }> = {};
        for (const j of resolved) {
          const sym = j.symbol || "Không rõ";
          if (!symbolMap[sym]) symbolMap[sym] = { wins: 0, losses: 0, draws: 0, profit: 0 };
          const pVal = Number(j.profit) || 0;
          const isWin = j.result === "WIN" || (j.result !== "LOSE" && j.result !== "DRAW" && pVal > 0);
          const isLose = j.result === "LOSE" || (j.result !== "WIN" && j.result !== "DRAW" && pVal < 0);
          if (isWin) symbolMap[sym].wins++;
          else if (isLose) symbolMap[sym].losses++;
          else symbolMap[sym].draws++;
          symbolMap[sym].profit += pVal;
        }

        const topSymbols = Object.entries(symbolMap)
          .map(([sym, d]) => ({ sym, total: d.wins + d.losses + d.draws, ...d }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        // Calendar Month logic
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); // 0-11
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0

        const dailyProfitMap: Record<number, number> = {};
        const dailyTradeCount: Record<number, number> = {};
        for (let d = 1; d <= daysInMonth; d++) {
          dailyProfitMap[d] = 0;
          dailyTradeCount[d] = 0;
        }

        for (const j of resolved) {
          const d = parseDateVN(j.createdAt);
          if (d && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            const dayNum = d.getDate();
            dailyProfitMap[dayNum] += (j.profit ?? 0);
            dailyTradeCount[dayNum]++;
          }
        }

        const isEmpty = total === 0;

        return (
          <Card
            className="rounded-2xl !mt-5"
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
            {/* ---- HEADER ---- */}
            <div
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ background: "linear-gradient(135deg, #f0fdfa 0%, #ecfeff 50%, #f0f9ff 100%)", borderBottom: "1px solid #e0f7fa" }}
            >
              <div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                  <span className="text-2xl">📊</span> Thống Kê Hiệu Suất
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Tỉ lệ thắng/thành, cặp tiền nổi bật và lịch lãi/lỗ</p>
              </div>
              {/* Time filter */}
              <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                {(["all", "7d", "30d", "90d"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setStatTimeRange(k)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${statTimeRange === k
                      ? "bg-cyan-400 text-gray-900 shadow-sm shadow-cyan-100"
                      : "text-gray-400 hover:text-gray-600"
                      }`}
                  >
                    {k === "all" ? "Tất cả" : k === "7d" ? "7 ngày" : k === "30d" ? "30 ngày" : "3 tháng"}
                  </button>
                ))}
              </div>
            </div>

            {isEmpty ? (
              /* ---- EMPTY STATE ---- */
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <span className="text-5xl">📋</span>
                <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                  Chưa có nhật ký nào với kết quả WIN/LOSE/DRAW.<br />
                  Hãy thêm lệnh và đánh dấu kết quả để xem thống kê.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Column 1: Donut Chart (Winrate 3/12) */}
                  <Card
                    className="lg:col-span-3 w-full rounded-xl"
                    styles={{
                      body: {
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        height: "100%",
                      },
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #f0f0f0",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.14)",
                    }}
                  >
                    <div className="relative">
                      <svg width={130} height={130} viewBox="0 0 140 140">
                        {/* Background circle */}
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={16} />
                        {/* Lose arc */}
                        <circle
                          cx={cx} cy={cy} r={r} fill="none"
                          stroke="#fda4af"
                          strokeWidth={16}
                          strokeDasharray={`${loseArc} ${circ}`}
                          strokeDashoffset={-(winArc + drawArc)}
                          strokeLinecap="round"
                          style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray 0.8s ease" }}
                        />
                        {/* Draw arc */}
                        <circle
                          cx={cx} cy={cy} r={r} fill="none"
                          stroke="#cbd5e1"
                          strokeWidth={16}
                          strokeDasharray={`${drawArc} ${circ}`}
                          strokeDashoffset={-winArc}
                          strokeLinecap="round"
                          style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray 0.8s ease" }}
                        />
                        {/* Win arc */}
                        <circle
                          cx={cx} cy={cy} r={r} fill="none"
                          stroke="#34d399"
                          strokeWidth={16}
                          strokeDasharray={`${winArc} ${circ}`}
                          strokeDashoffset={0}
                          strokeLinecap="round"
                          style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray 0.8s ease" }}
                        />
                        {/* Center text */}
                        <text x={cx} y={cy - 6} textAnchor="middle" className="font-black" style={{ fontSize: 24, fontWeight: 900, fill: winPct >= 50 ? "#059669" : "#e11d48" }}>
                          {winPct}%
                        </text>
                        <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 10, fill: "#9ca3af", fontWeight: 600 }}>
                          WIN RATE
                        </text>
                      </svg>
                    </div>
                    {/* Legend */}
                    <div className="flex gap-2 text-[9px] font-bold">
                      <span className="flex items-center gap-0.5 text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> WIN ({winPct}%)
                      </span>
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> HÒA ({drawPct}%)
                      </span>
                      <span className="flex items-center gap-0.5 text-rose-500">
                        <span className="w-2 h-2 rounded-full bg-rose-300 inline-block" /> LOSE ({losePct}%)
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium text-center">{total} lệnh đã kết thúc</span>
                  </Card>

                  {/* Column 2: Top Cặp Giao Dịch & Stats (5/12) */}
                  <Card
                    className="lg:col-span-5 w-full flex flex-col justify-between rounded-xl"
                    styles={{
                      body: {
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "100%",
                      },
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #f0f0f0",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.14)",
                    }}
                  >
                    <div className="text-sm sm:text-base font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-gray-200 pb-2">
                      <span>📊 Top Cặp & Hiệu Suất</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch flex-1 mt-1">
                      {/* Left: Top Symbols */}
                      <div className="space-y-2 flex flex-col justify-center">
                        <div className="text-xs sm:text-sm font-extrabold text-gray-600 uppercase tracking-wide mb-1">Cặp giao dịch nổi bật</div>
                        {topSymbols.length > 0 ? (
                          topSymbols.map(({ sym, wins: w, losses: l, draws: dr, total: t, profit: p }) => {
                            const symWinPct = t > 0 ? (w / t) * 100 : 0;
                            const symDrawPct = t > 0 ? (dr / t) * 100 : 0;
                            const symLosePct = t > 0 ? 100 - symWinPct - symDrawPct : 0;
                            const isPos = p > 0;
                            const isNeg = p < 0;
                            return (
                              <div key={sym} className="flex flex-col gap-0.5">
                                <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-800">
                                  <span className="truncate max-w-[140px]">{sym}</span>
                                  <span className={`font-black ${isPos ? "text-emerald-600" : isNeg ? "text-rose-500" : "text-gray-500"}`}>
                                    {isPos ? "+" : ""}{p.toFixed(1)}$
                                  </span>
                                </div>
                                <div className="flex h-4.5 rounded-full overflow-hidden bg-gray-100 gap-0.5 shadow-inner">
                                  <div
                                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-end pr-0.5 transition-all duration-700"
                                    style={{ width: `${symWinPct}%`, minWidth: w > 0 ? "8px" : "0px" }}
                                    title={`${w} thắng`}
                                  >
                                    <span className="text-[14px] font-black text-white leading-none">{w}</span>
                                  </div>
                                  <div
                                    className="bg-gradient-to-r from-slate-300 to-slate-400 flex items-center justify-center transition-all duration-700"
                                    style={{ width: `${symDrawPct}%`, minWidth: dr > 0 ? "8px" : "0px" }}
                                    title={`${dr} hòa`}
                                  >
                                    <span className="text-[14px] font-black text-white leading-none">{dr}</span>
                                  </div>
                                  <div
                                    className="bg-gradient-to-r from-rose-300 to-rose-400 flex items-center justify-start pl-0.5 transition-all duration-700"
                                    style={{ width: `${symLosePct}%`, minWidth: l > 0 ? "8px" : "0px" }}
                                    title={`${l} thua`}
                                  >
                                    <span className="text-[14px] font-black text-white leading-none">{l}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-gray-400 text-sm italic py-4">Chưa có giao dịch</div>
                        )}
                      </div>

                      {/* Right: Stats Stack */}
                      <div className="flex flex-col gap-2 justify-center">
                        {/* WIN count */}
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-2 flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wide">🏆 Lệnh Thắng</span>
                            <span className="text-base font-black text-emerald-600 mt-0.5">{wins.length} lệnh</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded">+{winPct}%</span>
                            <span className="text-sm font-black text-emerald-600 mt-0.5">+{winsProfit.toFixed(1)}$</span>
                          </div>
                        </div>

                        {/* DRAW count */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-2 flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">🤝 Lệnh Hòa</span>
                            <span className="text-base font-black text-slate-500 mt-0.5">{draws.length} lệnh</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded">+{drawPct}%</span>
                            <span className="text-sm font-black text-slate-500 mt-0.5">{drawsProfit >= 0 ? "+" : ""}{drawsProfit.toFixed(1)}$</span>
                          </div>
                        </div>

                        {/* LOSE count */}
                        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-2 flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-rose-500 uppercase tracking-wide">💔 Lệnh Thua</span>
                            <span className="text-base font-black text-rose-500 mt-0.5">{losses.length} lệnh</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-rose-600 bg-rose-100/80 px-1.5 py-0.5 rounded">-{losePct}%</span>
                            <span className="text-sm font-black text-rose-500 mt-0.5">{lossesProfit.toFixed(1)}$</span>
                          </div>
                        </div>

                        {/* Net Profit */}
                        <div className={`rounded-xl border p-2 flex items-center justify-between gap-2 ${netProfit >= 0 ? "border-cyan-100 bg-cyan-50/40" : "border-rose-100 bg-rose-50/30"}`}>
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">💰 Lợi Nhuận Net</span>
                            <span className={`text-base font-black ${netProfit >= 0 ? "text-cyan-600" : "text-rose-500"} mt-0.5`}>
                              {netProfit >= 0 ? "+" : ""}{netProfit.toFixed(1)}$
                            </span>
                          </div>
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${netProfit >= 0 ? "bg-cyan-100/80 text-cyan-700" : "bg-rose-100 text-rose-600"}`}>
                            Tổng
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Column 3: Profit Calendar (4/12) */}
                  <Card
                    className="lg:col-span-4 flex flex-col rounded-xl"
                    styles={{
                      body: {
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      },
                    }}
                    style={{
                      border: "none",
                      boxShadow:
                        "0 4px 8px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.14)",
                    }}
                  >
                    <div className="text-sm sm:text-base font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>📅 Lịch Lợi Nhuận (Tháng {currentMonth + 1}/{currentYear})</span>
                      <span className={`text-sm font-black ${netProfit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        Tháng: {netProfit >= 0 ? "+" : ""}{netProfit.toFixed(1)}$
                      </span>
                    </div>
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-gray-500 mb-2">
                      <div>T2</div>
                      <div>T3</div>
                      <div>T4</div>
                      <div>T5</div>
                      <div>T6</div>
                      <div>T7</div>
                      <div className="text-rose-400">CN</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 flex-1">
                      {/* Placeholders for firstDayIndex */}
                      {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-gray-50/30 rounded-lg min-h-[56px]" />
                      ))}
                      {/* Actual days */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dayProfit = dailyProfitMap[dayNum];
                        const count = dailyTradeCount[dayNum];
                        const hasProfit = dayProfit !== 0;
                        const isPos = dayProfit > 0;
                        const isNeg = dayProfit < 0;

                        return (
                          <div
                            key={`day-${dayNum}`}
                            title={`Ngày ${dayNum}: ${count} lệnh, Lợi nhuận: ${dayProfit.toFixed(1)}$`}
                            className={`min-h-[56px] p-1 flex flex-col justify-between items-center rounded-lg border text-[10px] transition-all cursor-pointer ${hasProfit
                              ? isPos
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200"
                              : count > 0
                                ? "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                              }`}
                          >
                            <span className="font-bold block self-start leading-none text-xs">
                              {dayNum}
                            </span>

                            {hasProfit ? (
                              <span
                                className={`font-black text-[15px] leading-none ${isPos ? "text-emerald-500" : "text-rose-700"
                                  }`}
                              >
                                {isPos ? "+" : ""}
                                {Math.round(dayProfit)}
                              </span>
                            ) : count > 0 ? (
                              <span className="text-[10px] text-gray-400 leading-none">0$</span>
                            ) : (
                              <span className="h-3" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            )
            }
          </Card>
        );
      })()}


      <Modal
        title={<span className="text-lg font-black text-gray-800">➕ Tạo Điều Kiện Giao Dịch Mới</span>}
        open={isCondOpen}
        onCancel={() => { condForm.resetFields(); setNewSubConds([]); setIsCondOpen(false); }}
        footer={null}
        centered
        width={480}
        styles={{ body: { paddingTop: 16, maxHeight: "80vh", overflowY: "auto" } }}
      >
        <Form
          form={condForm}
          layout="vertical"
          onFinish={handleSaveCondition}
          initialValues={{ M15: 0, M30: 0, H1: 0, H2: 0, H4: 0, D1: 0 }}
        >
          <Form.Item
            name="name"
            label={<span className="font-bold text-gray-700">Tên điều kiện</span>}
            rules={[{ required: true, message: "Vui lòng nhập tên điều kiện!" }]}
          >
            <Input placeholder="Ví dụ: RSI, FVG, Pinbar..." className="rounded-lg py-2" />
          </Form.Item>

          <div className="mt-2">
            <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
              Bảng chấm điểm theo Khung thời gian (0 - 10)
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {TIMEFRAMES.map((tf) => (
                <Form.Item
                  key={tf}
                  name={tf}
                  label={<span className="font-semibold text-gray-500">Khung {tf}</span>}
                >
                  <InputNumber min={-20} max={20} style={{ width: "100%" }} className="rounded-lg" />
                </Form.Item>
              ))}
            </div>
          </div>

          {renderSubCondEditor(newSubConds, setNewSubConds)}

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Button onClick={() => { condForm.resetFields(); setNewSubConds([]); setIsCondOpen(false); }} className="rounded-xl px-5 h-10 font-semibold">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" className="rounded-xl px-6 h-10 bg-cyan-400 hover:bg-cyan-500 border-none text-gray-900 font-semibold">
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ===== MODAL SỬA ĐIỀU KIỆN ===== */}
      <Modal
        title={<span className="text-lg font-black text-gray-800">✏️ Sửa Điều Kiện</span>}
        open={isEditCondOpen}
        onCancel={() => { editCondForm.resetFields(); setEditSubConds([]); setIsEditCondOpen(false); setEditingCondition(null); }}
        footer={null}
        centered
        width={480}
        styles={{ body: { paddingTop: 16, maxHeight: "80vh", overflowY: "auto" } }}
      >
        <Form form={editCondForm} layout="vertical" onFinish={handleUpdateCondition}>
          <Form.Item
            name="name"
            label={<span className="font-bold text-gray-700">Tên điều kiện</span>}
            rules={[{ required: true, message: "Vui lòng nhập tên điều kiện!" }]}
          >
            <Input className="rounded-lg py-2" />
          </Form.Item>

          <div className="mt-2">
            <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
              Bảng chấm điểm theo Khung thời gian (0 - 10)
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {TIMEFRAMES.map((tf) => (
                <Form.Item
                  key={tf}
                  name={tf}
                  label={<span className="font-semibold text-gray-500">Khung {tf}</span>}
                >
                  <InputNumber min={-20} max={20} style={{ width: "100%" }} className="rounded-lg" />
                </Form.Item>
              ))}
            </div>
          </div>

          {renderSubCondEditor(editSubConds, setEditSubConds)}

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Button onClick={() => { editCondForm.resetFields(); setEditSubConds([]); setIsEditCondOpen(false); setEditingCondition(null); }} className="rounded-xl px-5 h-10 font-semibold">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" className="rounded-xl px-6 h-10 bg-cyan-400 hover:bg-cyan-500 border-none text-gray-900 font-semibold">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ===== MODAL TẠO NHẬT KÝ ===== */}
      <Modal
        title={<span className="text-lg font-black text-gray-800">📒Nhật Ký Giao Dịch</span>}
        open={isJournalOpen}
        onCancel={() => setIsJournalOpen(false)}
        footer={null}
        centered
        width={860}
        styles={{ body: { paddingTop: 16, maxHeight: "86vh", overflowY: "hidden", padding: 0 } }}
      >
        <Form form={journalForm} layout="vertical" onFinish={handleSaveJournal} initialValues={{ direction: "BUY" }}>
          <div className="flex" style={{ minHeight: 480 }}>
            {/* ===== LEFT: FORM CONTENT ===== */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: "82vh", padding: "20px 20px 20px 24px" }}>
              {/* Symbol + Direction row */}
              <div className="flex gap-3 items-end">
                <Form.Item
                  name="symbol"
                  label={<span className="font-bold text-gray-700">Cặp / Đồng giao dịch</span>}
                  className="flex-1 mb-0  cursor-pointer"
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Chọn cặp tiền / đồng..."
                    optionFilterProp="label"
                    className="w-full"
                    popupMatchSelectWidth={false}
                    style={{ height: 40, cursor: 'pointer' }}
                    options={FOREX_SYMBOL_GROUPS.map((group) => ({
                      label: (
                        <span className="font-bold text-base text-cyan-600">
                          {group.label}
                        </span>
                      ),
                      options: group.options.map((sym) => ({
                        label: sym,
                        value: sym,
                      })),
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name="direction"
                  label={<span className="font-bold text-gray-700">Hướng</span>}
                  className="mb-0"
                  style={{ flexShrink: 0 }}
                >
                  <Radio.Group className="flex gap-2">
                    <Radio.Button value="BUY" className="h-10 leading-[38px] rounded-xl font-bold border-gray-200 px-5">
                      🟩 BUY
                    </Radio.Button>
                    <Radio.Button value="SELL" className="h-10 leading-[38px] rounded-xl font-bold border-gray-200 px-5">
                      🟥 SELL
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </div>

              {/* Chọn Phương pháp Giao dịch */}
              <div className="">
                <Form.Item
                  name="methodId"
                  label={<span className="font-bold text-gray-700">Phương pháp sử dụng (Quy trình)</span>}
                  className="mb-0"
                >
                  <Select
                    placeholder="Chọn phương pháp để kích hoạt quy trình vào lệnh..."
                    className="w-full"
                    allowClear
                    onChange={handleMethodChange}
                    options={methods.map((m) => ({
                      label: m.name,
                      value: m.id,
                    }))}
                  />
                </Form.Item>
              </div>

              {/* Checklist Quy trình thực hiện */}
              {selectedMethodId && (() => {
                const method = methods.find((m) => m.id === selectedMethodId);
                if (!method || !method.steps || method.steps.length === 0) return null;
                return (
                  <div className="mt-4 p-4 rounded-xl bg-cyan-50/20 border border-cyan-100/50">
                    <label className="block font-bold text-cyan-800 text-xs uppercase tracking-wider mb-3">
                      📋 Checklist quy trình bắt buộc ({formStepsChecked.filter(Boolean).length}/{method.steps.length})
                    </label>
                    <div className="space-y-2.5">
                      {method.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <Checkbox
                            checked={formStepsChecked[idx] || false}
                            onChange={(e) => {
                              const updated = [...formStepsChecked];
                              updated[idx] = e.target.checked;
                              setFormStepsChecked(updated);
                            }}
                            className="font-medium text-xs text-gray-700 select-none items-start flex"
                          >
                            <span className="font-bold text-cyan-600 mr-1 shrink-0">Bước {idx + 1}:</span>
                            <span className="leading-snug">{step}</span>
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}



              <div className="mt-4">
                <label className="block font-bold text-gray-700 mb-3">Danh sách điều kiện</label>
                {loadingConditions ? (
                  <div className="py-8 flex justify-center"><Spin indicator={antIcon} /></div>
                ) : conditions.length === 0 ? (
                  <div className="py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                    <span className="text-gray-400 text-sm">Chưa có điều kiện nào. Vui lòng tạo điều kiện trước.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conditions.map((cond) => {
                      const state = selectedConditions[cond.id] ?? {
                        checked: false,
                        selectedTimeframes: ["H1"] as (keyof TimeframeScores)[],
                        checkedSubConditions: [],
                      };
                      const isSelected = state.checked;
                      const activeTimeframes = state.selectedTimeframes ?? ["H1"];
                      const isExpanded = expandedCardIds.has(cond.id);
                      const score = calcCondScore(cond, state);

                      return (
                        <div
                          key={cond.id}
                          className={`border rounded-xl transition-all duration-200 bg-white ${isSelected ? "border-cyan-300 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <div
                            className="flex items-center justify-between px-4 py-1 cursor-pointer"
                            onClick={() => toggleExpandCard(cond.id)}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) => handleCheckboxChange(cond.id, e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="font-bold text-gray-700 text-sm select-none">{cond.name}</span>
                              {isSelected && (
                                <span className="text-cyan-600 font-extrabold text-xs ml-auto">+{score}đ</span>
                              )}
                            </div>
                            <Button
                              type="text"
                              shape="circle"
                              icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                              className="text-gray-400 hover:text-cyan-500 flex items-center justify-center"
                              onClick={() => toggleExpandCard(cond.id)}
                            />
                          </div>

                          <div
                            className={`overflow-hidden transition-all duration-200 ease-in-out px-4 ${isExpanded ? "max-h-96 pb-4 opacity-100 border-t border-gray-50 pt-3" : "max-h-0 opacity-0"}`}
                          >
                            <div className="space-y-3">
                              {/* Timeframe multi-select */}
                              <div>
                                <span className="text-xs font-bold text-gray-400 block mb-1.5 uppercase">Chọn khung thời gian (chọn nhiều):</span>
                                <div className={`flex flex-wrap gap-1 ${!isSelected ? "opacity-40 pointer-events-none" : ""}`}>
                                  {TIMEFRAMES.map((tf) => {
                                    const isActive = activeTimeframes.includes(tf);
                                    return (
                                      <button
                                        key={tf}
                                        type="button"
                                        onClick={() => handleTimeframeToggle(cond.id, tf)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all duration-150 ${isActive
                                          ? "bg-cyan-400 text-gray-900 border-cyan-400 shadow-sm"
                                          : "bg-white text-gray-500 border-gray-200 hover:border-cyan-300 hover:text-cyan-600"
                                          }`}
                                      >
                                        {tf}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Sub-conditions */}
                              {cond.subConditions && cond.subConditions.length > 0 && (
                                <div>
                                  <span className="text-xs font-bold text-gray-400 block mb-1.5 uppercase">Điều kiện phụ:</span>
                                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                    {cond.subConditions.map((sc) => {
                                      const subChecked = state.checkedSubConditions.includes(sc.id);
                                      return (
                                        <label
                                          key={sc.id}
                                          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${subChecked ? "bg-indigo-50 border border-indigo-200" : "bg-gray-50 border border-gray-100 hover:border-gray-200"} ${!isSelected ? "opacity-40 pointer-events-none" : ""}`}
                                        >
                                          <Checkbox
                                            checked={subChecked}
                                            disabled={!isSelected}
                                            onChange={(e) => handleSubCondCheck(cond.id, sc.id, e.target.checked)}
                                          />
                                          <span className="text-sm text-gray-700 flex-1">{sc.name}</span>
                                          <span className={`text-xs font-bold ${subChecked ? "text-indigo-600" : "text-gray-400"}`}>
                                            +{sc.bonusPoints}đ
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Score */}
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-gray-400">Điểm thu được (gốc + phụ):</span>
                                <span className={isSelected ? "text-cyan-600 font-extrabold" : "text-gray-400"}>
                                  {score} điểm
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Entry / SL / TP / Vol */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wide">
                  Thông tin lệnh
                </h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <Form.Item name="entry" label={<span className="font-semibold text-gray-500">Entry</span>}>
                    <InputNumber placeholder="Giá vào" style={{ width: "100%" }} className="rounded-lg" />
                  </Form.Item>
                  <Form.Item name="vol" label={<span className="font-semibold text-gray-500">Vol (Khối lượng)</span>}>
                    <InputNumber placeholder="0.01" min={0.01} step={0.01} style={{ width: "100%" }} className="rounded-lg" />
                  </Form.Item>
                  <Form.Item name="sl" label={<span className="font-semibold text-gray-500">SL (Stop Loss)</span>}>
                    <InputNumber placeholder="Stop Loss" style={{ width: "100%" }} className="rounded-lg" />
                  </Form.Item>
                  <Form.Item name="tp" label={<span className="font-semibold text-gray-500">TP (Take Profit)</span>}>
                    <InputNumber placeholder="Take Profit" style={{ width: "100%" }} className="rounded-lg" />
                  </Form.Item>
                </div>
                <Form.Item name="note" label={<span className="font-semibold text-gray-500">Ghi chú</span>}>
                  <RichTextEditor placeholder="Ghi chú thêm về lệnh này..." minHeight="160px" />
                </Form.Item>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => setIsJournalOpen(false)}
                  className="flex-1 rounded-xl h-11 font-semibold border-gray-200 hover:border-cyan-400 hover:text-cyan-500"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="flex-1 rounded-xl h-11 bg-cyan-400 hover:bg-cyan-500 border-none text-gray-900 font-black shadow-md shadow-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaveDisabled}
                >
                  Lưu Nhật Ký
                </Button>
              </div>
            </div>

            {/* ===== RIGHT: ADVICE PANEL ===== */}
            {(() => {
              const hasDirection = direction === "BUY" || direction === "SELL";
              const hasCondition = selectedCount > 0;
              const { stars, advice, colorClass, bgClass, borderClass, emoji } = getAssessment(progressPercent);

              // Determine face expression based on score %
              const faceMood: { face: string; label: string; faceSize: string } =
                progressPercent >= 90
                  ? { face: "🤩", label: "Tuyệt vời!", faceSize: "text-[72px]" }
                  : progressPercent >= 80
                    ? { face: "😄", label: "Rất tốt!", faceSize: "text-[68px]" }
                    : progressPercent >= 65
                      ? { face: "🙂", label: "Ổn áp", faceSize: "text-[64px]" }
                      : progressPercent >= 25
                        ? { face: "😐", label: "Cẩn thận - Đi vol bé", faceSize: "text-[60px]" }
                        : selectedCount > 0
                          ? { face: "😢", label: "Nguy hiểm!", faceSize: "text-[60px]" }
                          : { face: "🤔", label: "Đang chờ...", faceSize: "text-[56px]" };

              return (
                <div
                  className={`w-64 flex-shrink-0 border-l border-gray-100 flex flex-col transition-all duration-500 ${hasCondition ? bgClass : "bg-gray-50/60"}`}
                  style={{ padding: "24px 20px", position: "sticky", top: 0 }}
                >
                  {/* Header */}
                  <div className="mb-4">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">📊 Nhận định & Lời khuyên</span>
                  </div>

                  {/* Emotional face */}
                  <div className="flex flex-col items-center justify-center mb-5">
                    <span
                      className={`${faceMood.faceSize} leading-none transition-all duration-500 drop-shadow-sm`}
                      style={{ filter: hasCondition ? "none" : "grayscale(0.6) opacity(0.5)", lineHeight: 1.1 }}
                    >
                      {faceMood.face}
                    </span>
                    <span className={`mt-2 text-xs font-extrabold uppercase tracking-wide ${hasCondition ? colorClass : "text-gray-400"}`}>
                      {faceMood.label}
                    </span>
                  </div>

                  {/* Tổng điểm */}
                  <div className={`rounded-xl p-3 mb-4 border text-center transition-all duration-300 ${hasCondition ? borderClass + " bg-white/70" : "border-gray-200 bg-white/40"}`}>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tổng điểm</div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-3xl font-black transition-all duration-300 ${hasCondition ? colorClass : "text-gray-300"}`}>
                        {currentTotalScore}
                      </span>
                      <span className="text-sm font-bold text-gray-400">/ 100</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressPercent >= 80 ? "bg-emerald-400" :
                          progressPercent >= 65 ? "bg-cyan-400" :
                            progressPercent >= 25 ? "bg-amber-400" : "bg-rose-400"
                          }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    {hasCondition && (
                      <div className={`text-xs font-black mt-1 ${colorClass}`}>
                        {progressPercent}%
                      </div>
                    )}
                  </div>

                  {/* Stars */}
                  {hasCondition && (
                    <div className="flex justify-center mb-4">
                      <Rate disabled allowHalf value={getAssessment(progressPercent).stars} className="text-amber-400" style={{ fontSize: 18 }} />
                    </div>
                  )}

                  {/* Advice text */}
                  {hasDirection && hasCondition ? (
                    <div className={`rounded-xl p-3 border ${borderClass} bg-white/60 transition-all duration-300 flex-1`}>
                      <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        {emoji} Lời khuyên
                      </div>
                      <div className={`text-xs font-bold leading-relaxed ${colorClass}`}>
                        {advice}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl p-3 border border-dashed border-gray-200 bg-white/40 flex-1 flex flex-col items-center justify-center text-center gap-2">
                      <span className="text-2xl">💡</span>
                      <span className="text-xs text-gray-400 leading-relaxed">
                        Chọn hướng và điều kiện để nhận lời khuyên
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </Form>
      </Modal>

      {/* ===== MODAL SỬA NHẬT KÝ ===== */}
      <Modal
        title={<span className="text-lg font-black text-gray-800">✏️ Sửa Nhật Ký Giao Dịch</span>}
        open={isEditJournalOpen}
        onCancel={() => {
          editJournalForm.resetFields();
          setEditSelectedConditions({});
          setEditSelectedMethodId(undefined);
          setEditFormStepsChecked([]);
          setExpandedEditCardIds(new Set());
          setIsEditJournalOpen(false);
          setEditingJournal(null);
        }}
        footer={null}
        centered
        width={860}
        styles={{ body: { paddingTop: 16, maxHeight: "86vh", overflowY: "hidden", padding: 0 } }}
      >
        <Form form={editJournalForm} layout="vertical" onFinish={handleUpdateJournal}>
          <div className="flex" style={{ minHeight: 480 }}>

            {/* ===== LEFT: FORM CONTENT ===== */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: "82vh", padding: "20px 20px 20px 24px" }}>

              {/* Symbol + Direction row */}
              <div className="flex gap-3 items-end mb-4">
                <Form.Item
                  name="symbol"
                  label={<span className="font-bold text-gray-700">Cặp / Đồng giao dịch</span>}
                  className="flex-1 mb-0"
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Chọn cặp tiền / đồng..."
                    optionFilterProp="label"
                    className="w-full"
                    popupMatchSelectWidth={false}
                    style={{ height: 40 }}
                    options={FOREX_SYMBOL_GROUPS.map((group) => ({
                      label: (
                        <span className="font-bold text-base text-cyan-600">
                          {group.label}
                        </span>
                      ),
                      options: group.options.map((sym) => ({
                        label: sym,
                        value: sym,
                      })),
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name="direction"
                  label={<span className="font-bold text-gray-700">Hướng</span>}
                  className="mb-0"
                  style={{ flexShrink: 0 }}
                >
                  <Radio.Group className="flex gap-2">
                    <Radio.Button value="BUY" className="h-10 leading-[38px] rounded-xl font-bold border-gray-200 px-5">
                      🟩 BUY
                    </Radio.Button>
                    <Radio.Button value="SELL" className="h-10 leading-[38px] rounded-xl font-bold border-gray-200 px-5">
                      🟥 SELL
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </div>

              {/* Chọn Phương pháp Giao dịch (Edit) */}
              <div>
                <Form.Item
                  name="methodId"
                  label={<span className="font-bold text-gray-700">Phương pháp sử dụng (Quy trình)</span>}
                  className="mb-0"
                >
                  <Select
                    placeholder="Chọn phương pháp để kích hoạt quy trình vào lệnh..."
                    className="w-full"
                    allowClear
                    onChange={handleEditMethodChange}
                    options={methods.map((m) => ({
                      label: m.name,
                      value: m.id,
                    }))}
                  />
                </Form.Item>
              </div>

              {/* Checklist Quy trình thực hiện (Edit) */}
              {editSelectedMethodId && (() => {
                const method = methods.find((m) => m.id === editSelectedMethodId);
                if (!method || !method.steps || method.steps.length === 0) return null;
                return (
                  <div className="mt-4 p-4 rounded-xl bg-cyan-50/20 border border-cyan-100/50">
                    <label className="block font-bold text-cyan-800 text-xs uppercase tracking-wider mb-3">
                      📋 Checklist quy trình bắt buộc ({editFormStepsChecked.filter(Boolean).length}/{method.steps.length})
                    </label>
                    <div className="space-y-2.5">
                      {method.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <Checkbox
                            checked={editFormStepsChecked[idx] || false}
                            onChange={(e) => {
                              const updated = [...editFormStepsChecked];
                              updated[idx] = e.target.checked;
                              setEditFormStepsChecked(updated);
                            }}
                            className="font-medium text-xs text-gray-700 select-none items-start flex"
                          >
                            <span className="font-bold text-cyan-600 mr-1 shrink-0">Bước {idx + 1}:</span>
                            <span className="leading-snug">{step}</span>
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Condition list */}
              <div className="mb-4">
                <label className="block font-bold text-gray-700 mb-3">Danh sách điều kiện</label>
                {loadingConditions ? (
                  <div className="py-8 flex justify-center"><Spin indicator={antIcon} /></div>
                ) : conditions.length === 0 ? (
                  <div className="py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                    <span className="text-gray-400 text-sm">Chưa có điều kiện nào.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conditions.map((cond) => {
                      const state = editSelectedConditions[cond.id] ?? {
                        checked: false,
                        selectedTimeframes: ["H1"] as (keyof TimeframeScores)[],
                        checkedSubConditions: [],
                      };
                      const isSelected = state.checked;
                      const activeTimeframes = state.selectedTimeframes ?? ["H1"];
                      const score = calcCondScore(cond, state);
                      const isExpanded = expandedEditCardIds.has(cond.id);

                      return (
                        <div
                          key={cond.id}
                          className={`border rounded-xl transition-all duration-200 bg-white ${isSelected ? "border-cyan-300 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <div
                            className="flex items-center justify-between px-4 py-1 cursor-pointer"
                            onClick={() => toggleExpandEditCard(cond.id)}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) => handleEditCheckboxChange(cond.id, e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="font-bold text-gray-700 text-sm select-none">{cond.name}</span>
                              {isSelected && (
                                <span className="text-cyan-600 font-extrabold text-xs ml-auto">+{score}đ</span>
                              )}
                            </div>
                            <Button
                              type="text"
                              shape="circle"
                              icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                              className="text-gray-400 hover:text-cyan-500 flex items-center justify-center"
                              onClick={() => toggleExpandEditCard(cond.id)}
                            />
                          </div>

                          <div
                            className={`overflow-hidden transition-all duration-200 ease-in-out px-4 ${isExpanded ? "max-h-96 pb-4 opacity-100 border-t border-gray-50 pt-3" : "max-h-0 opacity-0"}`}
                          >
                            <div className="space-y-3">
                              {/* Timeframe multi-select */}
                              <div>
                                <span className="text-xs font-bold text-gray-400 block mb-1.5 uppercase">Chọn khung thời gian (chọn nhiều):</span>
                                <div className={`flex flex-wrap gap-1 ${!isSelected ? "opacity-40 pointer-events-none" : ""}`}>
                                  {TIMEFRAMES.map((tf) => {
                                    const isActive = activeTimeframes.includes(tf);
                                    return (
                                      <button
                                        key={tf}
                                        type="button"
                                        onClick={() => handleEditTimeframeToggle(cond.id, tf)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all duration-150 ${isActive
                                          ? "bg-cyan-400 text-gray-900 border-cyan-400 shadow-sm"
                                          : "bg-white text-gray-500 border-gray-200 hover:border-cyan-300 hover:text-cyan-600"
                                          }`}
                                      >
                                        {tf}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Sub-conditions */}
                              {cond.subConditions && cond.subConditions.length > 0 && (
                                <div>
                                  <span className="text-xs font-bold text-gray-400 block mb-1.5 uppercase">Điều kiện phụ:</span>
                                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                    {cond.subConditions.map((sc) => {
                                      const subChecked = state.checkedSubConditions.includes(sc.id);
                                      return (
                                        <label
                                          key={sc.id}
                                          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${subChecked ? "bg-indigo-50 border border-indigo-200" : "bg-gray-50 border border-gray-100 hover:border-gray-200"} ${!isSelected ? "opacity-40 pointer-events-none" : ""}`}
                                        >
                                          <Checkbox
                                            checked={subChecked}
                                            disabled={!isSelected}
                                            onChange={(e) => handleEditSubCondCheck(cond.id, sc.id, e.target.checked)}
                                          />
                                          <span className="text-sm text-gray-700 flex-1">{sc.name}</span>
                                          <span className={`text-xs font-bold ${subChecked ? "text-indigo-600" : "text-gray-400"}`}>
                                            +{sc.bonusPoints}đ
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Score */}
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-gray-400">Điểm thu được (gốc + phụ):</span>
                                <span className={isSelected ? "text-cyan-600 font-extrabold" : "text-gray-400"}>
                                  {score} điểm
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Thông tin lệnh */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wide">Thông tin lệnh</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <Form.Item name="entry" label={<span className="font-semibold text-gray-500">Entry</span>}>
                    <InputNumber placeholder="Giá vào" style={{ width: "100%" }} className="rounded-lg" step={0.00001} />
                  </Form.Item>
                  <Form.Item name="vol" label={<span className="font-semibold text-gray-500">Vol (Khối lượng)</span>}>
                    <InputNumber placeholder="0.01" min={0.01} step={0.01} style={{ width: "100%" }} className="rounded-lg" />
                  </Form.Item>
                  <Form.Item name="sl" label={<span className="font-semibold text-gray-500">SL (Stop Loss)</span>}>
                    <InputNumber placeholder="Stop Loss" style={{ width: "100%" }} className="rounded-lg" step={0.00001} />
                  </Form.Item>
                  <Form.Item name="tp" label={<span className="font-semibold text-gray-500">TP (Take Profit)</span>}>
                    <InputNumber placeholder="Take Profit" style={{ width: "100%" }} className="rounded-lg" step={0.00001} />
                  </Form.Item>
                </div>
                <Form.Item name="note" label={<span className="font-semibold text-gray-500">Ghi chú</span>}>
                  <RichTextEditor placeholder="Ghi chú thêm..." minHeight="140px" />
                </Form.Item>
              </div>

              {/* Kết quả giao dịch */}
              <hr className="border-gray-100 my-3" />
              <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wide">
                Kết quả giao dịch
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Form.Item name="profit" label={<span className="font-semibold text-gray-500">Lãi / Lỗ ($)</span>}>
                  <InputNumber placeholder="Ví dụ: 50 hoặc -30" style={{ width: "100%" }} className="rounded-lg" />
                </Form.Item>
                <Form.Item name="result" label={<span className="font-semibold text-gray-500">Kết quả</span>}>
                  <Select placeholder="Chọn kết quả" className="rounded-lg" allowClear>
                    <Select.Option value="WIN">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <TrophyOutlined /> Thắng (WIN)
                      </span>
                    </Select.Option>
                    <Select.Option value="DRAW">
                      <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                        <MinusCircleOutlined /> Hòa (DRAW)
                      </span>
                    </Select.Option>
                    <Select.Option value="LOSE">
                      <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                        <CloseCircleOutlined /> Thua (LOSE)
                      </span>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => {
                    editJournalForm.resetFields();
                    setEditSelectedConditions({});
                    setEditSelectedMethodId(undefined);
                    setEditFormStepsChecked([]);
                    setIsEditJournalOpen(false);
                    setEditingJournal(null);
                  }}
                  className="flex-1 rounded-xl h-11 font-semibold border-gray-200 hover:border-cyan-400 hover:text-cyan-500"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="flex-1 rounded-xl h-11 bg-cyan-400 hover:bg-cyan-500 border-none text-gray-900 font-black shadow-md shadow-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isEditSaveDisabled}
                >
                  Cập nhật
                </Button>
              </div>
            </div>

            {/* ===== RIGHT: ADVICE PANEL (live từ editSelectedConditions) ===== */}
            {(() => {
              const hasCondition = editSelectedCount > 0;
              const hasDirection = editDirection === "BUY" || editDirection === "SELL";
              const pct = editProgressPercent;
              const { advice, colorClass, bgClass, borderClass, emoji } = getAssessment(pct);
              const assessmentStars = getAssessment(pct).stars;

              const faceMood: { face: string; label: string; faceSize: string } =
                pct >= 90
                  ? { face: "🤩", label: "Tuyệt vời!", faceSize: "text-[72px]" }
                  : pct >= 80
                    ? { face: "😄", label: "Rất tốt!", faceSize: "text-[68px]" }
                    : pct >= 65
                      ? { face: "🙂", label: "Ổn áp", faceSize: "text-[64px]" }
                      : pct >= 25
                        ? { face: "😐", label: "Cẩn thận - Đi vol bé", faceSize: "text-[60px]" }
                        : hasCondition
                          ? { face: "😢", label: "Nguy hiểm!", faceSize: "text-[60px]" }
                          : { face: "🤔", label: "Đang chờ...", faceSize: "text-[56px]" };

              return (
                <div
                  className={`w-64 flex-shrink-0 border-l border-gray-100 flex flex-col transition-all duration-500 ${hasCondition ? bgClass : "bg-gray-50/60"}`}
                  style={{ padding: "24px 20px", position: "sticky", top: 0 }}
                >
                  <div className="mb-4">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">📊 Nhận định & Lời khuyên</span>
                  </div>

                  <div className="flex flex-col items-center justify-center mb-5">
                    <span
                      className={`${faceMood.faceSize} leading-none transition-all duration-500 drop-shadow-sm`}
                      style={{ filter: hasCondition ? "none" : "grayscale(0.6) opacity(0.5)", lineHeight: 1.1 }}
                    >
                      {faceMood.face}
                    </span>
                    <span className={`mt-2 text-xs font-extrabold uppercase tracking-wide ${hasCondition ? colorClass : "text-gray-400"}`}>
                      {faceMood.label}
                    </span>
                  </div>

                  <div className={`rounded-xl p-3 mb-4 border text-center transition-all duration-300 ${hasCondition ? borderClass + " bg-white/70" : "border-gray-200 bg-white/40"}`}>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tổng điểm</div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-3xl font-black transition-all duration-300 ${hasCondition ? colorClass : "text-gray-300"}`}>
                        {editTotalScore}
                      </span>
                      <span className="text-sm font-bold text-gray-400">/ 100</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? "bg-emerald-400" : pct >= 65 ? "bg-cyan-400" : pct >= 25 ? "bg-amber-400" : "bg-rose-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {hasCondition && (
                      <div className={`text-xs font-black mt-1 ${colorClass}`}>{pct}%</div>
                    )}
                  </div>

                  {hasCondition && (
                    <div className="flex justify-center mb-4">
                      <Rate disabled allowHalf value={assessmentStars} className="text-amber-400" style={{ fontSize: 18 }} />
                    </div>
                  )}

                  {hasDirection && hasCondition ? (
                    <div className={`rounded-xl p-3 border ${borderClass} bg-white/60 transition-all duration-300 flex-1`}>
                      <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        {emoji} Lời khuyên
                      </div>
                      <div className={`text-xs font-bold leading-relaxed ${colorClass}`}>
                        {advice}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl p-3 border border-dashed border-gray-200 bg-white/40 flex-1 flex flex-col items-center justify-center text-center gap-2">
                      <span className="text-2xl">💡</span>
                      <span className="text-xs text-gray-400 leading-relaxed">
                        Chọn hướng và điều kiện để nhận lời khuyên
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </Form>
      </Modal>
    </div >
  );
}
