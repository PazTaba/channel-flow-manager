
import { setupWorker } from 'msw/browser';

// Create an empty handlers array as a temporary workaround
const handlers = [];

export const worker = setupWorker(...handlers);
