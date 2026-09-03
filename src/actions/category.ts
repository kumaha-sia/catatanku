"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" }
  })
}

export async function createCategory(data: { name: string, icon: string, color: string, type: string }) {
  const category = await prisma.category.create({
    data
  })
  revalidatePath("/")
  revalidatePath("/transactions")
  return category
}

// Seed function for default categories
export async function seedCategories() {
  const count = await prisma.category.count()
  if (count > 0) return

  const defaults = [
    { name: "Makanan", icon: "Utensils", color: "#f97316", type: "EXPENSE" },
    { name: "Transportasi", icon: "Car", color: "#3b82f6", type: "EXPENSE" },
    { name: "Gaji", icon: "Briefcase", color: "#10b981", type: "INCOME" },
    { name: "Tagihan", icon: "Receipt", color: "#ef4444", type: "EXPENSE" },
  ]

  for (const cat of defaults) {
    await prisma.category.create({ data: cat })
  }
}
