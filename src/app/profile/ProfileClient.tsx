'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';
import { usePoints } from '@/hooks/usePoints';
import PurpleParticles from '@/components/PurpleParticles';
import BackgroundMusic from '@/components/BackgroundMusic';
import { logout } from '@/app/actions/auth';
import { updatePassword, updateProfileImage } from '@/app/actions/profile';

export default function ProfileClient({ user }: { user: any }) {
  const { points } = usePoints();
  const [activeTab, setActiveTab] = useState<'profil' | 'riwayat_poin' | 'gacha_history'>('profil');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [pageTopup, setPageTopup] = useState(1);
  const [totalPagesTopup, setTotalPagesTopup] = useState(1);

  const [gachaHistory, setGachaHistory] = useState<any[]>([]);
  const [isLoadingGacha, setIsLoadingGacha] = useState(false);
  const [pageGacha, setPageGacha] = useState(1);
  const [totalPagesGacha, setTotalPagesGacha] = useState(1);
  const [profileImg, setProfileImg] = useState(user?.profileImage || '/images/13_Airlangga.jpeg');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await updateProfileImage(formData);
      if (res.success && res.url) {
        setProfileImg(res.url);
        window.dispatchEvent(new Event('profile_updated'));
      }
    } catch (err: any) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'riwayat_poin') {
      setIsLoadingHistory(true);
      fetch(`/api/profile/topups?page=${pageTopup}&limit=10`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setTransactions(data.data);
            setTotalPagesTopup(data.totalPages || 1);
          } else if (Array.isArray(data)) {
            setTransactions(data);
          }
        })
        .finally(() => setIsLoadingHistory(false));
    } else if (activeTab === 'gacha_history') {
      setIsLoadingGacha(true);
      fetch(`/api/profile/gacha-history?page=${pageGacha}&limit=10`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setGachaHistory(data.data);
            setTotalPagesGacha(data.totalPages || 1);
          } else if (Array.isArray(data)) {
            setGachaHistory(data);
          }
        })
        .finally(() => setIsLoadingGacha(false));
    }
  }, [activeTab, pageTopup, pageGacha]);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      await updatePassword(oldPassword, newPassword);
      setMessage('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '-';

  return (
    <div className={styles.pageContainer}>
      <PurpleParticles />
      <BackgroundMusic src="/sounds/background-music-4.mp3" volume={1} />
      <div style={{ position: 'relative', zIndex: 3 }}>
        <Navbar />
      </div>

      <main className={styles.mainContent}>
        <aside className={styles.sidebar}>
          <div className={styles.avatarWrapper} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-upload')?.click()}>
            <img src={profileImg} alt="Avatar" className={styles.avatar} style={{ opacity: isUploading ? 0.5 : 1 }} />
            {isUploading && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold' }}>...</div>
            )}
            <input type="file" id="avatar-upload" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          </div>
          <h2 className={styles.username}>{user?.username || 'User'}</h2>
          <div className={styles.points}>{points.toLocaleString('id-ID')} PT</div>

          <div className={styles.menuList}>
            <button
              className={`${styles.menuItem} ${activeTab === 'profil' ? styles.active : ''}`}
              onClick={() => setActiveTab('profil')}
            >
              Profile (Personal Data)
            </button>
            <button
              className={`${styles.menuItem} ${activeTab === 'riwayat_poin' ? styles.active : ''}`}
              onClick={() => setActiveTab('riwayat_poin')}
            >
              Points History
            </button>
            <button
              className={`${styles.menuItem} ${activeTab === 'gacha_history' ? styles.active : ''}`}
              onClick={() => setActiveTab('gacha_history')}
            >
              Gacha History
            </button>

            <form action={logout} style={{ width: '100%', marginTop: '20px' }}>
              <button type="submit" className={styles.menuItem} style={{ width: '100%', color: '#f87171' }}>
                Logout
              </button>
            </form>
          </div>
        </aside>

        <section className={styles.contentArea}>
          {activeTab === 'profil' ? (
            <div className={styles.formContainer}>
              <div className={styles.profileInfo}>
                <h2 style={{ marginBottom: '10px' }}>Account Information</h2>
                <p style={{ color: '#cbd5e1' }}>Email: {user?.email || '-'}</p>
                <p style={{ color: '#cbd5e1' }}>Joined: {joinDate}</p>
              </div>

              <h2 style={{ marginBottom: '20px' }}>Change Password</h2>
              <form onSubmit={handleUpdatePassword}>
                <div className={styles.formGroup}>
                  <label>Current Password</label>
                  <input
                    type="password"
                    className={styles.formInput}
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <input
                    type="password"
                    className={styles.formInput}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className={styles.formInput}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {message && (
                  <p style={{
                    color: message.includes('successfully') ? '#4ade80' : '#f87171',
                    marginBottom: '15px'
                  }}>
                    {message}
                  </p>
                )}
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Update Password'}
                </button>
              </form>
            </div>
          ) : activeTab === 'riwayat_poin' ? (
            <>
              {isLoadingHistory ? (
                <div className={styles.loader}></div>
              ) : (
                <>
                  <table className={styles.tableContainer}>
                    <thead>
                      <tr className={styles.tableHeader}>
                        <th>Type</th>
                        <th>Date ⇅</th>
                        <th>Points ⇅</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className={styles.tableRow}>
                          <td>
                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                              {tx.type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>{new Date(tx.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                          <td style={{ color: '#4ade80', fontWeight: 'bold' }}>
                            +{tx.amount}
                          </td>
                          <td>{tx.description || '-'}</td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            No points top up history
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {totalPagesTopup > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.pageBtn}
                        disabled={pageTopup === 1}
                        style={{ opacity: pageTopup === 1 ? 0.5 : 1, cursor: pageTopup === 1 ? 'not-allowed' : 'pointer' }}
                        onClick={() => setPageTopup(prev => Math.max(1, prev - 1))}
                      >
                        &lt;
                      </button>
                      <span style={{ margin: '0 10px', fontSize: '0.9rem', color: '#cbd5e1' }}>Page {pageTopup} of {totalPagesTopup}</span>
                      <button
                        className={styles.pageBtn}
                        disabled={pageTopup === totalPagesTopup}
                        style={{ opacity: pageTopup === totalPagesTopup ? 0.5 : 1, cursor: pageTopup === totalPagesTopup ? 'not-allowed' : 'pointer' }}
                        onClick={() => setPageTopup(prev => Math.min(totalPagesTopup, prev + 1))}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {isLoadingGacha ? (
                <div className={styles.loader}></div>
              ) : (
                <>
                  <table className={styles.tableContainer}>
                    <thead>
                      <tr className={styles.tableHeader}>
                        <th>Card Name</th>
                        <th>Rarity</th>
                        <th>Points Used</th>
                        <th>Date ⇅</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gachaHistory.map((pull, idx) => (
                        <tr key={pull.id || idx} className={styles.tableRow}>
                          <td style={{ fontWeight: '500' }}>{pull.itemName}</td>
                          <td>
                            <span className={`${styles.badge} ${pull.rarity === 'legendary' ? styles.badgeLegendary :
                              pull.rarity === 'epic' ? styles.badgeEpic :
                                pull.rarity === 'rare' ? styles.badgeRare : styles.badgeCommon
                              }`}>
                              {pull.rarity === 'legendary' ? 'SSR' :
                                pull.rarity === 'epic' ? 'SR' :
                                  pull.rarity === 'rare' ? 'R' : 'N'}
                            </span>
                          </td>
                          <td style={{ color: '#f87171', fontWeight: 'bold' }}>
                            -{pull.coinCost}
                          </td>
                          <td>{new Date(pull.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                        </tr>
                      ))}
                      {gachaHistory.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            No gacha history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {totalPagesGacha > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.pageBtn}
                        disabled={pageGacha === 1}
                        style={{ opacity: pageGacha === 1 ? 0.5 : 1, cursor: pageGacha === 1 ? 'not-allowed' : 'pointer' }}
                        onClick={() => setPageGacha(prev => Math.max(1, prev - 1))}
                      >
                        &lt;
                      </button>
                      <span style={{ margin: '0 10px', fontSize: '0.9rem', color: '#cbd5e1' }}>Page {pageGacha} of {totalPagesGacha}</span>
                      <button
                        className={styles.pageBtn}
                        disabled={pageGacha === totalPagesGacha}
                        style={{ opacity: pageGacha === totalPagesGacha ? 0.5 : 1, cursor: pageGacha === totalPagesGacha ? 'not-allowed' : 'pointer' }}
                        onClick={() => setPageGacha(prev => Math.min(totalPagesGacha, prev + 1))}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
