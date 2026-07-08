import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import FieldLabel from '../components/FieldLabel';
import { useSessionActions } from '../utils/sessionProfile';
import styles from './initiated.module.css';

const fieldLabelClasses = {
  className: styles.fieldLabel,
  textClassName: styles.fieldLabelText,
};

export default function Initiated() {
  const navigate = useNavigate();
  const { replaceSession } = useSessionActions();
  // Campos que deben coincidir con un perfil existente en la base de datos.
  const [alias, setAlias] = useState('');
  const [phrase, setPhrase] = useState('');
  const [hiddenThought, setHiddenThought] = useState('');
  const [showHiddenThought, setShowHiddenThought] = useState(false);
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validación rápida en cliente antes de consultar el backend.
    if (!alias.trim() || !phrase.trim() || !hiddenThought.trim() || !number) {
      setError('Todos los campos de acceso son obligatorios');
      return;
    }

    setStatus('checking');

    try {
      // El servidor normaliza y valida los datos contra los perfiles guardados.
      const response = await fetch('/api/initiated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          alias,
          phrase,
          hiddenThought,
          number,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'No autorizado');
        setStatus('idle');
        return;
      }

      const data = await response.json();

      replaceSession(data.session);
      setStatus('success');
      // Si el acceso es correcto, vuelve al inicio con la sesión ya activa.
      navigate('/');
    } catch {
      setError('Error de conexión, intenta nuevamente');
      setStatus('idle');
    }
  };

  return (
    <>
      <main className={styles.initiatedMain}>
        <section className={styles['title-section']}>
          <h1>EventHub Paternoster</h1>
          <p>Umbral de acceso</p>
        </section>
        <section className={styles.accessSection}>
          <article>
            <h4>SEÑAS</h4>
          </article>

          <form className={styles.accessForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <FieldLabel htmlFor='alias' {...fieldLabelClasses}>
                Alias
              </FieldLabel>
              <input
                type='text'
                name='alias'
                id='alias'
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder='Introduce tu alias'
                required
              />
            </div>

            <div className={styles.formRow}>
              <FieldLabel htmlFor='phrase' {...fieldLabelClasses}>
                Frase identificativa
              </FieldLabel>
              <input
                type='text'
                name='phrase'
                id='phrase'
                value={phrase}
                onChange={(event) => setPhrase(event.target.value)}
                placeholder='Introduce tu frase identificativa'
                required
              />
            </div>

            <div className={styles.formRow}>
              <FieldLabel htmlFor='hiddenThought' {...fieldLabelClasses}>
                Frase contraseña
              </FieldLabel>
              <div className={styles.passwordField}>
                <input
                  type={showHiddenThought ? 'text' : 'password'}
                  name='hiddenThought'
                  id='hiddenThought'
                  value={hiddenThought}
                  onChange={(event) => setHiddenThought(event.target.value)}
                  placeholder='Introduce tu frase contraseña'
                  required
                />
                {/* Permite revisar la frase sin enviar el formulario. */}
                <Button
                  type='button'
                  onClick={() =>
                    setShowHiddenThought((isVisible) => !isVisible)
                  }
                  aria-label={
                    showHiddenThought
                      ? 'Ocultar frase contraseña'
                      : 'Mostrar frase contraseña'
                  }
                >
                  {showHiddenThought ? 'Ocultar' : 'Ver'}
                </Button>
              </div>
            </div>

            <div className={styles.formRow}>
              <FieldLabel htmlFor='number' {...fieldLabelClasses}>
                Número identificativo
              </FieldLabel>
              <input
                type='number'
                name='number'
                id='number'
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder='Introduce tu número'
                min='1'
                required
              />
            </div>

            {error && <p className={styles.errorMessage}>{error}</p>}

            <Button type='submit' disabled={status === 'checking'}>
              {status === 'checking' ? 'Comprobando...' : 'Entrar'}
            </Button>
          </form>
        </section>
      </main>
    </>
  );
}
