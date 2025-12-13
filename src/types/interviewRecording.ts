export type InterviewRecording = {
  id: string;
  candidateId: string;
  candidateName?: string;
  interviewId: string;
  url: string;
  durationSeconds?: number;
  createdAt?: string;
};

export type InterviewRecordingCreate = Omit<InterviewRecording, 'id' | 'createdAt'>;
export type InterviewRecordingUpdate = Partial<Omit<InterviewRecording, 'id'>> & { id: string };
