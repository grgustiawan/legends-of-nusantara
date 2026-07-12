import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/app/actions/auth';

export async function POST(request: NextRequest) {
  try {
    const senderId = await getSessionUserId();
    if (!senderId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, offeredItemIds } = body;

    if (!receiverId || !offeredItemIds || !Array.isArray(offeredItemIds) || offeredItemIds.length === 0) {
      return NextResponse.json({ error: 'Data tidak lengkap atau tidak ada kartu yang ditawarkan.' }, { status: 400 });
    }

    if (offeredItemIds.length > 10) {
      return NextResponse.json({ error: 'Maksimal 10 item yang dapat dikirim dalam satu trade.' }, { status: 400 });
    }

    if (senderId === receiverId) {
      return NextResponse.json({ error: 'Tidak bisa melakukan trade dengan diri sendiri.' }, { status: 400 });
    }

    const userItems = await prisma.userItem.findMany({
      where: {
        id: { in: offeredItemIds },
        userId: senderId,
        status: 'active',
      }
    });

    if (userItems.length !== offeredItemIds.length) {
      return NextResponse.json({ error: 'Satu atau lebih kartu tidak valid, tidak dimiliki, atau sedang dalam proses trade lain.' }, { status: 400 });
    }

    const trade = await prisma.$transaction(async (tx) => {
      await tx.userItem.updateMany({
        where: { id: { in: offeredItemIds } },
        data: { status: 'locked_for_trade' }
      });

      const newTrade = await tx.trade.create({
        data: {
          senderId,
          receiverId,
          status: 'PENDING',
          items: {
            create: offeredItemIds.map(itemId => ({
              userItemId: itemId,
              side: 'SENDER'
            }))
          }
        }
      });

      return newTrade;
    });

    return NextResponse.json({ success: true, trade });

  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
