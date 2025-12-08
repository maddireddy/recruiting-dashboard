import { create } from 'zustand';
import type { AvailabilityLinkResponse, BookedSlotResponse } from '../api/schedulingApi';

interface SchedulingState {
  availabilityLinks: AvailabilityLinkResponse[];
  bookedSlots: BookedSlotResponse[];
  loading: boolean;
  error: string | null;
  setAvailabilityLinks: (links: AvailabilityLinkResponse[]) => void;
  setBookedSlots: (slots: BookedSlotResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSchedulingStore = create<SchedulingState>((set) => ({
  availabilityLinks: [],
  bookedSlots: [],
  loading: false,
  error: null,
  setAvailabilityLinks: (links) => set({ availabilityLinks: links }),
  setBookedSlots: (slots) => set({ bookedSlots: slots }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
