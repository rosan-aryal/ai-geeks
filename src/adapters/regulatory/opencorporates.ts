import type { Adapter } from "@/adapters/types";
import { mockDelay, seededMockFinding } from "../_mock";

export const openCorporatesMockAdapter: Adapter = {
  id: "opencorporates",
  name: "OpenCorporates",
  category: "regulatory",
  supports: ["company"],
  mocked: true,
  async fetch(input) {
    await mockDelay();
    return [seededMockFinding("opencorporates", "regulatory", input.query, 1)];
  },
};
