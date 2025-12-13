export type InterviewGuide = {
  id: string;
  name: string;
  role?: string;
  sections: Array<{ title: string; questions: string[] }>;
  createdAt?: string;
};

export type InterviewGuideCreate = Omit<InterviewGuide, 'id' | 'createdAt'>;
export type InterviewGuideUpdate = Partial<Omit<InterviewGuide, 'id'>> & { id: string };
