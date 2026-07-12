import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/app/actions/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const receiverId = await getSessionUserId();
    if (!receiverId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tradeId = (await params).id;
    const { action } = await request.json(); 

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const trade = await tx.trade.findUnique({
        where: { id: tradeId },
        include: { items: true }
      });

      if (!trade) throw new Error('Trade not found');
      if (trade.receiverId !== receiverId) throw new Error('Unauthorized');
      if (trade.status !== 'PENDING') throw new Error('Trade is no longer pending');

      const userItemIds = trade.items.map(ti => ti.userItemId);

      if (action === 'accept') {
        await tx.trade.update({
          where: { id: tradeId },
          data: { status: 'ACCEPTED', updatedAt: new Date() }
        });
        
        await tx.userItem.updateMany({
          where: { id: { in: userItemIds } },
          data: { userId: receiverId, status: 'active', updatedAt: new Date() }
        });

        const updatedItems = await tx.userItem.findMany({
          where: { id: { in: userItemIds } },
          include: { item: true }
        });

        return { success: true, items: updatedItems };
      } else {
        await tx.trade.update({
          where: { id: tradeId },
          data: { status: 'REJECTED', updatedAt: new Date() }
        });
        
        await tx.userItem.updateMany({
          where: { id: { in: userItemIds } },
          data: { status: 'active', updatedAt: new Date() }
        });
      }
      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error responding to trade:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
