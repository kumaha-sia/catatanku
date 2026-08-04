"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExtractedReceipt {
  merchant: string | null;
  date: string | null;
  total: number | null;
  lines: string[];
}

export function OcrUpload({
  onExtracted,
}: {
  onExtracted?: (data: ExtractedReceipt) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExtractedReceipt | null>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal membaca struk");
      const data = await res.json();
      setResult(data);
      onExtracted?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload Struk (OCR)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="receipt">File gambar/PDF struk</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Memproses..." : "Baca Struk"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <div className="space-y-2 rounded-md border p-3 text-sm">
            <p>
              <span className="font-semibold">Merchant:</span>{" "}
              {result.merchant ?? "-"}
            </p>
            <p>
              <span className="font-semibold">Tanggal:</span>{" "}
              {result.date
                ? new Date(result.date).toLocaleDateString("id-ID")
                : "-"}
            </p>
            <p>
              <span className="font-semibold">Total:</span>{" "}
              {result.total ? result.total.toLocaleString("id-ID") : "-"}
            </p>
            {result.lines.length > 0 && (
              <div className="max-h-40 overflow-y-auto whitespace-pre-line border-t pt-2 text-xs text-muted-foreground">
                {result.lines.join("\n")}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
