'use server';

import prisma from '@/lib/prisma';
import { getSessionUserId } from './auth';
import crypto from 'node:crypto';
import { headers } from 'next/headers';

export async function getEventById(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      items: {
        orderBy: [
          { rarity: 'desc' },
          { name: 'asc' }
        ]
      }
    }
  });
  if (!event) return null;

  return {
    ...event,
    items: event.items.map(item => ({
      ...item,
      dropRate: Number(item.dropRate)
    }))
  };
}

export async function getAllEvents() {
  const events = await prisma.event.findMany({
    where: { status: 'active' },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return events;
}

export async function getActiveEvent() {
  const event = await prisma.event.findFirst({
    where: { status: 'active' },
    include: {
      items: {
        orderBy: [
          { rarity: 'desc' },
          { name: 'asc' }
        ]
      }
    }
  });
  if (!event) return null;

  return {
    ...event,
    items: event.items.map(item => ({
      ...item,
      dropRate: Number(item.dropRate)
    }))
  };
}

export async function getUserWallet() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  return wallet ? Number(wallet.balance) : 0;
}

export async function executeGachaPull(eventId: string, count: number) {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const eventCheck = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { items: { where: { isActive: true } } }
      }
    }
  });

  if (!eventCheck) {
    throw new Error("Event tidak ditemukan");
  }

  if (eventCheck._count.items === 0) {
    throw new Error("Event ini belum memiliki item aktif. Transaksi dibatalkan (rollback).");
  }

  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const userAgent = headersList.get('user-agent') || 'Next.js App';

  const results = [];

  let currentBalance = 0;
  for (let i = 0; i < count; i++) {
    const idempotencyKey = crypto.randomUUID();

    const pullResult: any[] = await prisma.$queryRawUnsafe(`
      SELECT ep.pull_id as "pullId", ep.item_id as "itemId", ep.item_name as "itemName", ep.new_balance as "newBalance", 
             i.image_url as "imageUrl", i.rarity as "rarity"
      FROM gacha.execute_pull(
        $1::uuid, 
        $2::uuid, 
        $3::uuid, 
        $4::inet, 
        $5::text
      ) ep
      JOIN gacha.items i ON i.id = ep.item_id
    `, userId, eventId, idempotencyKey, ip, userAgent);

    if (pullResult && pullResult.length > 0) {
      const row = pullResult[0];
      results.push({
        id: row.pullId,
        itemId: row.itemId,
        name: row.itemName,
        image: row.imageUrl,
        rarity: row.rarity,
        pullId: i
      });
      currentBalance = Number(row.newBalance);
    }
  }

  return { items: results, newBalance: currentBalance };
}

export async function getUserInventory(eventId?: string) {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const whereClause: any = { userId, status: 'active' };
  if (eventId) {
    whereClause.item = { eventId };
  }

  const userItems = await (prisma as any).userItem.findMany({
    where: whereClause,
    include: {
      item: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return userItems.map((ui: any) => ({
    id: ui.id,
    itemId: ui.item.id,
    title: ui.item.name,
    imagePath: ui.item.imageUrl || '/images/card_background.png',
    rarity: ui.item.rarity === 'legendary' ? 'SSR' :
      ui.item.rarity === 'epic' ? 'SR' :
        ui.item.rarity === 'rare' ? 'R' : 'N',
    category: 'Gacha Item',
    acquiredAt: ui.createdAt.toISOString()
  }));
}

export async function getItemsByEvent(eventId: string) {
  const items = await prisma.item.findMany({
    where: { eventId: eventId },
    orderBy: {
      id: 'asc'
    }
  });

  return items.map(item => ({
    id: item.id,
    title: item.name,
    imagePath: item.imageUrl || '/images/card_background.png',
    rarity: item.rarity === 'legendary' ? 'SSR' :
      item.rarity === 'epic' ? 'SR' :
        item.rarity === 'rare' ? 'R' : 'N',
    category: 'Karakter',
    lore: item.description || ''
  }));
}

export async function getAllItems() {
  const items = await prisma.item.findMany({
    orderBy: {
      id: 'asc'
    }
  });

  return items.map(item => ({
    id: item.id,
    title: item.name,
    imagePath: item.imageUrl || '/images/card_background.png',
    rarity: item.rarity === 'legendary' ? 'SSR' :
      item.rarity === 'epic' ? 'SR' :
        item.rarity === 'rare' ? 'R' : 'N',
    category: 'Karakter',
    lore: item.description || ''
  }));
}
