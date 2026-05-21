import { StatusBadge, TypeBadge } from "./index";

import { getAccent } from "./Utils/vcUtils";

export default function VCCard({ vc, onClick, selectable, selected }) {
  const accent = getAccent(vc.type);

  return (
    <div
      onClick={onClick}
      className={`relative bg-white border rounded-md overflow-hidden cursor-pointer transition-all duration-150 group
        ${
          selectable
            ? selected
              ? "border-blue-500 shadow-md shadow-blue-100"
              : "border-gray-200 hover:border-gray-400"
            : "border-gray-200 hover:border-gray-400 hover:shadow-md"
        }`}
    >
      <div className={`h-0.5 w-full bg-gradient-to-r ${accent}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <TypeBadge type={vc.type} />

          <div className="flex items-center gap-2">
            <StatusBadge status={vc.status} />

            {selectable && (
              <div
                className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                }`}
              >
                {selected && (
                  <svg
                    className="w-3 h-3 text-white"
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
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-900 font-bold text-base mt-3 leading-tight">
          {vc.issuer}
        </p>

        <p className="text-gray-500 text-sm mt-0.5">{vc.summary}</p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>

            <span className="text-gray-400 text-xs font-mono truncate max-w-[140px]">
              {vc.issuerDID}
            </span>
          </div>

          <span className="text-gray-400 text-xs">หมดอายุ {vc.expiry}</span>
        </div>
      </div>
    </div>
  );
}
