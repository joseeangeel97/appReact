import { useEffect, useState } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import EventLevelSection from '../components/EventLevelSection';
import EventAccessNotice from '../components/EventAccessNotice';
import {
  useActiveProfile,
  useAttendingEvents,
  useSessionActions,
} from '../utils/sessionProfile';
import pageBackground from '../assets/fondos/bg3.png';
import styles from './pageEvent.module.css';

function getCssImageUrl(image) {
  return `url(${JSON.stringify(String(image || ''))})`;
}

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

function getEventReservationKey(event) {
  return String(event?.id || event?.title || '').trim().toLowerCase();
}

export default function PageEvent() {
  const [events, setEvents] = useState([]);
  const [eventsStatus, setEventsStatus] = useState('loading');
  const [reservationNotice, setReservationNotice] = useState(null);
  const activeProfile = useActiveProfile();
  const attendingEvents = useAttendingEvents();
  const { saveAttendingEvent } = useSessionActions();
  const profileImage = activeProfile?.image;
  const parallaxProfileImage = getParallaxProfileImage(profileImage);
  const eventGroups = groupEventsByLevel(events);
  const reservedEventKeys = new Set(attendingEvents.map(getEventReservationKey));
  const isEventReserved = (event) =>
    reservedEventKeys.has(getEventReservationKey(event));

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

  useEffect(() => {
    if (!reservationNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setReservationNotice(null);
    }, 5200);

    return () => window.clearTimeout(timeoutId);
  }, [reservationNotice]);

  const handleReserve = async (event) => {
    if (isEventReserved(event)) {
      setReservationNotice({
        type: 'reserved',
        title: 'Ya reservado',
        message: `${event.title} ya se encuentra en tu agenda privada.`,
      });
      return;
    }

    try {
      await saveAttendingEvent(event);
      setReservationNotice({
        type: 'success',
        title: 'Reserva registrada',
        message: `${event.title}: los pases se muestran temporalmente hasta confirmación. No implica acceso garantizado.`,
      });
    } catch (error) {
      setReservationNotice({
        type: 'error',
        title: 'No se pudo reservar',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo guardar la reserva. Inténtalo de nuevo.',
      });
    }
  };

  return (
    <>
      <Header />
      <main
        className={styles.pageEventMain}
        style={{
          '--page-event-background': getCssImageUrl(pageBackground),
          '--profile-parallax-image': getCssImageUrl(parallaxProfileImage),
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

        {reservationNotice && (
          <aside
            className={styles.reservationNotice}
            data-type={reservationNotice.type}
            role='status'
            aria-live='polite'
          >
            <span>{reservationNotice.title}</span>
            <p>{reservationNotice.message}</p>
          </aside>
        )}

        <EventAccessNotice styles={styles} />

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
                isEventReserved={isEventReserved}
              />
            ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
