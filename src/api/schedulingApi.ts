import api from '../services/api';

export interface CreateAvailabilityLinkRequest {
  title: string;
  duration: number;
  bufferTime: number;
  timezone: string;
  availability: Record<string, TimeSlot[]>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  maxBookingsPerDay: number;
  customMessage?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface AvailabilityLinkResponse {
  id: string;
  linkId: string;
  publicUrl: string;
  title: string;
  duration: number;
  timezone: string;
  isActive: boolean;
  totalBookings: number;
  createdAt: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
  isAvailable: boolean;
}

export interface BookSlotRequest {
  linkId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  startTime: string;
  timezone: string;
  notes?: string;
}

export interface BookedSlotResponse {
  id: string;
  candidateName: string;
  candidateEmail: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: string;
  meetingLink: string;
  createdAt: string;
}

export const schedulingApi = {
  // Create scheduling link
  createAvailabilityLink: async (data: CreateAvailabilityLinkRequest): Promise<AvailabilityLinkResponse> => {
    const response = await api.post('/scheduling/availability', data);
    return response.data;
  },

  // Get available slots (public endpoint)
  getAvailableSlots: async (linkId: string, date: string, timezone: string): Promise<AvailableSlot[]> => {
    const response = await api.post('/scheduling/available-slots', {
      linkId,
      date,
      timezone,
    });
    return response.data;
  },

  // Book a slot (public endpoint)
  bookSlot: async (data: BookSlotRequest): Promise<BookedSlotResponse> => {
    const response = await api.post('/scheduling/book', data);
    return response.data;
  },

  // Get my bookings (authenticated)
  getMyBookings: async (): Promise<BookedSlotResponse[]> => {
    const response = await api.get('/scheduling/my-bookings');
    return response.data;
  },

  // Get my availability links (authenticated)
  getMyLinks: async (): Promise<AvailabilityLinkResponse[]> => {
    const response = await api.get('/scheduling/my-links');
    return response.data;
  },
};
