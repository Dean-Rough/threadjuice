import consoleLogLevel from 'console-log-level';

// Configure structured logging based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'trace';

export const logger = consoleLogLevel({
  level,
  prefix: (level) => `[${new Date().toISOString()}] ${level.toUpperCase()}:`,
});

// Utility functions for common logging patterns
export const logApiRequest = (method: string, url: string, userId?: string) => {
  logger.info('API_REQUEST', { method, url, userId });
};

export const logApiResponse = (method: string, url: string, status: number, duration: number) => {
  logger.info('API_RESPONSE', { method, url, status, duration: `${duration}ms` });
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('ERROR', { 
    message: error.message, 
    stack: error.stack, 
    ...context 
  });
};

export const logRedditApiCall = (endpoint: string, subreddit?: string, rateLimitRemaining?: number) => {
  logger.debug('REDDIT_API', { endpoint, subreddit, rateLimitRemaining });
};

export const logGptRequest = (prompt: string, model: string, tokens?: number) => {
  logger.debug('GPT_REQUEST', { 
    promptLength: prompt.length, 
    model, 
    estimatedTokens: tokens 
  });
};