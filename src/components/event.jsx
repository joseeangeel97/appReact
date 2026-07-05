import Button from './Button';
import SpotlightCard from './SpotlightCard';
import styles from './event.module.css';

const getClassName = (...classNames) => classNames.filter(Boolean).join(' ');

export default function Event({
  title,
  type,
  date,
  location,
  description,
  tags = [],
  image,
  onReserve,
  className,
}) {
  return (
    <SpotlightCard
      as='article'
      className={getClassName(styles.eventCard, className)}
    >
      <div className={styles.imageFrame}>
        <img src={image} alt={title} />
      </div>
      <div className={styles.eventContent}>
        <div className={styles.eventHeader}>
          <h3 className={styles.eventTitle}>{title}</h3>
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
          className={styles.reserveButton}
          onClick={onReserve}
        >
          Reservar
        </Button>
      </div>
    </SpotlightCard>
  );
}
