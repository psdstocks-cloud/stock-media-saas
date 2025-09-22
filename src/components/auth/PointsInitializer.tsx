'use client';
import { useEffect } from 'react';
import useUserStore from '@/stores/userStore';

export default function PointsInitializer() {
  const { fetchPoints } = useUserStore();
  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);
  return null;
}