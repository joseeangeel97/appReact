import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

hydrateRoot(
  document.getElementById('root'),
  <StrictMode>
    <BrowserRouter>
      <App initialSession={window.__MINIHUB_SESSION__} />
    </BrowserRouter>
  </StrictMode>,
);

// El módulo solo se ejecuta cuando Vite ya ha aplicado el CSS de la aplicación.
// Dos frames permiten al navegador pintar la vista final antes de retirar la portada.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.add('appReady');

    window.setTimeout(() => {
      document.getElementById('app-boot')?.remove();
    }, 550);
  });
});
