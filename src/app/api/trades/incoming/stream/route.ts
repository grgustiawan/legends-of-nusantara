import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/app/actions/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const receiverId = await getSessionUserId();
    if (!receiverId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        const sendUpdate = async () => {
          if (isClosed) return;
          try {
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

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ trades: formattedTrades })}\n\n`));
          } catch (error) {
            console.error('Error fetching incoming trades for SSE:', error);
          }
        };

        await sendUpdate();

        const intervalId = setInterval(sendUpdate, 5000);

        request.signal.addEventListener('abort', () => {
          isClosed = true;
          clearInterval(intervalId);
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
