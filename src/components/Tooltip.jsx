import Button from './Button';

export default function Tooltip({
  id,
  children,
  wrapperClassName,
  triggerClassName,
  bubbleClassName,
}) {
  return (
    <span className={wrapperClassName}>
      <Button type='button' className={triggerClassName} aria-describedby={id}>
        ?
      </Button>
      <span id={id} className={bubbleClassName}>
        {children}
      </span>
    </span>
  );
}
