import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import { useSessionActions } from '../utils/sessionProfile';
import styles from './login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { replaceSession } = useSessionActions();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'No autorizado');
        return;
      }

      const data = await response.json();

      replaceSession(data.session);
      navigate('/profile');
    } catch {
      setError('Error de conexión, intenta nuevamente');
    }
  };

  const sectionClass = [
    styles.transitionBox,
    open ? styles['form-section'] : styles.entranceFormSection,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={styles.loginMain}>
      <section className={styles['title-section']}>
        <h1>EventHub Paternoster</h1>
        <p>Tu lugar de confianza</p>
      </section>
      <section className={sectionClass}>
        <article onClick={() => setOpen(true)}>
          <h4>Entrada</h4>
        </article>

        <form onSubmit={handleSubmit}>
          <label htmlFor='name'>Santo</label>
          <input
            type='text'
            name='name'
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor='password'>Seña</label>
          <input
            type='password'
            name='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className={styles.errorMessage}>{error}</p>}

          <Button type='submit'>Entrar</Button>
        </form>
      </section>
    </main>
  );
}
