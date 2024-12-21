import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, loanAmount, startDate, endDate } = await req.json();

    const newLoan = await prisma.loan.create({
      data: {
        userId,
        loanAmount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json(newLoan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  try {
    const loans = await prisma.loan.findMany({
      where: { userId },
      include: { payments: true },
    });

    return NextResponse.json(loans, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching loans ${error} ` }, { status: 500 });
  }
}
