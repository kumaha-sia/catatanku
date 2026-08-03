import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const defaultCategories = [
  { type: "INCOME", name: "Gaji" },
  { type: "INCOME", name: "Bonus" },
  { type: "INCOME", name: "Freelance" },
  { type: "EXPENSE", name: "Makan" },
  { type: "EXPENSE", name: "Transportasi" },
  { type: "EXPENSE", name: "Belanja Harian" },
  { type: "EXPENSE", name: "Hiburan" },
  { type: "EXPENSE", name: "Kesehatan" },
  { type: "EXPENSE", name: "Pendidikan" },
  { type: "EXPENSE", name: "Tagihan" },
  { type: "SAVINGS", name: "Dana Darurat" },
  { type: "SAVINGS", name: "Liburan" },
  { type: "SAVINGS", name: "Pendidikan Anak" },
  { type: "DEBT", name: "Cicilan" },
] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: "OWNER",
      },
    });

    const family = await prisma.family.create({
      data: {
        name: `Keluarga ${data.name}`,
        members: { connect: { id: user.id } },
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { familyId: family.id },
    });

    await prisma.category.createMany({
      data: defaultCategories.map((c) => ({
        userId: user.id,
        type: c.type,
        name: c.name,
      })),
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
