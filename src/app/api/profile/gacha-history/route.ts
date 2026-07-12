import { NextRequest, NextResponse } from 'next/server';
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

    const totalRes: any[] = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM gacha.pulls WHERE user_id = $1::uuid
    `, userId);
    
    const total = Number(totalRes[0].count);
    const totalPages = Math.ceil(total / limit);

    const pulls: any[] = await prisma.$queryRawUnsafe(`
      SELECT p.id, p.created_at as "createdAt", i.name as "itemName", i.rarity as "rarity", p.coin_cost as "coinCost"
      FROM gacha.pulls p
      JOIN gacha.items i ON i.id = p.item_id
      WHERE p.user_id = $1::uuid
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, userId, limit, skip);

    return NextResponse.json({ data: pulls, totalPages });
  } catch (error) {
    console.error('Error fetching gacha history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
