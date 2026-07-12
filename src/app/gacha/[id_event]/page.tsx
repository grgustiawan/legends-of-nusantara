import { getEventById, getUserWallet, getUserInventory } from '@/app/actions/gacha';
import GachaClient from '../GachaClient';
import { redirect } from 'next/navigation';
import { getSessionUserId } from '@/app/actions/auth';

export default async function GachaPageWrapper({ params }: { params: Promise<{ id_event: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/menu');
  }

  const { id_event } = await params;
  const event = await getEventById(id_event);
  const points = await getUserWallet();
  const inventory = await getUserInventory(id_event);

  if (!event) {
    return (
      <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
        <h1>Tidak Ada Event Gacha Aktif</h1>
      </div>
    );
  }

  return (
    <GachaClient event={event} inventory={inventory} initialPoints={points || 0} />
  );
}
