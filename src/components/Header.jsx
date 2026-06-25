import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header({ className }) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY.current;
      const isPastThreshold = currentY > 80;

      setHidden(scrollingDown && isPastThreshold);
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`${styles.headerBase} ${hidden ? styles.hiddenHeader : styles.visibleHeader} ${className ?? ''}`}
    >
      <h2>EventHub Paternoster</h2>
      <nav>
        <Link to='/'>Inicio</Link>
        <Link to='/page-event'>Eventos</Link>
        <Link to='/profile'>Perfil</Link>
        <Link to='/about'>Acerca</Link>
      </nav>
    </header>
  );
}
