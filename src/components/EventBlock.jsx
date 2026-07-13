import Event from './event';
import styles from './EventBlock.module.css';

export default function EventBlock({
  event,
  mirrored = false,
  parallaxImage,
  showParallax = false,
  onReserve,
  reserved = false,
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
        tags={event.tags}
        image={event.image}
        secondaryImage={event.originalImage}
        onReserve={() => onReserve(event)}
        reserved={reserved}
      />

      {showParallax && (
        <div className={styles.profileParallax} aria-hidden='true' />
      )}
    </div>
  );
}
