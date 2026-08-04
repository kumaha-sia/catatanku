"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function InsightsContent() {
  const queryClient = useQueryClient();
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await fetch("/api/insights");
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["insights"] }),
  });

  if (isLoading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Insight AI</h1>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending
            ? "Menganalisis..."
            : "Buat Insight Sekarang"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {insights.map(
          (insight: {
            id: string;
            title: string;
            content: string;
            createdAt: string;
            severity: string;
          }) => (
            <Card key={insight.id}>
              <CardHeader>
                <CardTitle className="text-base">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 whitespace-pre-line text-sm leading-relaxed">
                <p>{insight.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(insight.createdAt).toLocaleString("id-ID")}
                </p>
              </CardContent>
            </Card>
          ),
        )}
        {insights.length === 0 && (
          <p className="text-muted-foreground">
            Belum ada insight. Tekan Buat Insight Sekarang untuk memulai.
          </p>
        )}
      </div>
    </div>
  );
}
