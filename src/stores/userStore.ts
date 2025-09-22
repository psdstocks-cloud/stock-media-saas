import { create } from 'zustand';
import { toast } from 'react-hot-toast';

interface UserState {
  points: number | null;
  fetchPoints: () => Promise<void>;
  updatePoints: (newPoints: number) => void;
}

const useUserStore = create<UserState>((set) => ({
  points: null, // Default to null to show a loading state
  fetchPoints: async () => {
    try {
      const response = await fetch('/api/points');
      if (!response.ok) throw new Error('Failed to fetch points');
      const data = await response.json();
      set({ points: data.points });
    } catch (error) {
      console.error(error);
      toast.error('Could not load your points balance.');
      set({ points: 0 });
    }
  },
  updatePoints: (newPoints: number) => {
    set({ points: newPoints });
  },
}));

export default useUserStore;