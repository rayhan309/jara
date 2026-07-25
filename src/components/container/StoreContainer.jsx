export default function StoreContainer({
  children,
  className = "",
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={`container mx-auto w-full min-w-0 px-3 sm:px-6 lg:px-8 ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
