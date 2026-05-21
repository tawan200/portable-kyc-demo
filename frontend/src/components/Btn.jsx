const styles = {
  primary:
    "bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 shadow-md shadow-blue-200",

  secondary:
    "bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 border border-gray-300",

  danger:
    "bg-red-50 hover:bg-red-100 text-red-700 px-6 py-2.5 border border-red-200",

  ghost: "text-blue-700 hover:text-blue-900 px-3 py-1.5",
};

export default function Btn({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
