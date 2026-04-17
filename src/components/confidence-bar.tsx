import React from "react";
import { Text, View } from "react-native";

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <View className="flex-row items-center gap-2">
      <View className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <View className="h-full bg-sky-500" style={{ width: `${pct}%` }} />
      </View>
      <Text className="text-xs text-slate-600 font-mono">{pct}%</Text>
    </View>
  );
}
