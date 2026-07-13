import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SpotlightCard from '../components/SpotlightCard';
import { useActiveProfile, useAttendingEvents } from '../utils/sessionProfile';
import pageBackground from '../assets/fondos/bg3.png';
import styles from './ProfileSummary.module.css';

function AccessDetail({ label, value }) {
  return (
    <SpotlightCard className={styles.accessDetail}>
      <span>{label}</span>
      <strong>{value || 'Pendiente de asignar'}</strong>
    </SpotlightCard>
  );
}

function getEventAccessKey(event) {
  return (
    event.accessKey ||
    event.accessCode ||
    event.access_code ||
    event.codigoAcceso ||
    event.codigo_acceso ||
    event.claveAcceso ||
    event.clave_acceso ||
    event.codigo ||
    event.clave
  );
}

function getEventInitialPassword(event) {
  return (
    event.initialPassword ||
    event.initial_password ||
    event.passwordInicial ||
    event.password_inicial ||
    event.claveInicial ||
    event.clave_inicial ||
    event.password
  );
}

function EventBookPage({ event, pageNumber, side }) {
  if (!event) {
    return (
      <div
        className={`${styles.bookPage} ${styles.bookPageEmpty}`}
        data-side={side}
        aria-hidden='true'
      >
        <span className={styles.bookEmblem}>◇</span>
        <p>Fin de la agenda</p>
        <span className={styles.bookPageNumber}>{pageNumber}</span>
      </div>
    );
  }

  return (
    <article className={styles.bookPage} data-side={side}>
      <div className={styles.bookPageInner}>
        {event.image && (
          <div className={styles.bookEventImage}>
            <img src={event.image} alt={event.title} />
          </div>
        )}

        <div className={styles.eventSummaryMeta}>
          <span>
            Nivel {event.level?.order || '-'} ·{' '}
            {event.level?.name || 'Sin nivel'}
          </span>
          <h3>{event.title}</h3>
          <p className={styles.eventType}>{event.type}</p>
          <dl className={styles.eventFacts}>
            <div>
              <dt>Fecha</dt>
              <dd>{event.date || 'Pendiente de confirmar'}</dd>
            </div>
            <div>
              <dt>Lugar</dt>
              <dd>{event.location || 'Ubicación reservada'}</dd>
            </div>
          </dl>
          {event.description && (
            <p className={styles.eventDescription}>{event.description}</p>
          )}
          {Array.isArray(event.tags) && event.tags.length > 0 && (
            <div className={styles.eventTags} aria-label='Etiquetas del evento'>
              {event.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.eventAccessDetails}>
          <AccessDetail
            label='Código de acceso'
            value={getEventAccessKey(event)}
          />
          <AccessDetail
            label='Password inicial'
            value={getEventInitialPassword(event)}
          />
          <AccessDetail label='Estado' value={event.status} />
        </div>
      </div>
      <span className={styles.bookPageNumber}>{pageNumber}</span>
    </article>
  );
}

export default function ProfileSummary() {
  const activeProfile = useActiveProfile();
  const attendingEvents = useAttendingEvents();
  const profileImage = activeProfile?.image;
  const [spreadIndex, setSpreadIndex] = useState(0);
  const totalSpreads = Math.max(1, Math.ceil(attendingEvents.length / 2));
  const currentSpreadIndex = Math.min(spreadIndex, totalSpreads - 1);
  const firstEventIndex = currentSpreadIndex * 2;
  const visibleEvents = attendingEvents.slice(
    firstEventIndex,
    firstEventIndex + 2,
  );

  if (!activeProfile) {
    return <Navigate to='/login/initiated' replace />;
  }

  return (
    <>
      <Header />
      <main
        className={styles.profileSummaryMain}
        style={{ '--summary-background': `url("${pageBackground}")` }}
      >
        <section className={styles.profileHero}>
          <div className={styles.profileCard}>
            {profileImage?.src && (
              <img
                src={profileImage.src}
                alt={profileImage.label || activeProfile.alias}
              />
            )}
            <div>
              <span>Perfil activo</span>
              <h1>{activeProfile.alias}</h1>
              <p>Número personal: {activeProfile.number}</p>
              {profileImage?.label && <strong>{profileImage.label}</strong>}
              {profileImage?.description && (
                <p className={styles.profileDescription}>
                  {profileImage.description}
                </p>
              )}
            </div>
          </div>

          <div className={styles.profileStats}>
            <span>Eventos confirmados</span>
            <strong>{attendingEvents.length}</strong>
          </div>
        </section>

        <section className={styles.eventsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span>Agenda privada</span>
              <h2>Eventos a los que asistirás</h2>
            </div>
            <Link to='/page-event'>Ver eventos</Link>
          </div>

          {attendingEvents.length > 0 ? (
            <div className={styles.eventBookShell}>
              <div
                key={currentSpreadIndex}
                className={styles.eventBook}
                aria-label={`Páginas ${firstEventIndex + 1} y ${firstEventIndex + 2} de la agenda`}
              >
                <EventBookPage
                  event={visibleEvents[0]}
                  pageNumber={firstEventIndex + 1}
                  side='left'
                />
                <EventBookPage
                  event={visibleEvents[1]}
                  pageNumber={firstEventIndex + 2}
                  side='right'
                />
              </div>

              {totalSpreads > 1 && (
                <nav className={styles.bookNavigation} aria-label='Páginas de la agenda'>
                  <button
                    type='button'
                    onClick={() => setSpreadIndex(currentSpreadIndex - 1)}
                    disabled={currentSpreadIndex === 0}
                    aria-label='Ver páginas anteriores'
                  >
                    <span aria-hidden='true'>←</span>
                    Anterior
                  </button>
                  <span aria-live='polite'>
                    Pliego {currentSpreadIndex + 1} de {totalSpreads}
                  </span>
                  <button
                    type='button'
                    onClick={() => setSpreadIndex(currentSpreadIndex + 1)}
                    disabled={currentSpreadIndex === totalSpreads - 1}
                    aria-label='Ver páginas siguientes'
                  >
                    Siguiente
                    <span aria-hidden='true'>→</span>
                  </button>
                </nav>
              )}
            </div>
          ) : (
            <div className={styles.emptyEvents}>
              <h3>Aún no tienes eventos confirmados</h3>
              <p>
                Reserva una experiencia privada y aparecerá aquí como parte de
                tu agenda.
              </p>
              <Link to='/page-event'>Explorar eventos</Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
