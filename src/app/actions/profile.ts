'use server';

import prisma from '@/lib/prisma';
import { getSessionUserId } from './auth';
import * as bcrypt from 'bcryptjs';
import { uploadFileToMinio } from '@/lib/minio';

export async function getUserProfile() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      email: true,
      createdAt: true,
      profileImage: true,
    }
  });
  return user;
}

export async function getPointHistory() {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const transactions = await prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return transactions.map(tx => ({
    ...tx,
    amount: tx.amount.toString(),
    balanceBefore: tx.balanceBefore.toString(),
    balanceAfter: tx.balanceAfter.toString(),
  }));
}

export async function updatePassword(oldPassword: string, newPassword: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error('Not logged in');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValid) throw new Error('Password lama salah');

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash }
  });

  return { success: true };
}

export async function updateProfileImage(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error('Not logged in');

  const file = formData.get('image') as File;
  if (!file) throw new Error('No file uploaded');

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExtension = file.name.split('.').pop() || 'png';
  const fileName = `profiles/${userId}-${Date.now()}.${fileExtension}`;

  const url = await uploadFileToMinio(fileName, buffer, file.type);

  await prisma.user.update({
    where: { id: userId },
    data: { profileImage: url }
  });

  return { success: true, url };
}
