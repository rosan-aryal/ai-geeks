import React, { useState } from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import type { Category, ResolvedFinding } from "@/adapters/types";
import type { AdapterQueryState } from "@/hooks/use-aggregate";
import { FindingRow } from "./finding-row";

const TITLES: Record<Category, string> = {
  social: "Social & Public Footprint",
  technical: "Technical Infrastructure",
  regulatory: "Contextual & Regulatory",
};

interface Props {
  category: Category;
  states: AdapterQueryState[];
  findings: ResolvedFinding[];
}

export function CategoryCard({ category, states, findings }: Props) {
  const [open, setOpen] = useState(true);
  const cats = states.filter((s) => s.adapter.category === category);
  const catFindings = findings.filter((f) => f.category === category);

  return (
    <View className="mx-4 mb-4 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <Pressable onPress={() => setOpen(!open)} className="px-4 py-3 border-b border-slate-100 active:bg-slate-50">
        <View className="flex-row justify-between items-center">
          <Text className="font-semibold text-slate-900">{TITLES[category]}</Text>
          <Text className="text-xs text-slate-500">{catFindings.length} finding{catFindings.length === 1 ? "" : "s"}</Text>
        </View>
      </Pressable>

      <View className="px-4 py-2">
        {cats.map((s) => (
          <View key={s.adapter.id} className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center gap-2">
              {s.loading ? <ActivityIndicator size="small" /> : s.errored ? <Text className="text-red-500">⚠</Text> : <Text className="text-emerald-500">✓</Text>}
              <Text className="text-xs text-slate-700">{s.adapter.name}{s.adapter.mocked ? " (mock)" : ""}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-slate-500 font-mono">{s.count}</Text>
              {s.errored ? (
                <Pressable onPress={s.refetch}><Text className="text-xs text-sky-600">retry</Text></Pressable>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      {open && catFindings.length > 0 ? (
        <View className="border-t border-slate-100">
          {catFindings.map((f) => <FindingRow key={f.id} finding={f} />)}
        </View>
      ) : null}
    </View>
  );
}
