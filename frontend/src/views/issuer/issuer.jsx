import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_REQUESTS = [
  {
    id: "req-1",
    holderName: "สมชาย ใจดี",
    holderDid: "did:example:holder001",
    requestedTypes: ["kyc", "income"],
    note: "ขอสินเชื่อธุรกิจ",
    requestedAt: "2025-11-02 09:14",
    status: "pending",
  },
  {
    id: "req-2",
    holderName: "มาลี รักดี",
    holderDid: "did:example:holder002",
    requestedTypes: ["income", "workHistory"],
    note: "สมัครงาน Freelance",
    requestedAt: "2025-11-02 08:30",
    status: "pending",
  },
  {
    id: "req-3",
    holderName: "สมศักดิ์ วิสุทธิ์",
    holderDid: "did:example:holder004",
    requestedTypes: ["kyc"],
    note: "เปิดบัญชีธนาคาร",
    requestedAt: "2025-11-01 17:45",
    status: "pending",
  },
  {
    id: "req-4",
    holderName: "นิดา จันทรา",
    holderDid: "did:example:holder005",
    requestedTypes: ["kyc", "income", "tax"],
    note: "ยื่นภาษีออนไลน์",
    requestedAt: "2025-11-01 14:02",
    status: "pending",
  },
];

const MOCK_HISTORY = [
  {
    id: "h-1",
    holderDid: "did:example:holder001",
    holderName: "สมชาย ใจดี",
    types: ["KYC VC", "Income VC"],
    issuedAt: "2025-11-01 14:32",
    status: "active",
  },
  {
    id: "h-2",
    holderDid: "did:example:holder002",
    holderName: "มาลี รักดี",
    types: ["Income VC", "Work History VC"],
    issuedAt: "2025-10-28 09:15",
    status: "active",
  },
  {
    id: "h-3",
    holderDid: "did:example:holder003",
    holderName: "สมศักดิ์ ดี",
    types: ["KYC VC"],
    issuedAt: "2025-10-10 16:45",
    status: "revoked",
  },
];

