import MenuClient from './MenuClient';
import { getAllEvents } from '@/app/actions/gacha';
import { getUserProfile } from '@/app/actions/profile';

export const dynamic = 'force-dynamic';

export default async function MainMenu() {
  const events = await getAllEvents();
  const user = await getUserProfile();
  
  return (
    <MenuClient events={events} user={user} />
  );
}
