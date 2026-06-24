import { Link } from 'react-router-dom';

export default function Header({ className }) {
  return (
    <header className={className}>
      <h2>EventHub Paternoster</h2>
      <nav>
        <Link to='/'>Inicio</Link>
        <Link to='/page-event'>Eventos</Link>
        <Link to='/profile'>Perfil</Link>
        <Link to='/about'>Acerca</Link>
        <Link to='/hall'>Hall</Link>
      </nav>
    </header>
  );
}
