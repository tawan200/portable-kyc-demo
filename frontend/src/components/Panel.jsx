export default function Panel({ children, className = "" }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-md shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
