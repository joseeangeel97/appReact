export default function FieldLabel({
  children,
  htmlFor,
  tooltip,
  className,
  textClassName,
}) {
  const labelContent = htmlFor ? (
    <label htmlFor={htmlFor}>{children}</label>
  ) : (
    <span className={textClassName}>{children}</span>
  );

  return (
    <div className={className}>
      {labelContent}
      {tooltip}
    </div>
  );
}
