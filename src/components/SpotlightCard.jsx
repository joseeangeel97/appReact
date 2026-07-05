import styles from './SpotlightCard.module.css';

const getClassName = (...classNames) => classNames.filter(Boolean).join(' ');

export default function SpotlightCard({
  as: Component = 'div',
  className,
  children,
  ...props
}) {
  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    event.currentTarget.style.setProperty('--spotlight-x', `${x}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${y}px`);
  };

  return (
    <Component
      className={getClassName(styles.spotlightCard, className)}
      onPointerMove={handlePointerMove}
      {...props}
    >
      {children}
    </Component>
  );
}
