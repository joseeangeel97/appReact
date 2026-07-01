export default function Tooltip({
  id,
  children,
  wrapperClassName,
  triggerClassName,
  bubbleClassName,
}) {
  return (
    <span className={wrapperClassName}>
      <button type='button' className={triggerClassName} aria-describedby={id}>
        ?
      </button>
      <span id={id} className={bubbleClassName}>
        {children}
      </span>
    </span>
  );
}
