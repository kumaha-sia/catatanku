"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAccounts() {
  return prisma.account.findMany({
    orderBy: { createdAt: "asc" }
  })
}

export async function createAccount(data: { name: string, type: string, balance: number }) {
  const account = await prisma.account.create({
    data: {
      name: data.name,
      type: data.type,
      balance: data.balance
    }
  })
  revalidatePath("/")
  revalidatePath("/accounts")
  return account
}
