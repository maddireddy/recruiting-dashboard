import api from './api';

export interface AnalyticsSummary {
  totalCandidates: number;
  benchCandidates: number;
  placedCandidates: number;
  openJobs: number;
  closedJobs: number;
  totalSubmissions: number;
}

export interface SubmissionPipeline {
  [stage: string]: number;
}

/**
 * Analytics Service
 * Provides abstraction for analytics and dashboard data
 */
class AnalyticsService {
  /**
   * Get dashboard summary statistics
   */
  async getSummary(): Promise<AnalyticsSummary> {
    const response = await api.get<AnalyticsSummary>('/analytics/summary');
    return response.data;
  }

  /**
   * Get submission pipeline data
   */
  async getSubmissionPipeline(): Promise<SubmissionPipeline> {
    const response = await api.get<SubmissionPipeline>('/analytics/submission-pipeline');
    return response.data;
  }

  /**
   * Get time series data for dashboard charts
   */
  async getTimeSeries(
    metric: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ date: string; value: number }>> {
    const response = await api.get('/analytics/time-series', {
      params: { metric, startDate, endDate },
    });
    return response.data;
  }

  /**
   * Get recruiter performance metrics
   */
  async getRecruiterMetrics(recruiterId?: string) {
    const response = await api.get('/analytics/recruiter-metrics', {
      params: recruiterId ? { recruiterId } : undefined,
    });
    return response.data;
  }

  /**
   * Get pipeline health metrics
   */
  async getPipelineHealth() {
    const response = await api.get('/analytics/pipeline-health');
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
