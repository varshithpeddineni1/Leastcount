import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/components.css';
import { initTheme } from './theme';
import { App } from './App';
import { Gallery } from './Gallery';

initTheme();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const page = window.location.pathname === '/gallery' ? <Gallery /> : <App />;

createRoot(rootElement).render(<StrictMode>{page}</StrictMode>);
