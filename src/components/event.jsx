import styles from './event.module.css';

export default function Event({
  title,
  type,
  date,
  location,
  description,
  image,
  onReserve,
}) {
  return (
    <article className={styles.eventCard}>
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
        <button
          type='button'
          className={styles.reserveButton}
          onClick={onReserve}
        >
          Reservar
        </button>
      </div>
    </article>
  );
}
