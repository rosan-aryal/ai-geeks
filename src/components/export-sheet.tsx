import React, { useState } from "react";
import { Modal, Pressable, Text, View, ActivityIndicator } from "react-native";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import type { ResolvedFinding, SearchInput, Severity } from "@/adapters/types";
import { renderMarkdown } from "@/export/markdown";
import { renderPdf } from "@/export/pdf";

interface Props {
  open: boolean;
  onClose: () => void;
  input: SearchInput;
  findings: ResolvedFinding[];
  overall: Severity;
}

export function ExportSheet({ open, onClose, input, findings, overall }: Props) {
  const [busy, setBusy] = useState<"md" | "pdf" | null>(null);

  const exportMd = async () => {
    setBusy("md");
    try {
      const md = renderMarkdown(input, findings, overall);
      const name = `osint-${input.query.replace(/\W+/g, "-")}.md`;
      const file = new File(Paths.cache, name);
      if (file.exists) file.delete();
      file.create();
      file.write(md);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri);
    } finally {
      setBusy(null);
      onClose();
    }
  };

  const exportPdf = async () => {
    setBusy("pdf");
    try {
      const md = renderMarkdown(input, findings, overall);
      const uri = await renderPdf(md);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
    } finally {
      setBusy(null);
      onClose();
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30" onPress={onClose} />
      <View className="bg-white rounded-t-3xl p-6 pb-10 absolute left-0 right-0 bottom-0">
        <Text className="text-lg font-semibold mb-1">Export report</Text>
        <Text className="text-xs text-slate-500 mb-4">{findings.length} findings · overall risk: {overall}</Text>
        <Pressable onPress={exportMd} disabled={busy !== null} className="flex-row items-center justify-between py-3 border-b border-slate-100">
          <Text className="text-base text-slate-900">Markdown (.md)</Text>
          {busy === "md" ? <ActivityIndicator /> : <Text className="text-slate-400">›</Text>}
        </Pressable>
        <Pressable onPress={exportPdf} disabled={busy !== null} className="flex-row items-center justify-between py-3">
          <Text className="text-base text-slate-900">PDF</Text>
          {busy === "pdf" ? <ActivityIndicator /> : <Text className="text-slate-400">›</Text>}
        </Pressable>
        <Pressable onPress={onClose} className="mt-4 py-3 items-center bg-slate-100 rounded-xl">
          <Text className="text-slate-700">Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
