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
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        profileImage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.id === userId) {
      return NextResponse.json({ error: 'Cannot trade with yourself' }, { status: 400 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in user search:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
