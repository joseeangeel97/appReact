import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header>
      <h2>EventHub Mini</h2>
      <nav>
        <Link to='/'>Inicio</Link>
        <Link to='/about'>Eventos</Link>
        <Link to='/hall'>Hall</Link>
      </nav>
    </header>
  );
}
