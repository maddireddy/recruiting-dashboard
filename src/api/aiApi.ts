import api from '../services/api';

export type JDAssistRequest = {
  prompt: string;
  jobId?: string;
};

export type JDAssistResponse = {
  content: string;
  tokensUsed?: number;
};

export const aiApi = {
  jdAssist: async (payload: JDAssistRequest): Promise<JDAssistResponse> => {
    const { data } = await api.post('/ai/jd-assist', payload);
    return data;
  },
};
