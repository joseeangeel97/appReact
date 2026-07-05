import EventBlock from './EventBlock';
import styles from '../pages/pageEvent.module.css';

export default function EventLevelSection({
  group,
  parallaxImage,
  onReserve,
}) {
  return (
    <section className={styles.levelSection}>
      <header className={styles.levelHeader}>
        <span>Orden {group.order}</span>
        <h2>{group.name}</h2>
        <p>
          {group.events.length}{' '}
          {group.events.length === 1
            ? 'encuentro disponible'
            : 'encuentros disponibles'}
        </p>
      </header>

      <div className={styles.levelEvents}>
        {group.events.map((event, index) => (
          <EventBlock
            key={event.id}
            event={event}
            mirrored={index % 2 === 1}
            parallaxImage={parallaxImage}
            showParallax={index < group.events.length - 1}
            onReserve={onReserve}
          />
        ))}
      </div>
    </section>
  );
}
