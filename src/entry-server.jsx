import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App.jsx';

export function render(url, { session } = {}) {
  return renderToString(
    <StaticRouter location={url}>
      <App initialSession={session} />
    </StaticRouter>,
  );
}
