/**
 * AI Configuration Utilities
 * Centralized access to AI model settings and capabilities
 */

export interface AIConfig {
  gpt51CodexMaxEnabled: boolean;
  enabledForAllClients: boolean;
  autoSuggestionsEnabled: boolean;
  resumeParserEnabled: boolean;
}

/**
 * Get current AI configuration from localStorage
 */
export function getAIConfig(): AIConfig {
  try {
    return {
      gpt51CodexMaxEnabled: JSON.parse(localStorage.getItem('ai.gpt51CodexMax') || 'true'),
      enabledForAllClients: JSON.parse(localStorage.getItem('ai.modelForAllClients') || 'true'),
      autoSuggestionsEnabled: JSON.parse(localStorage.getItem('ai.autoSuggestions') || 'true'),
      resumeParserEnabled: JSON.parse(localStorage.getItem('ai.resumeParser') || 'true'),
    };
  } catch {
    return {
      gpt51CodexMaxEnabled: true,
      enabledForAllClients: true,
      autoSuggestionsEnabled: true,
      resumeParserEnabled: true,
    };
  }
}

/**
 * Check if GPT-5.1-Codex-Max is enabled for all clients
 */
export function isGPT51CodexMaxEnabled(): boolean {
  const config = getAIConfig();
  return config.gpt51CodexMaxEnabled && config.enabledForAllClients;
}

/**
 * Check if AI auto-suggestions are enabled
 */
export function isAutoSuggestionsEnabled(): boolean {
  const config = getAIConfig();
  return config.gpt51CodexMaxEnabled && config.autoSuggestionsEnabled;
}

/**
 * Check if AI resume parser is enabled
 */
export function isResumeParserEnabled(): boolean {
  const config = getAIConfig();
  return config.gpt51CodexMaxEnabled && config.resumeParserEnabled;
}

/**
 * Get the current AI model name
 */
export function getActiveAIModel(): string {
  return isGPT51CodexMaxEnabled() ? 'GPT-5.1-Codex-Max' : 'Standard';
}
