import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { ResolvedFinding } from "@/adapters/types";
import { SeverityPill } from "./severity-pill";
import { ConfidenceBar } from "./confidence-bar";

export function FindingRow({ finding }: { finding: ResolvedFinding }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/finding/${encodeURIComponent(finding.id)}`)}
      className="py-3 px-4 border-b border-slate-100 active:bg-slate-50"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-sm font-medium text-slate-900" numberOfLines={2}>{finding.title}</Text>
          <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={2}>{finding.summary}</Text>
          <View className="flex-row items-center gap-3 mt-2">
            <ConfidenceBar value={finding.confidence} />
            {finding.corroboratingSources > 0 ? (
              <Text className="text-[10px] text-slate-500">Seen in {finding.corroboratingSources + 1} sources</Text>
            ) : null}
          </View>
        </View>
        <SeverityPill severity={finding.severity} />
      </View>
    </Pressable>
  );
}
