import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup requests interception using the given handlers for browser environment
export const worker = setupWorker(...handlers);
