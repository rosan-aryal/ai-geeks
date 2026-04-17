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

export default function FindingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const input = useSearchStore((s) => s.current);
  const { findings } = useAggregate(input);
  const decoded = decodeURIComponent(id ?? "");
  const finding = findings.find((f) => f.id === decoded);
  if (!finding) {
    return <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center"><Text>Not found.</Text></SafeAreaView>;
  }
  const adapter = getAdapter(finding.adapterId);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-xs uppercase text-slate-500 font-medium">{adapter?.name ?? finding.adapterId}</Text>
          {adapter?.mocked ? <Text className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-700">mock</Text> : null}
          <SeverityPill severity={finding.severity} />
        </View>
        <Text className="text-xl font-semibold text-slate-900">{finding.title}</Text>

        <View className="mt-4"><ConfidenceBar value={finding.confidence} /></View>
        {finding.corroboratingSources > 0 ? (
          <Text className="text-xs text-slate-500 mt-2">Seen in {finding.corroboratingSources + 1} sources</Text>
        ) : null}

        <Text className="text-base text-slate-700 mt-6 leading-6">{finding.summary}</Text>

        <Pressable onPress={() => WebBrowser.openBrowserAsync(finding.sourceUrl)} className="mt-6 bg-white rounded-xl border border-slate-200 px-4 py-3">
          <Text className="text-xs uppercase text-slate-500 mb-1">Source</Text>
          <Text className="text-sm text-sky-700 font-mono" numberOfLines={2}>{finding.sourceUrl}</Text>
        </Pressable>

        <View className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
          <Text className="text-xs uppercase text-slate-500 mb-1">Raw data</Text>
          <Text className="text-[11px] font-mono text-slate-700">{JSON.stringify(finding.rawData ?? {}, null, 2).slice(0, 2000)}</Text>
        </View>

        <Text className="text-[11px] text-slate-400 mt-4 font-mono">retrieved {finding.retrievedAt}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
