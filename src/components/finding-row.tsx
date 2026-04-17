import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { ResolvedFinding } from "@/adapters/types";
import { SeverityPill } from "./severity-pill";
import { ConfidenceBar } from "./confidence-bar";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatRetrievedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function FindingRow({ finding }: { finding: ResolvedFinding }) {
  const router = useRouter();
  const retrieved = formatRetrievedAt(finding.retrievedAt);
  return (
    <Pressable
      onPress={() => router.push(`/finding/${encodeURIComponent(finding.id)}`)}
      className="py-4 px-4 border-b border-slate-100 active:bg-slate-50"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-medium text-slate-900" numberOfLines={2}>{finding.title}</Text>
          <Text className="text-sm text-slate-500 mt-1" numberOfLines={2}>{finding.summary}</Text>
          <View className="flex-row items-center gap-3 mt-2">
            <ConfidenceBar value={finding.confidence} />
            {finding.corroboratingSources > 0 ? (
              <Text className="text-xs text-slate-500">Seen in {finding.corroboratingSources + 1} sources</Text>
            ) : null}
          </View>
        </View>
        <View className="items-end gap-1.5">
          <SeverityPill severity={finding.severity} />
          {retrieved ? <Text className="text-xs text-slate-400">{retrieved}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}
