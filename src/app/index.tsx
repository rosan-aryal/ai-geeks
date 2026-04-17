import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { EntityType, SearchHints } from "@/adapters/types";
import { useSearchStore } from "@/store/search-store";

export default function SearchScreen() {
  const router = useRouter();
  const submitSearch = useSearchStore((s) => s.submitSearch);
  const history = useSearchStore((s) => s.history);

  const [entityType, setEntityType] = useState<EntityType>("company");
  const [query, setQuery] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [hints, setHints] = useState<SearchHints>({});

  const canSearch = query.trim().length > 0;

  const onSubmit = () => {
    if (!canSearch) return;
    const input = { query: query.trim(), entityType, hints: Object.values(hints).some(Boolean) ? hints : undefined };
    submitSearch(input);
    router.push("/results");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <Text className="text-3xl font-semibold text-slate-900 mb-1">OSINT</Text>
        <Text className="text-sm text-slate-500 mb-6">Aggregate public intelligence on a company or individual.</Text>

        <View className="flex-row bg-slate-200 rounded-full p-1 mb-4 self-start">
          {(["company", "person"] as const).map((t) => (
            <Pressable key={t} onPress={() => setEntityType(t)} className={`px-4 py-1.5 rounded-full ${entityType === t ? "bg-white" : ""}`}>
              <Text className={`text-sm ${entityType === t ? "text-slate-900 font-medium" : "text-slate-600"}`}>
                {t === "company" ? "Company" : "Person"}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={entityType === "company" ? "e.g. AIGeeks" : "e.g. Travis Haasch"}
          className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900"
          autoCapitalize="words"
          returnKeyType="search"
          onSubmitEditing={onSubmit}
        />

        <Pressable onPress={() => setShowHints(!showHints)} className="mt-3">
          <Text className="text-sm text-sky-600">{showHints ? "− Hide context" : "+ Add context (optional)"}</Text>
        </Pressable>

        {showHints ? (
          <View className="mt-3 gap-2">
            <TextInput value={hints.location ?? ""} onChangeText={(v) => setHints({ ...hints, location: v })}
              placeholder="Location" className="bg-white rounded-xl border border-slate-200 px-3 py-2" />
            <TextInput value={hints.industry ?? ""} onChangeText={(v) => setHints({ ...hints, industry: v })}
              placeholder="Industry" className="bg-white rounded-xl border border-slate-200 px-3 py-2" />
            <TextInput value={hints.domain ?? ""} onChangeText={(v) => setHints({ ...hints, domain: v })}
              placeholder="Domain (aigeeks.com)" autoCapitalize="none" className="bg-white rounded-xl border border-slate-200 px-3 py-2" />
          </View>
        ) : null}

        <Pressable onPress={onSubmit} disabled={!canSearch}
          className={`mt-6 rounded-xl py-3 items-center ${canSearch ? "bg-slate-900" : "bg-slate-300"}`}>
          <Text className="text-white font-medium">Search</Text>
        </Pressable>

        {history.length > 0 ? (
          <View className="mt-10">
            <Text className="text-xs uppercase text-slate-500 font-medium mb-2">Recent</Text>
            {history.map((h, i) => (
              <Pressable key={`${h.query}-${i}`} onPress={() => { useSearchStore.getState().submitSearch(h); router.push("/results"); }}
                className="py-2 border-b border-slate-200">
                <Text className="text-sm text-slate-800">{h.query}</Text>
                <Text className="text-xs text-slate-500">{h.entityType}{h.hints?.domain ? ` · ${h.hints.domain}` : ""}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
