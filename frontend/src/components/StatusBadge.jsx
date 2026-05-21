import { STATUS_CONFIG } from "./constants/statusConfig";

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.valid;

  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-sm tracking-wide ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}