import AdminItemsClient from './AdminItemsClient';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ItemsPage() {
  const events = await prisma.event.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      name: true,
      status: true
    }
  });

  return <AdminItemsClient events={events} />;
}
