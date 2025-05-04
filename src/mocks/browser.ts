
import { setupWorker } from 'msw/browser';

// Temporary fix for missing handlers
const handlers = [];

export const worker = setupWorker(...handlers);
