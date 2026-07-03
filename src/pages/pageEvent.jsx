import { useSyncExternalStore } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import EventBlock from '../components/EventBlock';
import {
  getActiveProfile,
  subscribeActiveProfile,
} from '../utils/sessionProfile';
import pageBackground from '../assets/fondos/bg3.png';
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

function getParallaxProfileImage(profileImage) {
  const imageSrc = profileImage?.originalSrc || profileImage?.src;

  if (!imageSrc) {
    return pageBackground;
  }

  if (!imageSrc.includes('/image/upload/')) {
    return imageSrc;
  }

  return imageSrc.replace(
    '/image/upload/',
    '/image/upload/f_auto,q_auto:best,c_fill,g_auto,w_2200,h_1100/',
  );
}

export default function PageEvent() {
  const activeProfile = useSyncExternalStore(
    subscribeActiveProfile,
    getActiveProfile,
    () => null,
  );
  const profileImage = activeProfile?.image;
  const parallaxProfileImage = getParallaxProfileImage(profileImage);

  const handleReserve = (title) => {
    window.alert(`Reserva enviada para: ${title}`);
  };

  return (
    <>
      <Header />
      <main
        className={styles.pageEventMain}
        style={{
          '--page-event-background': `url("${pageBackground}")`,
          '--profile-parallax-image': `url("${parallaxProfileImage}")`,
        }}
      >
        <section className={styles.pageEventHeader}>
          <div>
            <h1>Eventos Privados</h1>
            <p>
              Descubre nuestras experiencias seleccionadas: cenas de lujo,
              networking exclusivo y encuentros privados para una clientela
              selecta.
            </p>
          </div>
          {activeProfile?.alias && (
            <div className={styles.aliasBadge}>
              <span>Perfil activo</span>
              <strong>{activeProfile.alias}</strong>
              {profileImage?.label && (
                <p className={styles.profileImageName}>{profileImage.label}</p>
              )}
              {profileImage?.description && (
                <p className={styles.profileImageDescription}>
                  {profileImage.description}
                </p>
              )}
            </div>
          )}
        </section>

        <section className={styles.eventsColumn}>
          {promotedEvents.map((event, index) => (
            <EventBlock
              key={event.id}
              event={event}
              mirrored={index % 2 === 1}
              parallaxImage={parallaxProfileImage}
              showParallax={index < promotedEvents.length - 1}
              onReserve={handleReserve}
            />
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
