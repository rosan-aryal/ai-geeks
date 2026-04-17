import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useSearchStore } from "@/store/search-store";
import { useAggregate } from "@/hooks/use-aggregate";
import { SeverityPill } from "@/components/severity-pill";
import { ConfidenceBar } from "@/components/confidence-bar";
import { getAdapter } from "@/adapters/registry";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatRetrievedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${hh}:${mm}`;
}

export default function FindingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const input = useSearchStore((s) => s.current);
  const { findings } = useAggregate(input);
  const decoded = decodeURIComponent(id ?? "");
  const finding = findings.find((f) => f.id === decoded);
  if (!finding) {
    return <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center"><Text className="text-base text-slate-600">Not found.</Text></SafeAreaView>;
  }
  const adapter = getAdapter(finding.adapterId);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-sm uppercase text-slate-500 font-semibold tracking-wide">{adapter?.name ?? finding.adapterId}</Text>
          {adapter?.mocked ? <Text className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-700">mock</Text> : null}
          <SeverityPill severity={finding.severity} />
        </View>
        <Text className="text-2xl font-semibold text-slate-900">{finding.title}</Text>

        <View className="mt-4"><ConfidenceBar value={finding.confidence} /></View>
        {finding.corroboratingSources > 0 ? (
          <Text className="text-sm text-slate-500 mt-2">Seen in {finding.corroboratingSources + 1} sources</Text>
        ) : null}

        <Text className="text-base text-slate-700 mt-6 leading-7">{finding.summary}</Text>

        <Pressable onPress={() => WebBrowser.openBrowserAsync(finding.sourceUrl)} className="mt-6 bg-white rounded-xl border border-slate-200 px-4 py-3 active:bg-slate-100">
          <Text className="text-sm uppercase text-slate-500 mb-1 font-semibold tracking-wide">Source</Text>
          <Text className="text-base text-sky-700 font-mono" numberOfLines={2}>{finding.sourceUrl}</Text>
        </Pressable>

        <View className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
          <Text className="text-sm uppercase text-slate-500 mb-1 font-semibold tracking-wide">Raw data</Text>
          <Text className="text-xs font-mono text-slate-700">{JSON.stringify(finding.rawData ?? {}, null, 2).slice(0, 2000)}</Text>
        </View>

        <Text className="text-xs text-slate-400 mt-4">Retrieved {formatRetrievedAt(finding.retrievedAt)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
