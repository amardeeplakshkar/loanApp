import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { loanId, paymentDate, amount } = await req.json();

    const newPayment = await prisma.payment.create({
      data: {
        loanId,
        paymentDate: new Date(paymentDate),
        amount,
      },
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error creating payment${error}` }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const loanId = searchParams.get('loanId');

  try {
    const payments = await prisma.payment.findMany({
      where: { loanId },
    });

    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching payments ${error}` }, { status: 500 });
  }
}
