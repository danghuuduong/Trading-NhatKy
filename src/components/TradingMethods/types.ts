export interface Method {
  id: string;
  name: string;
  conditionIds: string[]; // List of linked condition/indicator IDs
  steps: string[];        // Step texts: ["Check D1 trend", "Identify H4 key levels", ...]
  createdAt: string;
}
