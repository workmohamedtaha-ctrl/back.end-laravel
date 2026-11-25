export function Glass({ children, dark = false, className = '', onClick }) {
  const base = dark
    ? 'bg-black/65 text-white border-white/15'
    : 'bg-white/85 text-slate-900 border-black/10';
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`backdrop-blur-xl border shadow-lg transition-transform duration-150 ${
        onClick ? 'cursor-pointer active:scale-95 hover:brightness-105' : ''
      } ${base} ${className}`}
    >
      {children}
    </Tag>
  );
}