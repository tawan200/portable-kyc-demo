import { NAV_ITEMS } from "./navigation/navItems";

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col bg-[#0f1d36] shrink-0">
      {/* โลโก้ */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div>
            <p className="text-white font-bold text-sm tracking-tight">
              TrustVault
            </p>

            <p className="text-blue-300/60 text-[10px] tracking-widest uppercase">
              กระเป๋าเอกสารดิจิทัล
            </p>
          </div>
        </div>
      </div>

      {/* เมนู */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
              active === item.id
                ? "bg-blue-600/20 text-blue-200 border-l-2 border-blue-400 pl-[10px]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={active === item.id ? 2 : 1.5}
                d={item.icon}
              />
            </svg>

            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-5">
        <div className="bg-white/[0.05] border border-white/[0.08] rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex-shrink-0" />

            <p className="text-white text-xs font-semibold">Somchai Jaidee</p>
          </div>

          <p className="text-slate-500 text-[10px] font-mono truncate">
            did:example:holder001
          </p>

          <div className="flex items-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] text-slate-500">
              เซสชันปลอดภัยกำลังใช้งาน
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
