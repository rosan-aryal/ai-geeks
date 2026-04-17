import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { EntityType, SearchHints } from "@/adapters/types";
import { useSearchStore } from "@/store/search-store";

export default function SearchScreen() {
  const router = useRouter();
  const submitSearch = useSearchStore((s) => s.submitSearch);
  const removeFromHistory = useSearchStore((s) => s.removeFromHistory);
  const clearHistory = useSearchStore((s) => s.clearHistory);
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

  const confirmRemove = (index: number, label: string) => {
    Alert.alert(
      "Remove from history?",
      `"${label}" will be removed from your recent searches.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeFromHistory(index) },
      ],
    );
  };

  const confirmClearAll = () => {
    Alert.alert(
      "Clear all history?",
      "This will remove every recent search. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear all", style: "destructive", onPress: clearHistory },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <Text className="text-4xl font-semibold text-slate-900 mb-1">OSINT</Text>
        <Text className="text-base text-slate-500 mb-5">Aggregate public intelligence on a company or individual.</Text>

        <View className="bg-sky-50 border border-sky-100 rounded-2xl p-4 mb-6">
          <Text className="text-sm font-semibold text-sky-900 mb-2">How it works</Text>
          <Text className="text-sm text-slate-700 leading-5 mb-3">
            Enter a name or company, pick the entity type, and we query 14 public sources in parallel —
            social (Reddit, Hacker News, Wikipedia), technical (WHOIS, DNS, GitHub, certificates),
            and regulatory (SEC EDGAR, GDELT, news).
          </Text>
          <View className="gap-1.5">
            <Text className="text-sm text-slate-700">• <Text className="font-semibold">Confidence</Text> scores each finding 0–100% based on name, domain, and corroboration across sources.</Text>
            <Text className="text-sm text-slate-700">• <Text className="font-semibold">Severity</Text> flags risk level — info, low, medium, high, critical.</Text>
            <Text className="text-sm text-slate-700">• Add <Text className="font-semibold">context</Text> (domain, location, industry) for sharper matches.</Text>
          </View>
        </View>

        <View className="flex-row bg-slate-200 rounded-full p-1 mb-4 self-start">
          {(["company", "person"] as const).map((t) => (
            <Pressable key={t} onPress={() => setEntityType(t)} className={`px-5 py-2 rounded-full ${entityType === t ? "bg-white" : ""}`}>
              <Text className={`text-base ${entityType === t ? "text-slate-900 font-medium" : "text-slate-600"}`}>
                {t === "company" ? "Company" : "Person"}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={entityType === "company" ? "e.g. AIGeeks" : "e.g. Travis Haasch"}
          className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 text-lg text-slate-900"
          autoCapitalize="words"
          returnKeyType="search"
          onSubmitEditing={onSubmit}
        />

        <Pressable onPress={() => setShowHints(!showHints)} className="mt-3">
          <Text className="text-base text-sky-600">{showHints ? "− Hide context" : "+ Add context (optional)"}</Text>
        </Pressable>

        {showHints ? (
          <View className="mt-3 gap-2">
            <TextInput value={hints.location ?? ""} onChangeText={(v) => setHints({ ...hints, location: v })}
              placeholder="Location" className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 text-base" />
            <TextInput value={hints.industry ?? ""} onChangeText={(v) => setHints({ ...hints, industry: v })}
              placeholder="Industry" className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 text-base" />
            <TextInput value={hints.domain ?? ""} onChangeText={(v) => setHints({ ...hints, domain: v })}
              placeholder="Domain (aigeeks.com)" autoCapitalize="none" className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 text-base" />
          </View>
        ) : null}

        <Pressable onPress={onSubmit} disabled={!canSearch}
          className={`mt-6 rounded-xl py-3.5 items-center ${canSearch ? "bg-slate-900" : "bg-slate-300"}`}>
          <Text className="text-white font-medium text-base">Search</Text>
        </Pressable>

        {history.length > 0 ? (
          <View className="mt-10">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm uppercase text-slate-500 font-semibold tracking-wide">Recent</Text>
              <Pressable onPress={confirmClearAll} hitSlop={8} className="px-2 py-1">
                <Text className="text-sm text-rose-600 font-medium">Clear all</Text>
              </Pressable>
            </View>
            {history.map((h, i) => (
              <View key={`${h.query}-${i}`} className="flex-row items-center border-b border-slate-200">
                <Pressable
                  onPress={() => { submitSearch(h); router.push("/results"); }}
                  className="flex-1 py-3 active:bg-slate-100"
                >
                  <Text className="text-base text-slate-800">{h.query}</Text>
                  <Text className="text-sm text-slate-500 mt-0.5">{h.entityType}{h.hints?.domain ? ` · ${h.hints.domain}` : ""}</Text>
                </Pressable>
                <Pressable
                  onPress={() => confirmRemove(i, h.query)}
                  hitSlop={12}
                  className="w-10 h-10 items-center justify-center rounded-full active:bg-rose-100"
                  accessibilityLabel={`Remove ${h.query} from history`}
                >
                  <Text className="text-lg text-rose-600 font-semibold">✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
