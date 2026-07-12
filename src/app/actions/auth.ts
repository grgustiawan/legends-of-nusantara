'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma';

import bcrypt from 'bcryptjs';

export async function loginAsPlayer(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email) {
    return { error: "Email is required." };
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || user.role !== 'user') {
    return { error: "Invalid email/password" };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return { error: "Invalid email/password" };

  const cookieStore = await cookies();
  cookieStore.set('auth_role', 'player', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  cookieStore.set('user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  redirect('/menu');
}

export async function registerAsPlayer(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!username || !email || !password) {
    return { error: 'All fields are required.' };
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return { error: 'Username or Email is already taken.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'user',
        status: 'active'
      }
    });

    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: BigInt(500)
      }
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: user.id,
        sequence: BigInt(1),
        type: 'REGISTRATION_BONUS',
        direction: 'CREDIT',
        amount: BigInt(500),
        balanceBefore: BigInt(0),
        balanceAfter: BigInt(500),
        referenceType: 'system',
        description: 'Registration Bonus',
        prevHash: '0000000000000000000000000000000000000000000000000000000000000000'
      }
    });

    const cookieStore = await cookies();
    cookieStore.set('auth_role', 'player', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: 'An error occurred during registration.' };
  }

  redirect('/menu');
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('user_id')?.value;
}

export async function getSessionUserRole() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_role')?.value;
}

export async function loginAsAdmin(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email) {
    return { error: "Email is required." };
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || user.role !== 'admin') {
    return { error: "Invalid email/password" };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return { error: "Invalid email/password" };

  const cookieStore = await cookies();
  cookieStore.set('auth_role', 'admin', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  cookieStore.set('user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  redirect('/admin');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_role');
  cookieStore.delete('user_id');
  redirect('/');
}
