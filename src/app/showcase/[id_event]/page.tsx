import ShowcaseClient from '../ShowcaseClient';
import { getItemsByEvent, getEventById } from '@/app/actions/gacha';
import { getSessionUserId } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function ShowcasePageWrapper({ params }: { params: Promise<{ id_event: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/menu');
  }

  const { id_event } = await params;
  const event = await getEventById(id_event);
  
  if (!event) {
    return <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>Event not found.</div>;
  }

  const items = await getItemsByEvent(id_event);

  return (
    <ShowcaseClient cardsData={items} showcaseBackground={event.showcaseBackground} cardBackground={event.cardBackground} />
  );
}
