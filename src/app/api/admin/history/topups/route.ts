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

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { requestNo: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const total = await prisma.pointTopupRequest.count({ where });

    const topupsRaw = await prisma.pointTopupRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true }
        }
      }
    });

    const topups = topupsRaw.map(t => ({
      ...t,
      amountIdr: t.amountIdr.toString(),
      pointAmount: t.pointAmount.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: topups,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching topup history:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
