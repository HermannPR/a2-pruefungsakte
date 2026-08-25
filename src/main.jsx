import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AppErrorBoundary from './AppErrorBoundary.jsx';
import { installClientDiagnostics } from './lib/clientDiagnostics.js';
import './styles.css';

installClientDiagnostics();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(error => console.error('Service worker registration failed', error)));
}
