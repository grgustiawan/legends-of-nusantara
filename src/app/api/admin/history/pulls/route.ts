import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserRole } from '@/app/actions/auth';

export async function GET(request: NextRequest) {
  try {
    const role = await getSessionUserRole();
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const rarity = searchParams.get('rarity') || 'all';

    const skip = (page - 1) * limit;

    let userIdsFromSearch: string[] | null = null;
    if (search) {
      const users = await prisma.user.findMany({
        where: {
          username: { contains: search, mode: 'insensitive' }
        },
        select: { id: true }
      });
      userIdsFromSearch = users.map(u => u.id);
    }

    let itemIdsFromRarity: string[] | null = null;
    if (rarity !== 'all') {
      const items = await prisma.item.findMany({
        where: {
          rarity: rarity as any
        },
        select: { id: true }
      });
      itemIdsFromRarity = items.map(i => i.id);
    }

    const where: any = {};

    if (userIdsFromSearch !== null) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { userId: { in: userIdsFromSearch } }
      ];
    } else if (search) {
      where.id = { contains: search, mode: 'insensitive' };
    }

    if (itemIdsFromRarity !== null) {
      where.itemId = { in: itemIdsFromRarity };
    }

    const total = await prisma.pull.count({ where });

    const pulls = await prisma.pull.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const userIds = [...new Set(pulls.map(p => p.userId))];
    const itemIds = [...new Set(pulls.map(p => p.itemId))];

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true }
    });

    const items = await prisma.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, rarity: true }
    });

    const userMap = new Map(users.map(u => [u.id, u.username]));
    const itemMap = new Map(items.map(i => [i.id, i]));

    const enrichedPulls = pulls.map(p => {
      const item = itemMap.get(p.itemId);
      return {
        id: p.id,
        userId: p.userId,
        username: userMap.get(p.userId) || p.userId,
        itemName: item?.name || 'Unknown',
        rarity: item?.rarity || 'common',
        coinCost: p.coinCost,
        rollValue: p.rollValue ? Number(p.rollValue).toString() : null,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedPulls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching pulls history:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
