import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatically inject ngrok bypass header and handle backend URL from environment variables
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  let url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  if (backendUrl) {
    if (url.startsWith('/api')) {
      url = `${backendUrl.replace(/\/$/, '')}${url}`;
    } else if (url.startsWith(window.location.origin + '/api')) {
      url = url.replace(window.location.origin, backendUrl.replace(/\/$/, ''));
    }
  }

  const newInit = { ...(init || {}) };
  const headers = new Headers(newInit.headers || {});
  headers.set('ngrok-skip-browser-warning', 'true');
  newInit.headers = headers;

  if (typeof input === 'string') {
    return originalFetch(url, newInit);
  } else if (input instanceof URL) {
    return originalFetch(new URL(url), newInit);
  } else {
    return originalFetch(new Request(url, input), newInit);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
