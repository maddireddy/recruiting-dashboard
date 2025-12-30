/**
 * AI Service
 *
 * Provides AI-powered functionality for the recruiting platform:
 * - Job description generation
 * - Resume parsing and analysis
 * - Candidate matching recommendations
 * - Interview question generation
 * - Boolean search suggestions
 */

import api from './api';

export interface JobDescriptionGenerateRequest {
  jobTitle: string;
  department?: string;
  level?: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  location?: string;
  remotePolicy?: 'remote' | 'hybrid' | 'onsite';
  keyRequirements?: string[];
  companyDescription?: string;
  tone?: 'professional' | 'casual' | 'enthusiastic';
}

export interface ResumeParseRequest {
  resumeUrl: string;
  candidateId?: string;
}

export interface CandidateMatchRequest {
  jobId: string;
  candidateIds?: string[];
  topN?: number;
}

export interface InterviewQuestionsRequest {
  jobTitle: string;
  skills: string[];
  level?: string;
  questionCount?: number;
}

export interface BooleanSearchSuggestionRequest {
  jobTitle?: string;
  skills?: string[];
  location?: string;
}

class AIService {
  /**
   * Generate a job description using AI
   */
  async generateJobDescription(request: JobDescriptionGenerateRequest): Promise<string> {
    try {
      const response = await api.post('/ai/generate-jd', request);
      return response.data.content || response.data.description || '';
    } catch (error) {
      console.error('[AI Service] Job description generation failed:', error);

      // Fallback to a template-based generation (client-side)
      return this.generateJobDescriptionFallback(request);
    }
  }

  /**
   * Parse resume and extract structured data
   */
  async parseResume(request: ResumeParseRequest) {
    try {
      const response = await api.post('/ai/parse-resume', request);
      return response.data;
    } catch (error) {
      console.error('[AI Service] Resume parsing failed:', error);
      throw new Error('Resume parsing is currently unavailable');
    }
  }

  /**
   * Get candidate matching scores for a job
   */
  async matchCandidates(request: CandidateMatchRequest) {
    try {
      const response = await api.post('/ai/match-candidates', request);
      return response.data.matches || [];
    } catch (error) {
      console.error('[AI Service] Candidate matching failed:', error);
      return [];
    }
  }

  /**
   * Generate interview questions
   */
  async generateInterviewQuestions(request: InterviewQuestionsRequest) {
    try {
      const response = await api.post('/ai/generate-interview-questions', request);
      return response.data.questions || [];
    } catch (error) {
      console.error('[AI Service] Interview question generation failed:', error);

      // Fallback to predefined questions
      return this.getGenericInterviewQuestions(request);
    }
  }

  /**
   * Get boolean search suggestions
   */
  async suggestBooleanSearch(request: BooleanSearchSuggestionRequest): Promise<string[]> {
    try {
      const response = await api.post('/ai/suggest-boolean-search', request);
      return response.data.suggestions || [];
    } catch (error) {
      console.error('[AI Service] Boolean search suggestion failed:', error);

      // Fallback to basic boolean search patterns
      return this.getBooleanSearchFallback(request);
    }
  }

  /**
   * Client-side fallback for job description generation
   */
  private generateJobDescriptionFallback(request: JobDescriptionGenerateRequest): string {
    const { jobTitle, level = 'mid', department = 'General', location, remotePolicy } = request;

    const levelText = {
      junior: 'Entry-level',
      mid: 'Mid-level',
      senior: 'Senior',
      lead: 'Lead',
      executive: 'Executive'
    }[level];

    const remotePolicyText = remotePolicy === 'remote'
      ? ' (Remote)'
      : remotePolicy === 'hybrid'
      ? ' (Hybrid)'
      : location ? ` (${location})` : '';

    return `# ${levelText} ${jobTitle}${remotePolicyText}

## About the Role

We are seeking a talented ${levelText} ${jobTitle} to join our ${department} team. This is an exciting opportunity to work on challenging projects and make a significant impact on our organization.

## Responsibilities

- Design, develop, and maintain high-quality software solutions
- Collaborate with cross-functional teams to deliver exceptional results
- Participate in code reviews and contribute to technical discussions
- Mentor junior team members and share knowledge
- Stay current with industry trends and best practices

## Required Qualifications

- ${level === 'junior' ? '1-2' : level === 'mid' ? '3-5' : level === 'senior' ? '5-8' : '8+' } years of professional experience
- Strong problem-solving and analytical skills
- Excellent communication and teamwork abilities
- Passion for technology and continuous learning
${request.keyRequirements ? request.keyRequirements.map(req => `- ${req}`).join('\n') : ''}

## Preferred Qualifications

- Bachelor's degree in Computer Science or related field
- Experience with modern development practices (CI/CD, TDD, Agile)
- Contributions to open-source projects

## What We Offer

- Competitive salary and benefits package
- Professional development opportunities
- Collaborative and innovative work environment
- Work-life balance and flexible schedule${remotePolicy === 'remote' ? '\n- Fully remote work from anywhere' : ''}

## How to Apply

If you're excited about this opportunity and meet the qualifications above, we'd love to hear from you! Please submit your resume and a brief cover letter explaining why you'd be a great fit for this role.

We are an equal opportunity employer and value diversity at our company.
`;
  }

  /**
   * Generic interview questions fallback
   */
  private getGenericInterviewQuestions(request: InterviewQuestionsRequest) {
    const { jobTitle, skills, level = 'mid', questionCount = 10 } = request;

    const questions = [
      `Tell me about your experience as a ${jobTitle}.`,
      `What attracted you to this ${jobTitle} position?`,
      `Describe a challenging project you've worked on recently.`,
      `How do you stay current with industry trends and technologies?`,
      `Tell me about a time you had to collaborate with a difficult team member.`,
      `What's your approach to problem-solving in your work?`,
      `Describe your ideal work environment.`,
      `Where do you see yourself in 3-5 years?`,
      `What's your greatest professional achievement?`,
      `Why should we hire you for this position?`,
      ...skills.slice(0, 5).map(skill => `How would you rate your proficiency in ${skill}? Can you give an example of how you've used it?`),
    ];

    return questions.slice(0, questionCount);
  }

  /**
   * Boolean search fallback
   */
  private getBooleanSearchFallback(request: BooleanSearchSuggestionRequest): string[] {
    const { jobTitle, skills = [], location } = request;
    const suggestions: string[] = [];

    if (jobTitle) {
      suggestions.push(`"${jobTitle}"`);
      suggestions.push(`(${jobTitle} OR "${jobTitle.replace(/\s+/g, '_')}")`);
    }

    if (skills.length > 0) {
      suggestions.push(`(${skills.map(s => `"${s}"`).join(' OR ')})`);
      suggestions.push(`(${skills.slice(0, 3).join(' AND ')})`);
    }

    if (location) {
      suggestions.push(`${suggestions[0] || ''} AND "${location}"`);
    }

    if (skills.length > 0 && jobTitle) {
      suggestions.push(`"${jobTitle}" AND (${skills.slice(0, 3).join(' OR ')})`);
    }

    return suggestions.filter(Boolean);
  }

  /**
   * Check if AI features are available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await api.get('/ai/health');
      return response.data.available === true;
    } catch (error) {
      return false;
    }
  }
}

export const aiService = new AIService();
export default aiService;
