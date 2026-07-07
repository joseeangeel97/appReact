import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveProfile } from '../utils/sessionProfile';
import styles from './Header.module.css';

export default function Header({ className }) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const activeProfile = useActiveProfile();

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

  if (!activeProfile) {
    return null;
  }

  return (
    <header
      className={`${styles.headerBase} ${hidden ? styles.hiddenHeader : styles.visibleHeader} ${className ?? ''}`}
    >
      <Link to='/' className={styles.brand} aria-label='EventHub Paternoster'>
        <img src='/logo1.png' alt='' className={styles.logo} />
        <h2>EventHub Paternoster</h2>
      </Link>
      <nav>
        <Link to='/'>Inicio</Link>
        <Link to='/page-event'>Eventos</Link>
        <Link to='/profile-summary'>Perfil</Link>
        <Link to='/about'>Acerca</Link>
      </nav>
    </header>
  );
}
