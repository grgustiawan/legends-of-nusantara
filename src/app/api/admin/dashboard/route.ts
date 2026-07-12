import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserRole } from '@/app/actions/auth';

export async function GET() {
  try {
    const role = await getSessionUserRole();
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pulls = await prisma.pull.aggregate({
      _sum: { coinCost: true },
      _count: { id: true },
    });

    const totalCoinsSpent = pulls._sum.coinCost || 0;
    const totalPemasukan = (totalCoinsSpent * 100).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pulls24h = await prisma.pull.count({
      where: {
        createdAt: { gte: oneDayAgo },
      },
    });

    const activeUsersCount = await prisma.user.count({
      where: { status: 'active', role: 'user' },
    });

    const activeEventsCount = await prisma.event.count({
      where: { status: 'active' },
    });

    const totalPointTransactions = await prisma.pointTopupRequest.count({
      where: { status: 'SUCCESS' }
    });

    const totalItems = await prisma.item.count();

    const recentPullsRaw = await prisma.pull.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        itemId: true,
        coinCost: true,
        rollValue: true,
        createdAt: true,
      }
    });

    const userIds = recentPullsRaw.map(p => p.userId);
    const itemIds = recentPullsRaw.map(p => p.itemId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true }
    });

    const items = await prisma.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, rarity: true, imageUrl: true }
    });

    const userMap = new Map();
    users.forEach(u => userMap.set(u.id, u.username));

    const itemMap = new Map();
    items.forEach(i => itemMap.set(i.id, i));

    const recentPulls = recentPullsRaw.map(p => {
      const item = itemMap.get(p.itemId);
      return {
        id: p.id,
        username: userMap.get(p.userId) || p.userId,
        itemName: item?.name || 'Unknown',
        rarity: item?.rarity || 'common',
        imageUrl: item?.imageUrl || '/gacha-screen.jpeg',
        rollValue: p.rollValue ? Number(p.rollValue).toFixed(4) : '-',
        createdAt: p.createdAt,
      };
    });

    const topEventAgg = await prisma.pull.groupBy({
      by: ['eventId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 1,
    });

    let topEvent = null;
    if (topEventAgg.length > 0 && topEventAgg[0].eventId) {
      const eventDetails = await prisma.event.findUnique({
        where: { id: topEventAgg[0].eventId },
      });
      if (eventDetails) {
        topEvent = {
          ...eventDetails,
          totalPulls: topEventAgg[0]._count.id,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalPemasukan,
        totalPulls: pulls._count.id || 0,
        pulls24h,
        activeUsers: activeUsersCount,
        activeEvents: activeEventsCount,
        totalPointTransactions,
        totalItems,
        recentPulls,
        topEvent
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
