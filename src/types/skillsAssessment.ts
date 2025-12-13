export type SkillsAssessment = {
  id: string;
  name: string;
  description?: string;
  skillArea: string;
  totalQuestions?: number;
  averageScore?: number;
  createdAt?: string;
};

export type SkillsAssessmentCreate = Omit<SkillsAssessment, 'id' | 'createdAt' | 'averageScore'>;
export type SkillsAssessmentUpdate = Partial<Omit<SkillsAssessment, 'id'>> & { id: string };
 
