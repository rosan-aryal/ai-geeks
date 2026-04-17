import React, { useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearchStore } from "@/store/search-store";
import { useAggregate } from "@/hooks/use-aggregate";
import { CategoryCard } from "@/components/category-card";
import { SeverityPill } from "@/components/severity-pill";
import { ExportSheet } from "@/components/export-sheet";

export default function ResultsScreen() {
  const input = useSearchStore((s) => s.current);
  const { states, findings, overall, anyLoaded } = useAggregate(input);
  const [exportOpen, setExportOpen] = useState(false);

  if (!input) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">No search. Go back.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        <View className="px-4 pb-4">
          <Text className="text-3xl font-semibold text-slate-900">{input.query}</Text>
          <View className="flex-row items-center gap-3 mt-2">
            <Text className="text-sm text-slate-500 uppercase">{input.entityType}</Text>
            <Text className="text-sm text-slate-500">·</Text>
            <Text className="text-sm text-slate-500">{findings.length} finding{findings.length === 1 ? "" : "s"}</Text>
            <Text className="text-sm text-slate-500">·</Text>
            <SeverityPill severity={overall} />
          </View>
          {!anyLoaded ? <Text className="text-sm text-slate-400 mt-2">Searching…</Text> : null}
        </View>

        <CategoryCard category="social" states={states} findings={findings} />
        <CategoryCard category="technical" states={states} findings={findings} />
        <CategoryCard category="regulatory" states={states} findings={findings} />
      </ScrollView>

      <Pressable onPress={() => setExportOpen(true)}
        className="absolute bottom-8 right-6 bg-slate-900 w-14 h-14 rounded-full items-center justify-center shadow-lg">
        <Text className="text-white text-xl">↓</Text>
      </Pressable>

      <ExportSheet open={exportOpen} onClose={() => setExportOpen(false)} input={input} findings={findings} overall={overall} />
    </SafeAreaView>
  );
}
