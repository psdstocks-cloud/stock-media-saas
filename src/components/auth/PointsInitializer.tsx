'use client';

import { useEffect } from 'react';
import useUserStore from '@/stores/userStore';

// This component's only job is to fetch points when the user is logged in.
export default function PointsInitializer() {
  const { fetchPoints } = useUserStore();

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  return null; // This component renders nothing.
}
