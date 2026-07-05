import { useSyncExternalStore } from 'react';
import { Link, Navigate } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SpotlightCard from '../components/SpotlightCard';
import {
  getActiveProfile,
  getAttendingEvents,
  subscribeActiveProfile,
  subscribeAttendingEvents,
} from '../utils/sessionProfile';
import pageBackground from '../assets/fondos/bg3.png';
import styles from './ProfileSummary.module.css';

function useActiveProfile() {
  return useSyncExternalStore(
    subscribeActiveProfile,
    getActiveProfile,
    () => null,
  );
}

function useAttendingEvents() {
  return useSyncExternalStore(
    subscribeAttendingEvents,
    getAttendingEvents,
    () => [],
  );
}

function AccessDetail({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <SpotlightCard className={styles.accessDetail}>
      <span>{label}</span>
      <strong>{value}</strong>
    </SpotlightCard>
  );
}

export default function ProfileSummary() {
  const activeProfile = useActiveProfile();
  const attendingEvents = useAttendingEvents();
  const profileImage = activeProfile?.image;

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
            <div className={styles.eventsGrid}>
              {attendingEvents.map((event) => (
                <article
                  key={event.id || event.title}
                  className={styles.eventSummaryCard}
                >
                  {event.image && <img src={event.image} alt={event.title} />}
                  <div>
                    <span>
                      Nivel {event.level?.order || '-'} ·{' '}
                      {event.level?.name || 'Sin nivel'}
                    </span>
                    <h3>{event.title}</h3>
                    <p>{event.type}</p>
                    <p>{event.date}</p>
                    <p>{event.location}</p>
                    <div className={styles.eventAccessDetails}>
                      <AccessDetail
                        label='Código de acceso'
                        value={event.accessKey}
                      />
                      <AccessDetail
                        label='Password inicial'
                        value={event.initialPassword}
                      />
                      <AccessDetail label='Estado' value={event.status} />
                    </div>
                  </div>
                </article>
              ))}
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
