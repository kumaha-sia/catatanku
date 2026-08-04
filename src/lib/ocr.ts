import { ImageAnnotatorClient } from "@google-cloud/vision";
import { createEmbedding } from "@/lib/embedding";

let client: ImageAnnotatorClient | null = null;
function getClient() {
  if (!client) client = new ImageAnnotatorClient();
  return client;
}

export async function extractReceipt(buffer: Buffer) {
  const [result] = await getClient().textDetection({
    image: { content: buffer },
  });
  const fullText = result.textAnnotations?.[0]?.description ?? "";
  const lines = fullText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const total = findTotal(lines);
  const date = findDate(lines);
  const merchant = lines[0] ?? null;
  const embedding = await createEmbedding(fullText);

  return {
    merchant,
    date,
    total,
    rawText: fullText,
    lines,
    embedding,
  };
}

function findTotal(lines: string[]) {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].replace(/[.,]/g, "");
    const match = line.match(
      /(?:TOTAL|GRAND TOTAL|JUMLAH|TAGIHAN|BAYAR)[:\s]*Rp?\s*([\d.,]+)/i,
    );
    if (match) return parseNumber(match[1]);
  }
  return null;
}

function findDate(lines: string[]) {
  const joined = lines.join(" ");
  const match = joined.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);
  if (!match) return null;
  const [day, month, year] = match[1].split(/[\/-]/).map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  return new Date(fullYear, month - 1, day);
}

function parseNumber(text: string) {
  const cleaned = text.replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : null;
}
