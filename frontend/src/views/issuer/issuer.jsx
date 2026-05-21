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

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#0f1d36] flex-shrink-0">
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

      <div className="px-3 pb-5">
        <div className="bg-white/[0.05] border border-white/[0.08] rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex-shrink-0" />

            <p className="text-white text-xs font-semibold">
              หน่วยงานผู้ออกเอกสาร ETDA
            </p>
          </div>

          <p className="text-slate-500 text-[10px] font-mono truncate">
            did:example:kyc-issuer
          </p>

          <div className="flex items-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] text-slate-500">
              ระบบออกเอกสารพร้อมใช้งาน
            </span>
          </div>
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

function Shell({ children, active, onNavigate }) {
  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <Sidebar active={active} onNavigate={onNavigate} />

      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}

// ─── หน้ารายการคำขอ ─────────────────────────────────────────────────────────
function ScreenRequests({ requests, onSelect, pendingCount }) {
  return (
    <Shell active="requests" onNavigate={() => {}}>
      <TopBar
        title="คำขอเอกสารรับรอง"
        subtitle="ระบบผู้ออกเอกสาร"
        actions={
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-sm">
            รอดำเนินการ {pendingCount} รายการ
          </span>
        }
      />

      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-sm px-4 py-3 flex items-start gap-3">
          <svg
            className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
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

          <p className="text-blue-700 text-sm">
            ผู้ใช้งานด้านล่างได้ส่งคำขอเอกสารรับรองเข้ามา
            กรุณาคลิกเพื่อทำการตรวจสอบและออกเอกสาร
          </p>
        </div>

        <Panel className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-gray-700 font-bold text-xs uppercase tracking-widest">
              รายการคำขอที่รอดำเนินการ
            </p>

            <span className="text-gray-400 text-xs">
              ทั้งหมด {requests.length} รายการ
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="p-16 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>

              <p className="font-bold text-gray-500">ไม่มีคำขอที่รอดำเนินการ</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => onSelect(req)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-violet-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-semibold text-sm">
                      {req.holderName}
                    </p>

                    <p className="text-gray-400 text-xs font-mono truncate">
                      {req.holderDid}
                    </p>

                    {req.note && (
                      <p className="text-gray-500 text-xs mt-0.5 italic">
                        "{req.note}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-end max-w-[200px]">
                    {req.requestedTypes.map((t) => {
                      const cfg = CLAIM_TYPES[t];

                      return (
                        <span
                          key={t}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            cfg?.badge ||
                            "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {cfg?.vcType || t}
                        </span>
                      );
                    })}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-400 text-xs">{req.requestedAt}</p>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm mt-0.5 inline-block bg-amber-50 text-amber-700 border border-amber-200">
                      รอดำเนินการ
                    </span>
                  </div>

                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
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
        subtitle="ระบบผู้ออกเอกสาร"
        actions={
          <Btn onClick={onBack} variant="ghost">
            ← กลับ
          </Btn>
        }
      />

      <div className="p-6 max-w-3xl mx-auto w-full">
        {request && (
          <Panel className="p-4 mb-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-bold text-sm">
                {request.holderName}
              </p>

              <p className="text-gray-400 text-xs font-mono truncate">
                {request.holderDid}
              </p>

              {request.note && (
                <p className="text-gray-500 text-xs mt-0.5 italic">
                  "{request.note}"
                </p>
              )}
            </div>

            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-sm bg-amber-50 text-amber-700 border border-amber-200">
              คำขอรอดำเนินการ
            </span>
          </Panel>
        )}

        {!request && (
          <Panel className="p-5 mb-5">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">
              ผู้รับเอกสารรับรอง
            </p>

            <label className="block mb-1 text-sm font-semibold text-gray-700">
              DID ของผู้ถือเอกสาร
            </label>

            <input
              value={holderDid}
              onChange={(e) => setHolderDid(e.target.value)}
              placeholder="did:example:holder001"
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />

            <p className="text-gray-400 text-xs mt-1.5">
              DID ของผู้ใช้งานที่จะได้รับเอกสารรับรองนี้
            </p>
          </Panel>
        )}

        <p className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-3">
          เลือกประเภทเอกสารรับรอง
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {Object.entries(CLAIM_TYPES).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => toggleType(key)}
              className={`p-3 rounded-md border-2 text-left transition-all ${
                enabled[key]
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`h-0.5 w-full bg-gradient-to-r ${cfg.accent} mb-2 rounded`}
              />

              <p
                className={`text-xs font-bold ${
                  enabled[key] ? "text-violet-700" : "text-gray-600"
                }`}
              >
                {cfg.vcType}
              </p>

              <div
                className={`mt-1.5 w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
                  enabled[key]
                    ? "bg-violet-600 border-violet-600"
                    : "border-gray-300"
                }`}
              >
                {enabled[key] && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
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
            </button>
          ))}
        </div>

        <div className="space-y-4 mb-6">
          {Object.entries(CLAIM_TYPES)
            .filter(([k]) => enabled[k])
            .map(([key, cfg]) => (
              <Panel key={key} className="overflow-hidden">
                <div className={`h-0.5 bg-gradient-to-r ${cfg.accent}`} />

                <div className="px-5 pt-4 pb-2 border-b border-gray-100">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-sm tracking-wide ${cfg.badge}`}
                  >
                    {cfg.vcType}
                  </span>
                </div>

                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cfg.fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {f.label}

                        {f.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                      <input
                        value={formData[key]?.[f.key] || ""}
                        onChange={(e) => setField(key, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
        </div>

        <Btn
          disabled={!canSubmit}
          onClick={handleIssue}
          className="py-3 px-8 bg-violet-700 hover:bg-violet-800 shadow-violet-200"
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          ออกเอกสารรับรอง
        </Btn>
      </div>
    </Shell>
  );
}

// ─── หน้าสำเร็จการออกเอกสาร ─────────────────────────────────────────────────
function ScreenSuccess({ result, onIssueAnother, onViewHistory }) {
  const [showJWT, setShowJWT] = useState(false);

  return (
    <Shell active="requests" onNavigate={() => {}}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-10 h-10 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h2 className="text-gray-900 text-2xl font-bold mb-1">
              ออกเอกสารรับรองสำเร็จ
            </h2>

            <p className="text-gray-500 text-sm">
              ออกเอกสารรับรองจำนวน {result.credentials.length} รายการ
              และส่งไปยังผู้ถือเอกสารเรียบร้อยแล้ว
            </p>
          </div>

          <Panel className="p-5 mb-4">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">
              ผู้รับเอกสาร
            </p>

            <p className="text-gray-900 font-bold text-sm font-mono">
              {result.holderDid}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {result.credentials.map((c) => {
                const cfg = CLAIM_TYPES[c.type];

                return (
                  <span
                    key={c.id}
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-sm tracking-wide ${
                      cfg?.badge ||
                      "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {cfg?.vcType || c.type}
                  </span>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
                Credential JWT (รายการแรก)
              </p>

              <button
                onClick={() => setShowJWT(!showJWT)}
                className="text-xs text-violet-700 font-semibold hover:text-violet-900"
              >
                {showJWT ? "ซ่อน" : "แสดง"}
              </button>
            </div>

            {showJWT ? (
              <pre className="text-gray-600 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
                {result.credentials[0]?.jwt}
              </pre>
            ) : (
              <p className="text-gray-400 text-xs font-mono">
                eyJ… (กดแสดงเพื่อดูข้อมูล)
              </p>
            )}
          </Panel>

          <div className="flex gap-3">
            <Btn
              onClick={onIssueAnother}
              className="py-3 px-6 flex-1 justify-center bg-violet-700 hover:bg-violet-800 shadow-violet-200"
            >
              ออกเอกสารเพิ่มเติม
            </Btn>

            <Btn
              onClick={onViewHistory}
              variant="secondary"
              className="py-3 px-6 flex-1 justify-center"
            >
              ดูประวัติรายการ
            </Btn>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── หน้าประวัติการออกเอกสาร ────────────────────────────────────────────────
function ScreenHistory({ history, onNavigate }) {
  return (
    <Shell active="history" onNavigate={onNavigate}>
      <TopBar
        title="ประวัติการออกเอกสาร"
        subtitle="ระบบผู้ออกเอกสาร"
      />

      <div className="p-6 max-w-4xl mx-auto w-full">

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "เอกสารทั้งหมด",
              value: history.length,
              color: "text-gray-900",
            },
            {
              label: "ใช้งานอยู่",
              value: history.filter((h) => h.status === "active").length,
              color: "text-emerald-700",
            },
            {
              label: "ถูกเพิกถอน",
              value: history.filter((h) => h.status === "revoked").length,
              color: "text-red-600",
            },
          ].map((s) => (
            <Panel key={s.label} className="px-5 py-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">
                {s.label}
              </p>

              <p className={`text-2xl font-bold ${s.color}`}>
                {s.value}
              </p>
            </Panel>
          ))}
        </div>

        <Panel className="overflow-hidden">

          <div className="px-5 py-3.5 border-b border-gray-100">
            <p className="text-gray-700 font-bold text-xs uppercase tracking-widest">
              บันทึกการออกเอกสาร
            </p>
          </div>

          <div className="divide-y divide-gray-50">
            {history.map((h) => (
              <div
                key={h.id}
                className="px-5 py-4 flex items-center gap-4"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm">
                    {h.holderName}
                  </p>

                  <p className="text-gray-400 text-xs font-mono truncate">
                    {h.holderDid}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 justify-end">
                  {h.types.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-violet-50 text-violet-700 border border-violet-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-gray-400 text-xs">
                    {h.issuedAt}
                  </p>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm mt-0.5 inline-block ${
                      h.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {h.status === "active"
                      ? "ใช้งานอยู่"
                      : "ถูกเพิกถอน"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
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
        onSelect={(req) => {
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
  return null;
}