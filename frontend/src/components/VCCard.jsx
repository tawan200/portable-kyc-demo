// VC Card Component
import { StatusBadge, TypeBadge } from "./index";
import { getAccent } from "./Utils/vcUtils";

export default function VCCard({ vc, onClick, selectable, selected }) {
  const accent = getAccent(vc.type);

  const statusConfig = {
    valid: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      label: "พร้อมใช้งาน",
    },
    expiring: {
      dot: "bg-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
      label: "ใกล้หมดอายุ",
    },
    revoked: {
      dot: "bg-red-500",
      bg: "bg-red-50",
      border: "border-red-100",
      label: "ถูกยกเลิก",
    },
  };

  const statusUI = statusConfig[vc.status] || statusConfig.valid;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`
        relative w-full text-left overflow-hidden rounded-3xl border bg-white
        transition-all duration-200 ease-out
        group

        ${
          selectable
            ? selected
              ? `
                border-blue-600
                bg-blue-50/40
                shadow-xl shadow-blue-100/70
                ring-4 ring-blue-100
                scale-[1.01]
              `
              : `
                border-slate-200
                hover:border-slate-300
                hover:shadow-lg
                hover:-translate-y-0.5
                active:scale-[0.99]
              `
            : `
              border-slate-200
              hover:border-slate-300
              hover:shadow-lg
              hover:-translate-y-0.5
            `
        }
      `}
    >
      {/* Top Accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />

      {/* Selection Layer */}
      {selectable && (
        <>
          {/* Background Highlight */}
          {selected && (
            <div className="absolute inset-0 bg-blue-500/[0.03] pointer-events-none" />
          )}

          {/* Checkbox */}
          <div className="absolute top-4 right-4 z-20">
            <div
              className={`
                w-7 h-7 rounded-xl border-2 flex items-center justify-center
                transition-all duration-200 shadow-sm

                ${
                  selected
                    ? `
                      bg-blue-600
                      border-blue-600
                      shadow-blue-200
                    `
                    : `
                      bg-white
                      border-slate-300
                      group-hover:border-slate-400
                    `
                }
              `}
            >
              {selected ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
              )}
            </div>
          </div>
        </>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pr-10">
          <div className="min-w-0 flex-1">
            <TypeBadge type={vc.type} />

            <h3 className="mt-3 text-[15px] font-bold text-slate-900 leading-snug">
              {vc.issuer}
            </h3>

            <p className="mt-1 text-sm text-slate-500 leading-relaxed line-clamp-2">
              {vc.summary}
            </p>
          </div>

          {!selectable && (
            <div className="flex-shrink-0">
              <StatusBadge status={vc.status} />
            </div>
          )}
        </div>

        {/* Selected State Banner */}
        {selectable && (
          <div
            className={`
              mb-4 rounded-2xl border px-4 py-3 transition-all

              ${
                selected
                  ? `
                    bg-blue-50
                    border-blue-200
                  `
                  : `
                    bg-slate-50
                    border-slate-200
                  `
              }
            `}
          >
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-2 h-2 rounded-full

                  ${selected ? "bg-blue-600" : "bg-slate-300"}
                `}
              />

              <p
                className={`
                  text-sm font-semibold

                  ${selected ? "text-blue-700" : "text-slate-500"}
                `}
              >
                {selected ? "เลือกเอกสารนี้แล้ว" : "แตะเพื่อเลือกเอกสาร"}
              </p>

              {selected && (
                <span className="ml-auto text-[11px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-1 rounded-lg">
                  SELECTED
                </span>
              )}
            </div>
          </div>
        )}

        {/* Security Status */}
        <div
          className={`
            rounded-2xl border px-4 py-3 mb-4
            ${statusUI.bg}
            ${statusUI.border}
          `}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusUI.dot}`} />

            <p className="text-sm font-semibold text-slate-700">
              {statusUI.label}
            </p>

            <span className="ml-auto text-[11px] text-slate-400 font-medium">
              VC 2.0
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-3">
          {/* DID */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9h8M8 13h6m5 8H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Issuer DID
              </p>

              <p className="text-xs font-mono text-slate-600 truncate">
                {vc.issuerDID}
              </p>
            </div>
          </div>

          {/* Expiration */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Expiration Date
              </p>

              <p className="text-sm font-semibold text-slate-700">
                {vc.expiry}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!selectable && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">แตะเพื่อดูรายละเอียด</p>

            <div className="flex items-center gap-1 text-slate-500 group-hover:translate-x-0.5 transition-transform">
              <span className="text-xs font-semibold">ดูข้อมูล</span>

              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}