const CLAIM_TYPES = {
  kyc: {
    label: "ยืนยันตัวตน",
    vcType: "KYC VC",
    accent: "from-violet-600 to-violet-700",
    badge: "bg-violet-50 text-violet-700 border border-violet-200",
    fields: [
      {
        key: "full_name",
        label: "ชื่อ-นามสกุล",
        placeholder: "สมชาย ใจดี",
        required: true,
      },
      {
        key: "national_id",
        label: "เลขบัตรประชาชน",
        placeholder: "1-1234-56789-01-2",
        required: true,
      },
      {
        key: "kyc_level",
        label: "ระดับ KYC",
        placeholder: "3",
        required: true,
      },
      {
        key: "aml_status",
        label: "สถานะ AML",
        placeholder: "ผ่าน",
        required: true,
      },
    ],
  },

  income: {
    label: "รายได้",
    vcType: "Income VC",
    accent: "from-blue-600 to-blue-700",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    fields: [
      {
        key: "average_monthly_income",
        label: "รายได้เฉลี่ยต่อเดือน (บาท)",
        placeholder: "45000",
        required: true,
      },
      {
        key: "income_period_months",
        label: "ช่วงเวลารายได้ (เดือน)",
        placeholder: "12",
        required: true,
      },
      {
        key: "platform_name",
        label: "ชื่อแพลตฟอร์ม",
        placeholder: "Fastwork",
        required: true,
      },
      {
        key: "income_hash",
        label: "Income Hash",
        placeholder: "0xabc...",
        required: false,
      },
    ],
  },

  workHistory: {
    label: "ประวัติการทำงาน",
    vcType: "Work History VC",
    accent: "from-indigo-600 to-indigo-700",
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    fields: [
      {
        key: "completed_jobs",
        label: "จำนวนงานที่สำเร็จ",
        placeholder: "128",
        required: true,
      },
      {
        key: "average_rating",
        label: "คะแนนเฉลี่ย (0–5)",
        placeholder: "4.8",
        required: true,
      },
      {
        key: "work_consistency_score",
        label: "คะแนนความสม่ำเสมอ (0–100)",
        placeholder: "92",
        required: false,
      },
    ],
  },

  tax: {
    label: "ภาษี",
    vcType: "Tax VC",
    accent: "from-slate-500 to-slate-600",
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    fields: [
      {
        key: "tax_filing_status",
        label: "สถานะการยื่นภาษี",
        placeholder: "ยื่นแล้ว",
        required: true,
      },
      {
        key: "income_bracket",
        label: "ช่วงรายได้ต่อปี (บาท)",
        placeholder: "300000–500000",
        required: true,
      },
      {
        key: "tax_year",
        label: "ปีภาษี",
        placeholder: "2024",
        required: true,
      },
    ],
  },
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Panel({ children, className = "" }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-md shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary:
      "bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 shadow-md shadow-blue-200",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 border border-gray-300",
    danger:
      "bg-red-50 hover:bg-red-100 text-red-700 px-6 py-2.5 border border-red-200",
    ghost: "text-blue-700 hover:text-blue-900 px-3 py-1.5",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const NAV = [
  {
    id: "requests",
    label: "คำขอ VC",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },

  {
    id: "history",
    label: "ประวัติการออก VC",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

const ISSUER_NAV = [
  {
    id: "platform",
    label: "Platform",
    color: "bg-violet-500",
  },

  {
    id: "dopa",
    label: "DOPA",
    color: "bg-blue-500",
  },

  {
    id: "revenue",
    label: "กรมสรรพากร",
    color: "bg-emerald-500",
  },

  {
    id: "bureau",
    label: "เครดิตบูโร",
    color: "bg-amber-500",
  },
];

function Sidebar({ active, activeIssuer, onNavigate, onSelectIssuer }) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col bg-[#0f1d36] shrink-0">
      <div className="px-5 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-violet-600 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div>
            <p className="text-white font-bold text-sm tracking-tight">
              ระบบออกเอกสารรับรอง
            </p>
            <p className="text-violet-300/60 text-[10px] tracking-widest uppercase">
              ศูนย์จัดการยืนยันตัวตน ETDA
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
              active === item.id
                ? "bg-violet-600/20 text-violet-200 border-l-2 border-violet-400 pl-[10px]"
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

      {/* ISSUER MENU */}
      <div className="px-3 mt-4">
        <p
          className="
      px-3
      mb-2
      text-[10px]
      font-semibold
      tracking-[0.2em]
      uppercase
      text-slate-500
    "
        >
          Issuer Networks
        </p>

        <div className="space-y-1">
          {ISSUER_NAV.map((issuer) => {
            const isActive = activeIssuer === issuer.id;

            return (
              <button
                key={issuer.id}
                onClick={() => onSelectIssuer(issuer.id)}
                className={`
            w-full
            flex
            items-center
            gap-3
            px-3
            py-2.5
            rounded-sm
            text-sm
            transition-all
            ${
              isActive
                ? "bg-white/10 text-white border-l-2 border-blue-400 pl-[10px]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }
          `}
              >
                <div
                  className={`
              w-2.5
              h-2.5
              rounded-full
              ${issuer.color}
              flex-shrink-0
            `}
                />

                <span className="truncate">{issuer.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, actions }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
          {subtitle}
        </p>

        <h1 className="text-gray-900 font-bold text-lg leading-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">{actions}</div>
    </header>
  );
}

// ─── โครงสร้างหลักของหน้า (LAYOUT SHELL) ───────────────────────────────────
function Shell({ children, active, onNavigate }) {
  return (
    <div
      className="
        min-h-screen bg-slate-50
        text-slate-900
      "
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Sidebar */}
      <Sidebar active={active} onNavigate={onNavigate} />

      {/* Main Layout */}
      <main
        className="
          lg:ml-60
          min-h-screen
          flex
          flex-col
          min-w-0
        "
      >
        {children}
      </main>
    </div>
  );
}

// ─── หน้ารายการคำขอ ─────────────────────────────────────────────────────────
function ScreenRequests({ requests, pendingCount, onSelect, onCreateNew }) {
  return (
    <Shell active="requests" onNavigate={() => {}}>
      <TopBar
        title="คำขอเอกสารรับรอง"
        subtitle="Issuer Management Portal"
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-700">
              Pending {pendingCount}
            </span>
          </div>
        }
      />

      <div className="p-6 max-w-5xl mx-auto w-full">
        {/* HEADER INFO */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-5 py-4 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-900">
              มีคำขอเอกสารรับรองใหม่จากผู้ใช้งาน
            </p>

            <p className="text-sm text-blue-700 leading-relaxed mt-1">
              กรุณาตรวจสอบรายละเอียดคำขอ เอกสารที่ร้องขอ
              และข้อมูลผู้ถือเอกสารก่อนดำเนินการออก VC
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Panel className="p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">
              Total Requests
            </p>

            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">
                {requests.length}
              </p>

              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                  />
                </svg>
              </div>
            </div>
          </Panel>

          <Panel className="p-5 rounded-2xl border border-amber-100 bg-amber-50/70 shadow-sm">
            <p className="text-amber-500 text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">
              Pending
            </p>

            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-amber-700">
                {pendingCount}
              </p>

              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3"
                  />
                </svg>
              </div>
            </div>
          </Panel>

          <Panel className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 shadow-sm">
            <p className="text-emerald-500 text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">
              Verified DID
            </p>

            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-emerald-700">100%</p>

              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              คำขอออกเอกสารรับรอง
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              จัดการคำขอ VC และออกเอกสารให้ Holder
            </p>
          </div>

          <Btn
            onClick={onCreateNew}
            className="rounded-2xl bg-violet-700 hover:bg-violet-800"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            ออก VC ใหม่
          </Btn>
        </div>

        {/* REQUEST LIST */}
        <Panel className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
          {/* HEADER */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-bold text-sm">
                Pending Credential Requests
              </p>

              <p className="text-gray-400 text-xs mt-0.5">
                เลือกรายการเพื่อดำเนินการออกเอกสารรับรอง
              </p>
            </div>

            <div className="text-xs text-gray-400">
              {requests.length} requests
            </div>
          </div>

          {/* EMPTY */}
          {requests.length === 0 ? (
            <div className="p-20 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5">
                <svg
                  className="w-10 h-10 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                  />
                </svg>
              </div>

              <p className="text-lg font-bold text-gray-700">
                ไม่มีคำขอที่รอดำเนินการ
              </p>

              <p className="text-sm text-gray-400 mt-2 max-w-sm leading-relaxed">
                เมื่อมีผู้ใช้งานส่งคำขอเอกสารรับรองเข้ามา
                รายการจะแสดงในหน้านี้ทันที
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => onSelect(req)}
                  className="w-full text-left px-6 py-5 hover:bg-slate-50 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    {/* AVATAR */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-gray-900 font-bold text-base">
                              {req.holderName}
                            </p>

                            <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
                              Pending
                            </span>
                          </div>

                          <p className="text-gray-400 text-xs font-mono truncate">
                            {req.holderDid}
                          </p>

                          {req.note && (
                            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                              <p className="text-xs text-slate-600 italic leading-relaxed">
                                “{req.note}”
                              </p>
                            </div>
                          )}
                        </div>

                        {/* META */}
                        <div className="flex-shrink-0 text-left md:text-right">
                          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                            Requested At
                          </p>

                          <p className="text-sm font-semibold text-gray-700 mt-0.5">
                            {req.requestedAt}
                          </p>
                        </div>
                      </div>

                      {/* TAGS */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {req.requestedTypes.map((t) => {
                          const cfg = CLAIM_TYPES[t];

                          return (
                            <span
                              key={t}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                                cfg?.badge ||
                                "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {cfg?.vcType || t}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* ARROW */}
                    <div className="pt-1 flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center group-hover:bg-gray-900 group-hover:border-gray-900 transition-all">
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </Shell>
  );
}

// ─── หน้าฟอร์มออกเอกสารรับรอง ───────────────────────────────────────────────
function ScreenIssueForm({ request, onIssued, onBack }) {
  const [holderDid, setHolderDid] = useState(request?.holderDid || "");

  const initEnabled = request
    ? Object.fromEntries(
        Object.keys(CLAIM_TYPES).map((k) => [
          k,
          request.requestedTypes.includes(k),
        ]),
      )
    : {
        kyc: true,
        income: false,
        workHistory: false,
        tax: false,
      };

  const [enabled, setEnabled] = useState(initEnabled);
  const [formData, setFormData] = useState({});

  const toggleType = (t) => setEnabled((p) => ({ ...p, [t]: !p[t] }));

  const setField = (t, k, v) =>
    setFormData((p) => ({
      ...p,
      [t]: {
        ...p[t],
        [k]: v,
      },
    }));

  const canSubmit = holderDid.trim() && Object.values(enabled).some(Boolean);

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  const handleIssue = () => {
    const claims = {};

    Object.keys(enabled).forEach((t) => {
      if (enabled[t]) claims[t] = formData[t] || {};
    });

    onIssued({
      holderDid: holderDid.trim(),
      claims,
    });
  };

  return (
    <Shell active="requests" onNavigate={() => {}}>
      <TopBar
        title="ออกเอกสารรับรอง"
        subtitle="Issuer Credential Management"
        actions={
          <Btn onClick={onBack} variant="ghost" className="rounded-xl">
            ← กลับ
          </Btn>
        }
      />

      <div className="p-6 max-w-5xl mx-auto w-full">
        {/* HEADER INFO */}
        <div className="mb-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 px-5 py-4 flex items-start gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200 flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-violet-900">
              เลือกข้อมูลและออก Verifiable Credential ให้ Holder
            </p>

            <p className="text-sm text-violet-700 leading-relaxed mt-1">
              ตรวจสอบประเภทข้อมูลที่ต้องการออกให้ผู้ถือเอกสาร
              และกรอกข้อมูลให้ครบถ้วนก่อนดำเนินการออก Credential
            </p>
          </div>
        </div>

        {/* REQUEST CARD */}
        {request && (
          <Panel className="mb-6 overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

            <div className="p-5 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div>
                    <p className="text-gray-900 font-bold text-base">
                      {request.holderName}
                    </p>

                    <p className="text-gray-400 text-xs font-mono mt-1 break-all">
                      {request.holderDid}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-700">
                    Pending Request
                  </span>
                </div>

                {request.note && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      “{request.note}”
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        )}

        {/* SECTION TITLE */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-900 font-bold text-sm">
              เลือกประเภทเอกสารรับรอง
            </p>

            <p className="text-gray-400 text-xs mt-0.5">
              สามารถเลือกได้มากกว่า 1 ประเภท
            </p>
          </div>

          <div className="px-3 py-1 rounded-xl bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold">
            {enabledCount} Selected
          </div>
        </div>

        {/* TYPE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {Object.entries(CLAIM_TYPES).map(([key, cfg]) => {
            const active = enabled[key];

            return (
              <button
                key={key}
                onClick={() => toggleType(key)}
                className={`group relative overflow-hidden rounded-3xl border-2 p-5 text-left transition-all duration-200 ${
                  active
                    ? "border-violet-500 bg-violet-50 shadow-lg shadow-violet-100"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${cfg.accent}`}
                />

                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      active ? "bg-violet-600" : "bg-gray-100"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        active ? "text-white" : "text-gray-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      active
                        ? "bg-violet-600 border-violet-600"
                        : "border-gray-300"
                    }`}
                  >
                    {active && (
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
                </div>

                <p
                  className={`font-bold text-sm ${
                    active ? "text-violet-900" : "text-gray-700"
                  }`}
                >
                  {cfg.vcType}
                </p>

                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Credential type สำหรับการตรวจสอบและยืนยันข้อมูล
                </p>
              </button>
            );
          })}
        </div>

        {/* FORM SECTION */}
        <div className="space-y-5 mb-8">
          {Object.entries(CLAIM_TYPES)
            .filter(([k]) => enabled[k])
            .map(([key, cfg]) => (
              <Panel
                key={key}
                className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm"
              >
                <div className={`h-1 bg-gradient-to-r ${cfg.accent}`} />

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-bold text-sm">
                      {cfg.vcType}
                    </p>

                    <p className="text-gray-400 text-xs mt-0.5">
                      กรอกข้อมูลสำหรับสร้าง credential
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-xl border ${cfg.badge}`}
                  >
                    VC TYPE
                  </span>
                </div>

                {/* FORM */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {cfg.fields.map((f) => (
                    <div key={f.key}>
                      <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                        {f.label}

                        {f.required && <span className="text-red-500">*</span>}
                      </label>

                      <input
                        value={formData[key]?.[f.key] || ""}
                        onChange={(e) => setField(key, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
        </div>

        {/* FOOTER ACTION */}
        <div className="sticky bottom-4 z-20">
          <div className="rounded-3xl border border-gray-200 bg-white/90 backdrop-blur shadow-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">
                Ready to Issue Credential
              </p>

              <p className="text-xs text-gray-400 mt-1">
                ระบบจะสร้าง Verifiable Credential และลงลายเซ็นดิจิทัลอัตโนมัติ
              </p>
            </div>

            <Btn
              disabled={!canSubmit}
              onClick={handleIssue}
              className={`py-3 px-8 rounded-2xl shadow-lg transition-all ${
                canSubmit
                  ? "bg-violet-700 hover:bg-violet-800 shadow-violet-200"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
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
                  d="M9 12l2 2 4-4"
                />
              </svg>
              ออกเอกสารรับรอง
            </Btn>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/// ─── หน้าสำเร็จการออกเอกสาร (Improved UX/UI) ───────────────────────────────
function ScreenSuccess({
  result,
  onIssueAnother,
  onViewHistory,
  onBackToRequests,
}) {
  const [showJWT, setShowJWT] = useState(false);

  return (
    <Shell active="history" onNavigate={() => {}}>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* SUCCESS HERO */}
          <div className="text-center mb-6">
            <div className="relative w-24 h-24 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse" />

              <div className="relative w-24 h-24 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />

              <span className="text-emerald-700 text-xs font-semibold">
                Credential issuance completed
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              ออกเอกสารรับรองสำเร็จ
            </h1>

            <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
              ระบบได้สร้าง Verifiable Credential และส่งไปยัง Wallet
              ของผู้ถือเอกสารเรียบร้อยแล้ว
            </p>
          </div>

          {/* SUMMARY */}
          <Panel className="overflow-hidden mb-5 border border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-[0.18em] font-semibold mb-1">
                    Recipient DID
                  </p>

                  <p className="text-slate-900 font-mono font-bold text-sm break-all">
                    {result.holderDid}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-slate-400 text-[11px] uppercase tracking-[0.18em] font-semibold mb-1">
                    Credentials
                  </p>

                  <p className="text-2xl font-bold text-emerald-700">
                    {result.credentials.length}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-[11px] uppercase tracking-[0.18em] font-semibold mb-3">
                  Issued Credential Types
                </p>

                <div className="flex flex-wrap gap-2">
                  {result.credentials.map((c) => {
                    const cfg = CLAIM_TYPES[c.type];

                    return (
                      <div
                        key={c.id}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-sm ${
                          cfg?.badge ||
                          "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />

                        {cfg?.vcType || c.type}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>

          {/* SECURITY */}
          <Panel className="p-5 mb-5 bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold mb-1">
                  Cryptographically Signed Credential
                </p>

                <p className="text-slate-400 text-sm leading-relaxed">
                  Credential ถูกลงลายเซ็นดิจิทัลเรียบร้อยแล้ว
                  และสามารถตรวจสอบความถูกต้องย้อนหลังได้ผ่าน DID verification
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                    DID Verified
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                    JWT Signed
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                    Tamper Proof
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          {/* JWT VIEWER */}
          <Panel className="overflow-hidden mb-7 border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-900 font-semibold text-sm">
                  Credential JWT Payload
                </p>

                <p className="text-slate-400 text-xs mt-0.5">
                  Signed credential token preview
                </p>
              </div>

              <button
                onClick={() => setShowJWT(!showJWT)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
              >
                {showJWT ? "ซ่อนข้อมูล" : "แสดง JWT"}
              </button>
            </div>

            {showJWT ? (
              <div className="p-4 bg-slate-950 overflow-hidden">
                <pre className="text-[11px] leading-relaxed text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {result.credentials[0]?.jwt}
                </pre>
              </div>
            ) : (
              <div className="px-5 py-6">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <p className="text-slate-400 text-xs font-mono truncate">
                    eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
                  </p>
                </div>
              </div>
            )}
          </Panel>

          {/* ACTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Btn
              onClick={onBackToRequests}
              variant="secondary"
              className="justify-center py-3.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M3 12h18M3 17h18"
                />
              </svg>
              กลับหน้ารายการคำขอ
            </Btn>

            <Btn
              onClick={onIssueAnother}
              className="justify-center py-3.5 bg-violet-700 hover:bg-violet-800 shadow-violet-200"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              ออกเอกสารเพิ่มเติม
            </Btn>

            <Btn
              onClick={onViewHistory}
              variant="secondary"
              className="justify-center py-3.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4V7"
                />
              </svg>
              ดูประวัติรายการ
            </Btn>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── หน้าประวัติการออกเอกสาร (Improved UX/UI) ────────────────────────────
function ScreenHistory({ history, onNavigate }) {
  const activeCount = history.filter((h) => h.status === "active").length;
  const revokedCount = history.filter((h) => h.status === "revoked").length;

  return (
    <Shell active="history" onNavigate={onNavigate}>
      <TopBar
        title="ประวัติการออกเอกสาร"
        subtitle="Credential Issuance History"
      />

      <div className="p-6 max-w-6xl mx-auto w-full">
        {/* HEADER INFO */}
        <div className="mb-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl px-5 py-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-violet-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4V7"
              />
            </svg>
          </div>

          <div className="flex-1">
            <p className="text-violet-900 font-semibold text-sm mb-1">
              Credential Issuance Audit Trail
            </p>

            <p className="text-violet-700 text-sm leading-relaxed">
              ระบบเก็บประวัติการออกเอกสารทั้งหมดเพื่อรองรับการตรวจสอบย้อนหลัง
              การเพิกถอน และการตรวจสอบสถานะของ Verifiable Credential
            </p>
          </div>
        </div>

        {/* CONNECTED HOLDER */}
        <Panel className="mb-6 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 shadow-sm">
          <div className="p-5 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-emerald-900 font-bold text-base">
                  Wallet Connected
                </p>

                <span className="px-2 py-1 rounded-full bg-white border border-emerald-200 text-[10px] font-bold text-emerald-700">
                  VERIFIED
                </span>
              </div>

              <p className="text-sm text-emerald-700">
                {request?.holderName || "Connected Holder"}
              </p>

              <p className="text-xs text-emerald-600 font-mono mt-1 break-all">
                {holderDid}
              </p>
            </div>
          </div>
        </Panel>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "เอกสารทั้งหมด",
              value: history.length,
              desc: "Total credentials",
              color: "text-slate-900",
              bg: "bg-slate-50",
              border: "border-slate-200",
            },
            {
              label: "ใช้งานอยู่",
              value: activeCount,
              desc: "Active credentials",
              color: "text-emerald-700",
              bg: "bg-emerald-50",
              border: "border-emerald-200",
            },
            {
              label: "ถูกเพิกถอน",
              value: revokedCount,
              desc: "Revoked credentials",
              color: "text-red-700",
              bg: "bg-red-50",
              border: "border-red-200",
            },
          ].map((s) => (
            <Panel key={s.label} className={`p-5 border ${s.border} ${s.bg}`}>
              <p className="text-slate-400 text-[11px] uppercase tracking-[0.18em] font-semibold mb-2">
                {s.label}
              </p>

              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>

                  <p className="text-slate-400 text-xs mt-1">{s.desc}</p>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        {/* HISTORY TABLE */}
        <Panel className="overflow-hidden border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <p className="text-slate-900 font-semibold">
                Credential Activity
              </p>

              <p className="text-slate-400 text-xs mt-0.5">
                รายการเอกสารที่ถูกออกโดยระบบ
              </p>
            </div>

            <div className="text-xs text-slate-400">
              {history.length} records
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <svg
                  className="w-8 h-8 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                  />
                </svg>
              </div>

              <p className="text-slate-700 font-semibold mb-1">
                ยังไม่มีประวัติการออกเอกสาร
              </p>

              <p className="text-slate-400 text-sm">
                ประวัติการออก VC จะปรากฏที่นี่
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="px-6 py-5 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* AVATAR */}
                    <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-violet-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-slate-900 font-semibold">
                              {h.holderName}
                            </p>

                            <span
                              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${
                                h.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {h.status === "active" ? "ACTIVE" : "REVOKED"}
                            </span>
                          </div>

                          <p className="text-slate-400 text-xs font-mono break-all">
                            {h.holderDid}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-4">
                            {h.types.map((t) => (
                              <span
                                key={t}
                                className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-semibold"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* META */}
                        <div className="lg:text-right flex-shrink-0">
                          <p className="text-slate-900 font-semibold text-sm">
                            {h.issuedAt}
                          </p>

                          <p className="text-slate-400 text-xs mt-1">
                            Credential issuance timestamp
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </Shell>
  );
}

// ─── SCREEN: GENERATE HOLDER QR ─────────────────────────────────────────────
function ScreenGenerateQR({ onConnected, onBack }) {
  return (
    <Shell active="requests" onNavigate={() => {}}>
      <TopBar
        title="เชื่อมต่อ Holder Wallet"
        subtitle="Generate QR for Wallet Connection"
        actions={
          <Btn onClick={onBack} variant="ghost" className="rounded-xl">
            ← กลับ
          </Btn>
        }
      />

      <div className="min-h-[calc(100vh-90px)] flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <Panel className="rounded-[32px] border border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5 backdrop-blur">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM16 16h4v4h-4z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold mb-2">Scan QR with Wallet</h1>

              <p className="text-violet-100 text-sm leading-relaxed max-w-md mx-auto">
                ให้ Holder เปิด Wallet และสแกน QR Code นี้ เพื่อเชื่อมต่อและรับ
                Verifiable Credential
              </p>
            </div>

            <div className="p-8">
              {/* MOCK QR */}
              <div
                className="
                  w-72 h-72 mx-auto rounded-[28px]
                  border-[12px] border-gray-100
                  bg-[repeating-linear-gradient(45deg,#111_0,#111_10px,#fff_10px,#fff_20px)]
                  shadow-lg
                  mb-8
                "
              />

              <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Waiting for Holder Connection
                    </p>

                    <p className="text-xs text-slate-500 mt-0.5">
                      รอ Wallet ของ Holder เชื่อมต่อผ่าน QR Code
                    </p>
                  </div>
                </div>
              </div>

              <Btn
                onClick={() =>
                  onConnected({
                    holderDid: "did:example:holder001",
                    holderName: "Somchai Jaidee",
                  })
                }
                className="w-full justify-center py-3 rounded-2xl bg-violet-700 hover:bg-violet-800"
              >
                Demo: Holder Connected
              </Btn>
            </div>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function Issuer() {
  const [screen, setScreen] = useState("requests");
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [connectedHolder, setConnectedHolder] = useState(null);
  const [flowType, setFlowType] = useState("request");

  const handleIssued = (data) => {
    const credentials = Object.keys(data.claims).map((type, i) => ({
      id: `vc-${Date.now()}-${i}`,
      type,
      jwt: "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJkaWQ6ZXhhbXBsZTpob2xkZXIwMDEiLCJpc3MiOiJkaWQ6ZXhhbXBsZTpreWMtaXNzdWVyIn0.mock_sig",
    }));
    setResult({ holderDid: data.holderDid, credentials });
    setHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        holderDid: data.holderDid,
        holderName:
          data.claims.kyc?.full_name ||
          selectedRequest?.holderName ||
          "Unknown",
        types: Object.keys(data.claims).map((t) => CLAIM_TYPES[t]?.vcType || t),
        issuedAt: new Date()
          .toLocaleString("en-GB", { hour12: false })
          .replace(",", ""),
        status: "active",
      },
      ...prev,
    ]);
    if (selectedRequest) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, status: "issued" } : r,
        ),
      );
    }
    setScreen("success");
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  if (screen === "requests")
    return (
      <ScreenRequests
        requests={requests.filter((r) => r.status === "pending")}
        pendingCount={pendingCount}
        onCreateNew={() => {
          setFlowType("new");
          setSelectedRequest(null);
          setScreen("qr");
        }}
        onSelect={(req) => {
          setFlowType("request");
          setSelectedRequest(req);
          setScreen("form");
        }}
      />
    );
  if (screen === "form")
    return (
      <ScreenIssueForm
        request={selectedRequest}
        onIssued={handleIssued}
        onBack={() => setScreen("requests")}
      />
    );
  if (screen === "success")
    return (
      <ScreenSuccess
        result={result}
        onIssueAnother={() => {
          setSelectedRequest(null);
          setConnectedHolder(null);
          setScreen("qr");
        }}
        onBackToRequests={() => {
          setSelectedRequest(null);
          setConnectedHolder(null);
          setScreen("requests");
        }}
        onViewHistory={() => setScreen("history")}
      />
    );
  if (screen === "history")
    return (
      <ScreenHistory
        history={history}
        onNavigate={(id) => id === "requests" && setScreen("requests")}
      />
    );
  if (screen === "qr")
    return (
      <ScreenGenerateQR
        onBack={() => setScreen("requests")}
        onConnected={(holder) => {
          setConnectedHolder(holder);

          setSelectedRequest({
            id: `req-${Date.now()}`,
            holderDid: holder.holderDid,
            holderName: holder.holderName,
            requestedTypes: [],
            status: "connected",
          });

          setScreen("form");
        }}
      />
    );
  return null;
}