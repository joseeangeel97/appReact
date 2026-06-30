import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './hall.module.css';

export default function About() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.aboutSection}>
          <h2>¿A qué nos dedicamos?</h2>
          <p>
            Somos una plataforma de eventos privados diseñada exclusivamente
            para gente selecta. Nos especializamos en crear experiencias únicas
            <span style={{ display: 'none' }}>SATOR</span> y memorables
            <span style={{ display: 'none' }}>TENET</span> , curadas
            cuidadosamente para un público discerniente que valora la
            exclusividad y la calidad. Tres puntos de entrada, una contraseña
            inicial: recuerda este nombre de leyenda que trasciende el tiempo.
          </p>
        </section>

        {/* Sección: Clase de eventos */}
        <section className={styles.eventsSection}>
          <h2>Clase de eventos que ofrecemos</h2>
          <ul>
            <li>Cócteles de networking exclusivos</li>
            <li>Galas y eventos de gala privados</li>
            <li>Conferencias y seminarios selectos</li>
            <li>Experiencias gastronómicas únicas</li>
            <li>Eventos corporativos de alto nivel</li>
            <li>Celebraciones y aniversarios personalizados</li>
            <li>Presentaciones de productos de lujo</li>
          </ul>
        </section>

        {/* Sección: Por qué nació este proyecto */}
        <section className={styles.originSection}>
          <h2>Por qué nació este proyecto</h2>
          <p>
            Nació de la necesidad de crear un espacio donde personas de
            intereses similares y estándares elevados pudieran conectar y
            compartir experiencias auténticas. En un mundo saturado de eventos
            masivos, decidimos ofrecer algo diferente: encuentros íntimos,
            cuidadosamente organizados y accesibles solo para aquellos que
            comparten nuestra visión de exclusividad y excelencia.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
