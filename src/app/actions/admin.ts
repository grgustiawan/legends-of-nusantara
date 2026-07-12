'use server';

import prisma from '@/lib/prisma';
import { getSessionUserId, getSessionUserRole } from './auth';
import { uploadFileToMinio } from '@/lib/minio';

export async function saveEvent(formData: FormData) {
  const userId = await getSessionUserId();
  const role = await getSessionUserRole();

  if (role !== 'admin' && role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string | null;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const costPerPull = parseInt((formData.get('costPerPull') as string) || '10');
  const startDate = formData.get('startDate') ? new Date(formData.get('startDate') as string) : null;
  const endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string) : null;
  const status = (formData.get('status') as any) || 'draft';

  const eventImageFile = formData.get('eventImage') as File | null;
  const gachaBackgroundFile = formData.get('gachaBackground') as File | null;
  const showcaseBackgroundFile = formData.get('showcaseBackground') as File | null;
  const cardBackgroundFile = formData.get('cardBackground') as File | null;

  const uploads: Record<string, string | undefined> = {};

  const processFile = async (file: File | null, key: string) => {
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const url = await uploadFileToMinio(fileName, buffer, file.type);
      uploads[key] = url;
    }
  };

  await Promise.all([
    processFile(eventImageFile, 'eventImage'),
    processFile(gachaBackgroundFile, 'gachaBackground'),
    processFile(showcaseBackgroundFile, 'showcaseBackground'),
    processFile(cardBackgroundFile, 'cardBackground'),
  ]);

  const eventData = {
    name,
    description,
    costPerPull,
    startDate,
    endDate,
    status,
    ...uploads
  };

  if (id) {
    await prisma.event.update({
      where: { id },
      data: eventData
    });
  } else {
    await prisma.event.create({
      data: {
        ...eventData,
        createdBy: userId,
      }
    });
  }

  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const role = await getSessionUserRole();
  if (role !== 'admin' && role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const pullCount = await prisma.pull.count({
    where: { eventId }
  });

  if (pullCount > 0) {
    throw new Error('Event cannot be deleted because it has already been pulled by players.');
  }

  await prisma.event.delete({
    where: { id: eventId }
  });

  return { success: true };
}

export async function getItemsByEvent(eventId: string, page: number = 1, limit: number = 10, search: string = '') {
  const role = await getSessionUserRole();
  if (role !== 'admin' && role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const where: any = { eventId };
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: [
        { rarity: 'desc' },
        { name: 'asc' }
      ],
      skip,
      take: limit
    }),
    prisma.item.count({ where })
  ]);

  const itemsWithPlainDecimals = items.map(item => ({
    ...item,
    dropRate: item.dropRate ? parseFloat(item.dropRate.toString()) : 0
  }));

  return {
    data: itemsWithPlainDecimals,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function saveItem(formData: FormData) {
  const role = await getSessionUserRole();
  if (role !== 'admin' && role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string | null;
  const eventId = formData.get('eventId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const rarity = (formData.get('rarity') as any) || 'common';
  const dropRate = parseFloat(formData.get('dropRate') as string) || 0;
  const stockStr = formData.get('stock') as string;
  const stock = stockStr ? parseInt(stockStr) : null;
  const isActive = formData.get('isActive') === 'true';

  const imageFile = formData.get('image') as File | null;
  let imageUrl: string | undefined = undefined;

  if (imageFile && imageFile.size > 0) {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-item-${imageFile.name.replace(/\s+/g, '-')}`;
    imageUrl = await uploadFileToMinio(fileName, buffer, imageFile.type);
  }

  if (!id && !imageUrl) {
    throw new Error('Image is mandatory for new items');
  }

  const itemData: any = {
    eventId,
    name,
    description,
    rarity,
    dropRate,
    stock,
    isActive
  };

  if (imageUrl) {
    itemData.imageUrl = imageUrl;
  }

  if (id) {
    await prisma.item.update({
      where: { id },
      data: itemData
    });
  } else {
    await prisma.item.create({
      data: itemData
    });
  }

  return { success: true };
}
