import React from "react";
import type { ResolvedFinding, SearchInput, Severity } from "@/adapters/types";

interface Props { open: boolean; onClose: () => void; input: SearchInput; findings: ResolvedFinding[]; overall: Severity; }
export function ExportSheet(_: Props) { return null; }
