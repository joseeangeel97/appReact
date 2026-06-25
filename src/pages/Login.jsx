import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';

export default function Login() {
  const navigate = useNavigate();

  const handleGoProfile = () => {
    navigate('/profile');
  };
  const [open, setOpen] = useState(false);
  const sectionClass = [
    styles.transitionBox,
    open ? styles['form-section'] : styles.entranceFormSection,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main>
      <section className={styles['title-section']}>
        <h1>EventHub Paternoster</h1>
        <p>Tu lugar de confianza</p>
      </section>
      <section className={sectionClass}>
        <article onClick={() => setOpen(true)}>
          <h4>Entrada</h4>
        </article>

        <form action='' method='post'>
          <label htmlFor='name'>Santo</label>
          <input type='text' name='name' id='name' />
          <label htmlFor='password'>Seña</label>
          <input type='password' name='password' id='password' />

          <button type='button' onClick={() => handleGoProfile()}>
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
