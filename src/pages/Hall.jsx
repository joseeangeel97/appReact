import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import styles from './hall.module.css';

export default function Hall() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/login');
  };

  return (
    <>
      <body>
        <Header className={styles.hallHeader} />
        <main className={styles.pageHall}>
          {/* Sección: ¿A qué nos dedicamos? */}
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

          {/* Sección: Acceso Exclusivo */}
          <section className={styles.accessSection}>
            <h2>¿Quieres acceder?</h2>
            <p>
              Si deseas formar parte de nuestra comunidad, las respuestas ya han
              sido entregadas. Solo necesitas <strong>ver más allá</strong> del
              texto, observar cuidadosamente lo que se oculta en las líneas, y
              utilizar el santo y seña que encontrarás en estas páginas.{' '}
              <em>Las pistas están a la vista para quien sepa mirar.</em>
            </p>
            <button
              type='button'
              className={styles.homeButton}
              onClick={handleGoHome}
            >
              Acceder
            </button>
          </section>
        </main>
        <Footer />
      </body>
    </>
  );
}
