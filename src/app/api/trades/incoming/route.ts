import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/app/actions/auth';

export async function GET(request: NextRequest) {
  try {
    const receiverId = await getSessionUserId();
    if (!receiverId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trades = await prisma.trade.findMany({
      where: {
        receiverId: receiverId,
        status: 'PENDING'
      },
      include: {
        items: {
          include: {
            userItem: {
              include: {
                item: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const senderIds = Array.from(new Set(trades.map(t => t.senderId)));
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, username: true, profileImage: true }
    });

    const senderMap: Record<string, any> = {};
    senders.forEach(s => { senderMap[s.id] = s; });

    const formattedTrades = trades.map(trade => ({
      ...trade,
      sender: senderMap[trade.senderId] || { username: 'Unknown', profileImage: null }
    }));

    return NextResponse.json({ trades: formattedTrades });

  } catch (error) {
    console.error('Error fetching incoming trades:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
