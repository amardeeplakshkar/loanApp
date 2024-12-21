import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import path as needed

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const newUser = await prisma.user.create({
      data: { userId },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error creating user ${error}`, }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching user ${error}`,}, { status: 500 });
  }
}
