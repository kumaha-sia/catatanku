"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatContent() {
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const sessions = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/chat/sessions");
      return res.json() as Promise<Array<{ id: string; lastMessage?: string }>>;
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!message.trim() || isSending) return;
    const userMsg = message.trim();
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId }),
      });
      if (!res.ok || !res.body) throw new Error("Gagal mengirim");
      const sessionHeader = res.headers.get("x-session-id");
      if (sessionHeader) setSessionId(sessionHeader);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistant = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            last.content = assistant;
          } else {
            next.push({ role: "assistant", content: assistant });
          }
          return next;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan saat menghubungi AI.",
        },
      ]);
    } finally {
      setIsSending(false);
      sessions.refetch();
    }
  }

  return (
    <div className="grid gap-4 p-6 md:grid-cols-[280px_1fr]">
      <Card className="h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-lg">Sesi Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.data?.map((session) => (
            <button
              key={session.id}
              className={`w-full rounded-md border p-2 text-left text-sm hover:bg-muted ${sessionId === session.id ? "border-primary" : ""}`}
              onClick={() => {
                setSessionId(session.id);
                setMessages([]);
              }}
            >
              {session.lastMessage?.slice(0, 80) ?? "Sesi baru"}
            </button>
          ))}
          {sessions.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada sesi chat.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="flex h-[80vh] flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Asisten Keuangan AI</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto">
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-line rounded-md border p-3 text-sm ${msg.role === "user" ? "ml-8 bg-muted" : "mr-8 bg-background"}`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              placeholder="Tanya tentang keuangan Anda..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
            />
            <Button type="submit" disabled={isSending || !message.trim()}>
              {isSending ? "Mengirim" : "Kirim"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
