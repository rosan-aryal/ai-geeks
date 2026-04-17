import { marked } from "marked";
import * as Print from "expo-print";

const CSS = `
  body { font-family: -apple-system, "SF Pro Display", system-ui, sans-serif; color: #0f172a; padding: 32px; line-height: 1.5; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 16px; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  h3 { font-size: 13px; margin-top: 14px; }
  code, pre { font-family: "SF Mono", Menlo, monospace; font-size: 10px; }
  a { color: #0284c7; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }
  ul { padding-left: 18px; }
  em { color: #64748b; }
`;

export async function renderPdf(markdown: string): Promise<string> {
  const html = `<html><head><style>${CSS}</style></head><body>${await marked.parse(markdown)}</body></html>`;
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}
