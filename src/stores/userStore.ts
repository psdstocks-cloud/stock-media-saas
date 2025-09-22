import { create } from 'zustand';
import { toast } from 'react-hot-toast';

interface UserState {
  points: number | null;
  isLoading: boolean;
  fetchPoints: () => Promise<void>;
  updatePoints: (newPoints: number) => void;
}

const useUserStore = create<UserState>((set) => ({
  points: null, // Default to null to show a loading state
  isLoading: false,
  fetchPoints: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/points');
      if (!response.ok) throw new Error('Failed to fetch points');
      const data = await response.json();
      set({ points: data.points, isLoading: false });
    } catch (error) {
      console.error(error);
      toast.error('Could not load your points balance.');
      set({ points: 0, isLoading: false });
    }
  },
  updatePoints: (newPoints: number) => {
    set({ points: newPoints });
  },
}));

export default useUserStore;