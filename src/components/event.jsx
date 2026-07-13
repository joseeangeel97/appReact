import Button from './Button';
import SpotlightCard from './SpotlightCard';
import styles from './event.module.css';

const getClassName = (...classNames) => classNames.filter(Boolean).join(' ');

function splitEventTitle(title) {
  const [titleLead, ...titleRest] = String(title).split(':');
  const continuation = titleRest.join(':').trim();

  if (!continuation) {
    return {
      lead: title,
      continuation: '',
    };
  }

  return {
    lead: `${titleLead.trim()}:`,
    continuation,
  };
}

export default function Event({
  title,
  type,
  date,
  location,
  description,
  tags = [],
  image,
  secondaryImage,
  onReserve,
  className,
  reserved = false,
}) {
  const eventTitle = splitEventTitle(title);

  return (
    <SpotlightCard
      as='article'
      className={getClassName(styles.eventCard, className)}
    >
      <div className={styles.imageFrame} role='img' aria-label={title}>
        {image && secondaryImage ? (
          <>
            <img className={styles.imageTriangle} src={image} alt='' />
            <img
              className={styles.imageTriangleSecondary}
              src={secondaryImage}
              alt=''
            />
          </>
        ) : (
          <img
            className={styles.imageSingle}
            src={image || secondaryImage || ''}
            alt=''
          />
        )}
      </div>
      <div className={styles.eventContent}>
        <div className={styles.eventHeader}>
          <h3 className={styles.eventTitle}>
            <span>{eventTitle.lead}</span>
            {eventTitle.continuation && <span>{eventTitle.continuation}</span>}
          </h3>
          <span className={styles.eventType}>{type}</span>
        </div>
        <div className={styles.eventMeta}>
          <span>{date}</span>
          <span>{location}</span>
        </div>
        <p className={styles.eventDescription}>{description}</p>
        {tags.length > 0 && (
          <div className={styles.eventTags} aria-label='Etiquetas del evento'>
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <Button
          type='button'
          className={getClassName(
            styles.reserveButton,
            reserved && styles.reserveButtonReserved,
          )}
          onClick={reserved ? undefined : onReserve}
          disabled={reserved}
        >
          {reserved ? 'Ya reservado' : 'Reservar'}
        </Button>
      </div>
    </SpotlightCard>
  );
}
