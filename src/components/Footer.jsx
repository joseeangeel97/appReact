import { useEffect, useState } from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      setVisible(scrollBottom >= pageHeight - 100);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <footer
      className={`${styles.footerComponent} ${visible ? styles.visible : styles.hidden}`}
    >
      <h4>IN AETERNUM</h4>
    </footer>
  );
}
