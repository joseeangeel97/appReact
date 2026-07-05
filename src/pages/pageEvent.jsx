import { useEffect, useState, useSyncExternalStore } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import EventBlock from '../components/EventBlock';
import {
  getActiveProfile,
  saveAttendingEvent,
  subscribeActiveProfile,
} from '../utils/sessionProfile';
import pageBackground from '../assets/fondos/bg3.png';
import styles from './pageEvent.module.css';

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
  const [events, setEvents] = useState([]);
  const [eventsStatus, setEventsStatus] = useState('loading');
  const activeProfile = useSyncExternalStore(
    subscribeActiveProfile,
    getActiveProfile,
    () => null,
  );
  const profileImage = activeProfile?.image;
  const parallaxProfileImage = getParallaxProfileImage(profileImage);

  useEffect(() => {
    let isMounted = true;

    // Carga los eventos desde MongoDB a través del backend.
    async function loadEvents() {
      try {
        const response = await fetch('/api/events');

        if (!response.ok) {
          throw new Error('Events request failed');
        }

        const contentType = response.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
          throw new Error('Events endpoint did not return JSON');
        }

        const data = await response.json();
        const nextEvents = Array.isArray(data.events) ? data.events : [];

        if (!isMounted) {
          return;
        }

        setEvents(
          nextEvents.map((event) => ({
            ...event,
            image: event.image || pageBackground,
          })),
        );
        setEventsStatus(nextEvents.length > 0 ? 'ready' : 'empty');
      } catch (error) {
        console.error('Events loading error:', error);

        if (isMounted) {
          setEventsStatus('error');
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleReserve = (event) => {
    saveAttendingEvent(event);
    window.alert(`Reserva enviada para: ${event.title}`);
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
          {eventsStatus === 'loading' && (
            <div className={styles.eventsStatusCard}>Cargando eventos...</div>
          )}

          {eventsStatus === 'error' && (
            <div className={styles.eventsStatusCard}>
              No se pudieron cargar los eventos desde la base de datos.
            </div>
          )}

          {eventsStatus === 'empty' && (
            <div className={styles.eventsStatusCard}>
              Aún no hay eventos publicados.
            </div>
          )}

          {eventsStatus === 'ready' &&
            events.map((event, index) => (
              <EventBlock
                key={event.id}
                event={event}
                mirrored={index % 2 === 1}
                parallaxImage={parallaxProfileImage}
                showParallax={index < events.length - 1}
                onReserve={handleReserve}
              />
            ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
