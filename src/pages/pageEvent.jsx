import Header from '../components/Header';
import Footer from '../components/Footer';
import Event from '../components/event';
import bg5 from '../assets/fondos/bg5.png';
import bg6 from '../assets/fondos/bg6.png';
import bg4 from '../assets/fondos/bg4.png';
import styles from './pageEvent.module.css';

const promotedEvents = [
  {
    id: 1,
    title: 'Cóctel Curado de Gala',
    type: 'Cóctel VIP',
    date: '18 de Julio • 20:00',
    location: 'Club Privado Aurora',
    description:
      'Cóctel exclusivo con selección de champanes y canapés gourmet en un ambiente íntimo.',
    image: bg5,
  },
  {
    id: 2,
    title: 'Cena Secreta de Lujo',
    type: 'Cena',
    date: '24 de Julio • 21:30',
    location: 'Sala Noble del Palacio',
    description:
      'Menú de autor para un grupo limitado acompañado de cavas premium y servicio personalizado.',
    image: bg6,
  },
  {
    id: 3,
    title: 'Jornada Ejecutiva',
    type: 'Networking',
    date: '30 de Julio • 10:00',
    location: 'Espacio Aldea',
    description:
      'Encuentro de líderes con conferencias selectas y mesas de networking exclusivo.',
    image: bg4,
  },
];

export default function PageEvent() {
  const handleReserve = (title) => {
    window.alert(`Reserva enviada para: ${title}`);
  };

  return (
    <>
      <Header />
      <main className={styles.pageEventMain}>
        <section className={styles.pageEventHeader}>
          <div>
            <h1>Eventos Privados</h1>
            <p>
              Descubre nuestras experiencias seleccionadas: cenas de lujo,
              networking exclusivo y encuentros privados para una clientela
              selecta.
            </p>
          </div>
        </section>

        <section className={styles.eventsGrid}>
          {promotedEvents.map((event) => (
            <Event
              key={event.id}
              title={event.title}
              type={event.type}
              date={event.date}
              location={event.location}
              description={event.description}
              image={event.image}
              onReserve={() => handleReserve(event.title)}
            />
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
