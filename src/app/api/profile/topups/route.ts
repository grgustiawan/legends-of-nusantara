import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/app/actions/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const total = await prisma.walletTransaction.count({
      where: {
        userId,
        amount: { gt: 0 }
      }
    });
    const totalPages = Math.ceil(total / limit);

    const transactions = await prisma.walletTransaction.findMany({
      where: {
        userId,
        amount: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const formatted = transactions.map(tx => ({
      ...tx,
      amount: tx.amount.toString(),
      balanceBefore: tx.balanceBefore.toString(),
      balanceAfter: tx.balanceAfter.toString(),
      sequence: tx.sequence.toString(),
    }));

    return NextResponse.json({ data: formatted, totalPages });
  } catch (error) {
    console.error('Error fetching topups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
