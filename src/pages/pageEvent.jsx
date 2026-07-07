import { useEffect, useState } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import EventLevelSection from '../components/EventLevelSection';
import {
  useActiveProfile,
  useSessionActions,
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

function groupEventsByLevel(events) {
  const groupsByName = new Map();

  for (const event of events) {
    const rawLevel = event.level || event.nivel || {};
    const levelName = rawLevel.name || rawLevel.nombre || 'Sin nivel';
    const levelOrder = Number(rawLevel.order || rawLevel.orden || 999);

    if (!groupsByName.has(levelName)) {
      groupsByName.set(levelName, {
        name: levelName,
        order: levelOrder,
        events: [],
      });
    }

    groupsByName.get(levelName).events.push(event);
  }

  return [...groupsByName.values()].sort(
    (firstGroup, secondGroup) =>
      firstGroup.order - secondGroup.order ||
      firstGroup.name.localeCompare(secondGroup.name, 'es'),
  );
}

function normalizeEventFromApi(event) {
  const rawLevel = event.level || event.nivel || {};

  return {
    ...event,
    level: {
      name: rawLevel.name || rawLevel.nombre || 'Sin nivel',
      order: Number(rawLevel.order || rawLevel.orden || 999),
    },
    image: event.image || pageBackground,
  };
}

export default function PageEvent() {
  const [events, setEvents] = useState([]);
  const [eventsStatus, setEventsStatus] = useState('loading');
  const activeProfile = useActiveProfile();
  const { saveAttendingEvent } = useSessionActions();
  const profileImage = activeProfile?.image;
  const parallaxProfileImage = getParallaxProfileImage(profileImage);
  const eventGroups = groupEventsByLevel(events);

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
          nextEvents.map((event) => normalizeEventFromApi(event)),
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

  const handleReserve = async (event) => {
    try {
      await saveAttendingEvent(event);
      window.alert(`Reserva enviada para: ${event.title}`);
    } catch {
      window.alert('Inicia sesión para reservar eventos');
    }
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

        <section className={styles.levelInfoCard}>
          <p>Cada nivel revela una capa distinta de la experiencia.</p>
          <p>Cada localización permanece velada hasta la confirmación del invitado.</p>
          <p>Cada evento existe solo para quienes saben leer la señal.</p>
          <strong>No se entra por curiosidad. Se entra por invitación.</strong>
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
            eventGroups.map((group) => (
              <EventLevelSection
                key={group.name}
                group={group}
                parallaxImage={parallaxProfileImage}
                onReserve={handleReserve}
              />
            ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
