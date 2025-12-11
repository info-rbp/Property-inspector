import fs from 'fs';
import path from 'path';

// Read the HTML file
const htmlContent = fs.readFileSync('./public/index.html', 'utf-8');

// Read the worker file
const workerContent = fs.readFileSync('./dist/_worker.js', 'utf-8');

// Create a new worker that includes the HTML
const newWorkerContent = `
${workerContent}

// Override the root route to serve the full app
const originalFetch = globalThis.fetch;
globalThis.fetch = function(request, ...args) {
  const url = new URL(request.url || request);
  if (url.pathname === '/' && request.method === 'GET') {
    return new Response(\`${htmlContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  }
  return originalFetch(request, ...args);
};
`;

// Write the new worker
fs.writeFileSync('./dist/_worker.js', newWorkerContent);

console.log('Build complete!');