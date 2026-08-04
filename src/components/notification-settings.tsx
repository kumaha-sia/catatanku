"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function NotificationSettings() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    if (!VAPID_PUBLIC_KEY) {
      setStatus("VAPID key belum dikonfigurasi.");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("Browser tidak mendukung push notification.");
      return;
    }
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("Gagal menyimpan langganan");
      setStatus("Notifikasi aktif!");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function testNotification() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/test", { method: "POST" });
      if (!res.ok) throw new Error("Gagal mengirim tes notifikasi");
      setStatus("Tes notifikasi dikirim!");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notifikasi Push</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Aktifkan notifikasi untuk menerima peringatan budget dan insight
          harian.
        </p>
        <div className="flex gap-2">
          <Button onClick={subscribe} disabled={loading}>
            Aktifkan Notifikasi
          </Button>
          <Button
            variant="outline"
            onClick={testNotification}
            disabled={loading}
          >
            Kirim Tes
          </Button>
        </div>
        {status && <p className="text-sm">{status}</p>}
      </CardContent>
    </Card>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
