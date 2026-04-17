import React from "react";
import { Text, View } from "react-native";
import type { Severity } from "@/adapters/types";

const STYLES: Record<Severity, string> = {
  info: "bg-slate-100 text-slate-700 border-slate-200",
  low: "bg-sky-50 text-sky-700 border-sky-200",
  medium: "bg-amber-50 text-amber-800 border-amber-200",
  high: "bg-orange-50 text-orange-800 border-orange-200",
  critical: "bg-red-50 text-red-800 border-red-300",
};

export function SeverityPill({ severity }: { severity: Severity }) {
  return (
    <View className={`px-2 py-0.5 rounded-full border ${STYLES[severity]}`}>
      <Text className={`text-xs font-medium ${STYLES[severity].split(" ").find((c) => c.startsWith("text-"))}`}>
        {severity.toUpperCase()}
      </Text>
    </View>
  );
}
