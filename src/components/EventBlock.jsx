import Event from './event';
import styles from './EventBlock.module.css';

export default function EventBlock({
  event,
  mirrored = false,
  parallaxImage,
  showParallax = false,
  onReserve,
}) {
  return (
    <div
      className={styles.eventBlock}
      style={{ '--profile-parallax-image': `url("${parallaxImage}")` }}
    >
      <Event
        className={mirrored ? styles.eventCardMirror : ''}
        title={event.title}
        type={event.type}
        date={event.date}
        location={event.location}
        description={event.description}
        image={event.image}
        onReserve={() => onReserve(event.title)}
      />

      {showParallax && (
        <div className={styles.profileParallax} aria-hidden='true' />
      )}
    </div>
  );
}
