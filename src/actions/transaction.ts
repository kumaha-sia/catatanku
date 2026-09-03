"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTransactions(limit?: number) {
  return prisma.transaction.findMany({
    take: limit,
    include: {
      account: true,
      category: true
    },
    orderBy: { date: "desc" }
  })
}

export async function createTransaction(data: { amount: number, type: string, date: Date, note?: string, accountId: string, categoryId?: string }) {
  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({ data })

    const modifier = data.type === "EXPENSE" ? -data.amount : data.amount

    await tx.account.update({
      where: { id: data.accountId },
      data: {
        balance: {
          increment: modifier
        }
      }
    })

    return transaction
  })

  revalidatePath("/")
  revalidatePath("/transactions")
  revalidatePath("/accounts")
  return result
}
