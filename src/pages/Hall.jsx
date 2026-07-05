import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';

import { useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearActiveProfile,
  getActiveProfile,
  subscribeActiveProfile,
} from '../utils/sessionProfile';
import styles from './hall.module.css';

export default function Hall() {
  const navigate = useNavigate();
  const activeProfile = useSyncExternalStore(
    subscribeActiveProfile,
    getActiveProfile,
    () => null,
  );

  const handleGoHome = () => {
    navigate('/login');
  };

  const handleGoInitiated = () => {
    navigate('/login/initiated');
  };

  const handleLogout = () => {
    clearActiveProfile();
  };

  return (
    <>
      <Header className={styles.hallHeader} />
      <main className={styles.pageHall}>
        {/* Con sesión activa, el bloque público se convierte en bienvenida. */}
        {activeProfile ? (
          <section className={styles.welcomeSection}>
            <span>La puerta reconoce tu nombre</span>
            <h2>Bienvenido, discípulo {activeProfile.alias}</h2>
            <p>
              Has cruzado el velo y el círculo vuelve a cerrarse tras tus
              pasos. Que tu atención sea lámpara, que tu silencio sea llave, y
              que cada encuentro revele aquello que solo el iniciado aprende a
              mirar.
            </p>
          </section>
        ) : (
          /* Sección: ¿A qué nos dedicamos? */
          <section className={styles.aboutSection}>
            <h2>¿A qué nos dedicamos?</h2>
            <p>
              Somos una plataforma de eventos privados diseñada exclusivamente
              para gente selecta. Nos especializamos en crear experiencias
              únicas
              <span style={{ display: 'none' }}>SATOR</span> y memorables
              <span style={{ display: 'none' }}>TENET</span> , curadas
              cuidadosamente para un público discerniente que valora la
              exclusividad y la calidad. Tres puntos de entrada, una contraseña
              inicial: recuerda este nombre de leyenda que trasciende el tiempo.
            </p>
          </section>
        )}

        {/* El acceso se oculta al entrar y queda solo la salida de sesión. */}
        {activeProfile ? (
          <section className={styles.logoutSection}>
            <span>Sesión iniciada</span>
            <h2>El umbral permanece abierto</h2>
            <p>
              Estás dentro como <strong>{activeProfile.alias}</strong>. Puedes
              continuar explorando los eventos privados o cerrar la sesión para
              volver a ocultar el acceso.
            </p>
            <Button
              type='button'
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              Terminar sesión
            </Button>
          </section>
        ) : (
          <>
            {/* Sección: Miembros del club */}
            <section className={styles.clubSection}>
              <h2>¿ Eres un iniciado ?</h2>
              <p>
                Si ya formas parte de la sociedad, cruza el umbral a través de
                este punto
              </p>
              <Button
                type='button'
                className={styles.clubButton}
                onClick={handleGoInitiated}
              >
                Acceder al club
              </Button>
            </section>

            {/* Sección: Acceso Exclusivo */}
            <section className={styles.accessSection}>
              <h2>¿ Quieres formar parte ?</h2>
              <p>
                Si deseas formar parte de nuestra comunidad, las respuestas ya
                han sido entregadas. Solo necesitas <strong>ver más allá</strong>{' '}
                del texto, observar cuidadosamente lo que se oculta en las
                líneas, y utilizar el santo y seña que encontrarás en estas
                páginas. <em>Las pistas están a la vista para quien sepa mirar.</em>
              </p>
              <Button
                type='button'
                className={styles.homeButton}
                onClick={handleGoHome}
              >
                Acceder
              </Button>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
