"use client";

import { type ReactNode } from "react";
import { TransactionModalProvider } from "@/components/transaction-modal";
import { AppNav } from "@/components/layout/app-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TransactionModalProvider>
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#fef9f0]">
        <AppNav />
        <div className="flex-1 overflow-y-auto pt-14 md:pl-56">{children}</div>
      </div>
    </TransactionModalProvider>
  );
}
