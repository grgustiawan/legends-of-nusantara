import { getUserProfile } from '@/app/actions/profile';
import ProfileClient from './ProfileClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getUserProfile();
  if (!user) {
    redirect('/');
  }

  return <ProfileClient user={user} />;
}
