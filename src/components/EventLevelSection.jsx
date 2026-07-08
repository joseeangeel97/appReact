import EventBlock from './EventBlock';
import Tooltip from './Tooltip';
import styles from '../pages/pageEvent.module.css';

const levelAccessRulesByOrder = {
  1: {
    name: 'El Atrio',
    capacity: 80,
    note: 'primeros aspirantes',
  },
  2: {
    name: 'El Círculo',
    capacity: 50,
    note: 'primeros perfiles confirmables',
  },
  3: {
    name: 'El Santuario',
    capacity: 20,
    note: 'primeros miembros excepcionales',
  },
};

function getLevelCapacityText(order) {
  const rule = levelAccessRulesByOrder[Number(order)];

  if (!rule) {
    return 'Cupo sujeto a confirmación interna.';
  }

  return `${rule.name}: hay plaza para los ${rule.capacity} ${rule.note}. La reserva solo muestra pases temporales y no garantiza el acceso final.`;
}

export default function EventLevelSection({
  group,
  parallaxImage,
  onReserve,
  isEventReserved = () => false,
}) {
  return (
    <section className={styles.levelSection}>
      <header className={styles.levelHeader}>
        <span>Orden {group.order}</span>
        <div className={styles.levelTitleGroup}>
          <h2>{group.name}</h2>
          <Tooltip
            id={`level-capacity-${group.order}`}
            wrapperClassName={styles.levelTooltipWrapper}
            triggerClassName={styles.levelTooltipTrigger}
            bubbleClassName={styles.levelTooltipBubble}
          >
            {getLevelCapacityText(group.order)}
          </Tooltip>
        </div>
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
            reserved={isEventReserved(event)}
          />
        ))}
      </div>
    </section>
  );
}
