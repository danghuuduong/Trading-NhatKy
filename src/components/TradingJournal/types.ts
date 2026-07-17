export interface TimeframeScores {
  M15: number;
  M30: number;
  H1: number;
  H2: number;
  H4: number;
  D1: number;
}

export interface SubCondition {
  id: string;
  name: string;
  bonusPoints: number;
}

export interface Condition {
  id: string;
  name: string;
  scores: TimeframeScores;
  subConditions?: SubCondition[];
}

export interface SelectedConditionState {
  checked: boolean;
  selectedTimeframes: (keyof TimeframeScores)[];
  checkedSubConditions: string[];
}

export interface JournalConditionDetail {
  conditionId: string;
  conditionName: string;
  timeframe?: keyof TimeframeScores;
  timeframes?: (keyof TimeframeScores)[];
  score: number;
  subConditions?: { name: string; bonusPoints: number }[];
}

export interface JournalEntry {
  id: string;
  direction: "BUY" | "SELL";
  symbol?: string;
  totalScore: number;
  maxScore: number;
  createdAt: string;
  conditions: JournalConditionDetail[];
  entry?: number;
  sl?: number;
  tp?: number;
  vol?: number;
  note?: string;
  profit?: number;
  result?: "WIN" | "LOSE" | "DRAW";
}
