import AdminEventsClient from './AdminEventsClient';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return <AdminEventsClient events={events} />;
}
