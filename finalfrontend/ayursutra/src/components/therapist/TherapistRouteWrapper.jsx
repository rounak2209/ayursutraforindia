
import React, { useEffect, useState } from 'react';
import TherapistProfileForm from './TherapistProfileForm';
import TherapistDashboard from './TherapistDashboard'; 
import { apiGet } from '@/lib/api';

const TherapistRouteWrapper = () => {
  const [checking, setChecking] = useState(true);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    (async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) { window.location.href = '/login'; return; }
      try {
        const profile = await apiGet(`/api/therapists/profile/${userId}`);
        setComplete(profile?.profileStatus === 'completed');
      } catch (err) {
        setComplete(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!complete) return <TherapistProfileForm onProfileComplete={() => setComplete(true)} />;
  return <TherapistDashboard />;
};

export default TherapistRouteWrapper;
