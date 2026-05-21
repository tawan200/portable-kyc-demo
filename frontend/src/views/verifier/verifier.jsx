import { useState, useEffect } from "react";

// ─── LOAN PRODUCTS ────────────────────────────────────────────────────────────
const LOAN_PRODUCTS = [
  {
    id: "personal",
    name: "สินเชื่อส่วนบุคคล",
    nameEn: "Personal Loan",
    description: "สำหรับใช้จ่ายส่วนตัว รีไฟแนนซ์ หรือเหตุฉุกเฉิน",
    maxAmount: 1500000,
    interestRate: "9.99–24",
    term: "12–60 เดือน",
    defaultTerm: 36,
    requiredTypes: ["kyc", "income"],
    consentTypes: ["workHistory"],
    minIncome: 15000,
    multiplier: 20,
    gradient: "from-emerald-500 to-teal-600",
    colors: {
      badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      activeBorder: "border-emerald-400",
      activeRing: "ring-emerald-100",
    },
  },
  {
    id: "home",
    name: "สินเชื่อบ้าน / อสังหาฯ",
    nameEn: "Home Loan",
    description: "ซื้อบ้าน คอนโด ที่ดิน หรืออสังหาริมทรัพย์",
    maxAmount: 10000000,
    interestRate: "3.25–6.5",
    term: "10–30 ปี",
    defaultTerm: 240,
    requiredTypes: ["kyc", "income", "tax"],
    consentTypes: ["workHistory"],
    minIncome: 30000,
    multiplier: 100,
    gradient: "from-blue-500 to-indigo-600",
    colors: {
      badge: "bg-blue-100 text-blue-700 border border-blue-200",
      activeBorder: "border-blue-400",
      activeRing: "ring-blue-100",
    },
  },
  {
    id: "auto",
    name: "สินเชื่อรถยนต์",
    nameEn: "Auto Loan",
    description: "ซื้อรถยนต์ใหม่หรือรถมือสอง ได้ทั้งรถเก๋งและรถกระบะ",
    maxAmount: 2000000,
    interestRate: "2.79–5.99",
    term: "12–84 เดือน",
    defaultTerm: 60,
    requiredTypes: ["kyc", "income"],
    consentTypes: ["tax"],
    minIncome: 15000,
    multiplier: 40,
    gradient: "from-violet-500 to-purple-600",
    colors: {
      badge: "bg-violet-100 text-violet-700 border border-violet-200",
      activeBorder: "border-violet-400",
      activeRing: "ring-violet-100",
    },
  },
  {
    id: "sme",
    name: "สินเชื่อ SME / Freelance",
    nameEn: "SME & Freelance Loan",
    description: "สำหรับผู้ประกอบการ Freelance และธุรกิจขนาดเล็ก-กลาง",
    maxAmount: 20000000,
    interestRate: "5.5–12",
    term: "12–120 เดือน",
    defaultTerm: 60,
    requiredTypes: ["kyc", "income", "workHistory"],
    consentTypes: ["tax"],
    minIncome: 20000,
    multiplier: 80,
    gradient: "from-amber-500 to-orange-600",
    colors: {
      badge: "bg-amber-100 text-amber-700 border border-amber-200",
      activeBorder: "border-amber-400",
      activeRing: "ring-amber-100",
    },
  },
];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_HOLDER_VCS = [
  {
    id: "vc-kyc-001",
    type: ["VerifiableCredential", "KYCCredential"],
    issuer: { id: "did:example:kyc-issuer" },
    issuanceDate: "2025-10-15T00:00:00.000Z",
    credentialSubject: {
      id: "did:example:holder001",
      full_name: "Somchai Jaidee",
      national_id: "1-1234-56789-01-2",
      kyc_level: 3,
      aml_status: "clear",
    },
  },
  {
    id: "vc-income-001",
    type: ["VerifiableCredential", "IncomeCredential"],
    issuer: { id: "did:example:kyc-issuer" },
    issuanceDate: "2025-10-20T00:00:00.000Z",
    credentialSubject: {
      id: "did:example:holder001",
      average_monthly_income: 45000,
      income_period_months: 12,
      platform_name: "Fastwork",
    },
  },
  {
    id: "vc-work-001",
    type: ["VerifiableCredential", "WorkHistoryCredential"],
    issuer: { id: "did:example:kyc-issuer" },
    issuanceDate: "2025-10-22T00:00:00.000Z",
    credentialSubject: {
      id: "did:example:holder001",
      completed_jobs: 128,
      average_rating: 4.8,
      work_consistency_score: 92,
    },
  },
  {
    id: "vc-tax-001",
    type: ["VerifiableCredential", "TaxCredential"],
    issuer: { id: "did:example:kyc-issuer" },
    issuanceDate: "2025-10-25T00:00:00.000Z",
    credentialSubject: {
      id: "did:example:holder001",
      tax_filing_status: "filed",
      income_bracket: "300,000–500,000",
      tax_year: 2024,
    },
  },
];
const MOCK_HISTORY = [
  {
    id: "v-1",
    holderDid: "did:example:holder001",
    loanName: "สินเชื่อส่วนบุคคล",
    result: "approved",
    amount: 900000,
    verifiedAt: "2025-11-02 10:15",
  },
  {
    id: "v-2",
    holderDid: "did:example:holder002",
    loanName: "สินเชื่อรถยนต์",
    result: "approved",
    amount: 1200000,
    verifiedAt: "2025-10-29 14:32",
  },
  {
    id: "v-3",
    holderDid: "did:example:holder003",
    loanName: "สินเชื่อบ้าน/อสังหาฯ",
    result: "rejected",
    amount: 0,
    verifiedAt: "2025-10-20 09:01",
  },
];

// ─── VC TYPE CONFIG ───────────────────────────────────────────────────────────
const VC_TYPES = {
  kyc: {
    label: "KYC",
    credType: "KYCCredential",
    vcLabel: "KYC VC",
    accent: "from-violet-600 to-violet-700",
    badge: "bg-violet-50 text-violet-700 border border-violet-200",
    desc: "ยืนยันตัวตนและ AML status",
  },
  income: {
    label: "Income",
    credType: "IncomeCredential",
    vcLabel: "Income VC",
    accent: "from-blue-600 to-blue-700",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    desc: "ประเมินความสามารถในการชำระหนี้",
  },
  workHistory: {
    label: "Work History",
    credType: "WorkHistoryCredential",
    vcLabel: "Work History VC",
    accent: "from-indigo-600 to-indigo-700",
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    desc: "ข้อมูลประวัติการทำงาน Freelance",
  },
  tax: {
    label: "Tax",
    credType: "TaxCredential",
    vcLabel: "Tax VC",
    accent: "from-slate-500 to-slate-600",
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    desc: "ยืนยันสถานะการยื่นภาษี",
  },
};
function vcTypeKey(types) {
  const credType = types?.find((t) => t !== "VerifiableCredential");
  return Object.entries(VC_TYPES).find(([, v]) => v.credType === credType)?.[0];
}

// ─── APPROVAL LOGIC ───────────────────────────────────────────────────────────
function calculateApproval(loan, selectedVCs) {
  const provided = new Set(selectedVCs.map((vc) => vcTypeKey(vc.type)));
  const missing = loan.requiredTypes.filter((t) => !provided.has(t));

  if (missing.length > 0) {
    return {
      approved: false,
      reasons: missing.map(
        (t) => `ไม่ได้แนบ ${VC_TYPES[t].vcLabel} ซึ่งเป็นข้อมูลจำเป็น`,
      ),
    };
  }

  const incomeVC = selectedVCs.find((vc) => vcTypeKey(vc.type) === "income");
  const monthlyIncome =
    incomeVC?.credentialSubject?.average_monthly_income || 0;

  if (monthlyIncome < loan.minIncome) {
    return {
      approved: false,
      reasons: [
        `รายได้ต่อเดือน ${monthlyIncome.toLocaleString()} บาท ต่ำกว่าเกณฑ์ขั้นต่ำ ${loan.minIncome.toLocaleString()} บาท/เดือน`,
        "ไม่ผ่านเกณฑ์การประเมินความสามารถในการชำระหนี้",
      ],
    };
  }

  const approvedAmount = Math.min(
    Math.floor((monthlyIncome * loan.multiplier) / 10000) * 10000,
    loan.maxAmount,
  );
  const r = parseFloat(loan.interestRate.split("–")[0]) / 100 / 12;
  const n = loan.defaultTerm;
  const monthly = Math.round(
    (approvedAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1),
  );

  return {
    approved: true,
    approvedAmount,
    interestRate: loan.interestRate.split("–")[0] + "% ต่อปี",
    term: `${n} เดือน`,
    monthlyPayment: monthly,
  };
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
    success:
      "bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 shadow-md shadow-emerald-200",
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
    id: "apply",
    label: "ขอสินเชื่อ",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    id: "history",
    label: "ประวัติการขอสินเชื่อ",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col bg-[#0f1d36] shrink-0">
      <div className="px-5 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center flex-shrink-0">
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
              TrustVerifier
            </p>
            <p className="text-emerald-300/60 text-[10px] tracking-widest uppercase">
              KBank Credit Bureau
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${active === item.id ? "bg-emerald-600/20 text-emerald-200 border-l-2 border-emerald-400 pl-[10px]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
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
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex-shrink-0" />
            <p className="text-white text-xs font-semibold">KBank</p>
          </div>
          <p className="text-slate-500 text-[10px] font-mono truncate">
            did:example:kbank001
          </p>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-slate-500">
              Verification service active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, actions }) {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
          {subtitle}
        </p>

        <h1 className="text-gray-900 font-bold text-lg leading-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <button className="relative w-8 h-8 flex items-center justify-center rounded-sm bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
        </button>
      </div>
    </header>
  );
}

function Shell({ children, active, onNavigate }) {
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <Sidebar active={active} onNavigate={onNavigate} />

      {/* เนื้อหาหลัก */}
      <div className="lg:ml-60 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}

// ─── LOAN ICON ────────────────────────────────────────────────────────────────
function LoanIcon({ id, className = "w-7 h-7 text-white" }) {
  const paths = {
    personal:
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    auto: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    sme: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  };
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d={paths[id] || paths.personal}
      />
    </svg>
  );
}

// ─── MOCK QR CODE ─────────────────────────────────────────────────────────────
function MockQR() {
  const rows = [
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
  ];
  return (
    <div className="bg-white p-3 border-2 border-gray-900 rounded-sm inline-block">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(21, 8px)",
          gap: "1px",
        }}
      >
        {rows.flat().map((cell, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              backgroundColor: cell ? "#111827" : "transparent",
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SCREEN 1: LOAN LIST ──────────────────────────────────────────────────────
function ScreenLoanList({ onSelect, onNavigate }) {
  return (
    <Shell active="apply" onNavigate={onNavigate}>
      <TopBar
        title="เลือกประเภทสินเชื่อ"
        subtitle="KBank Credit Verification Platform"
      />

      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-8 mb-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-200/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-200/20 blur-3xl rounded-full" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Credit Verification Flow
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight mb-4">
              เลือกประเภทสินเชื่อ
              <br />
              สำหรับเริ่มต้นการตรวจสอบข้อมูล
            </h1>

            <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
              ระบบจะกำหนดประเภท Verifiable Credentials (VCs)
              ที่จำเป็นสำหรับการประเมินสินเชื่อโดยอัตโนมัติ
              เพื่อช่วยลดขั้นตอนการตรวจสอบเอกสารและเพิ่มความรวดเร็วในการอนุมัติ
            </p>
          </div>
        </div>

        {/* SECTION HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Loan Products
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              เลือกผลิตภัณฑ์สินเชื่อที่ต้องการตรวจสอบ
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            {LOAN_PRODUCTS.length} products available
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {LOAN_PRODUCTS.map((loan) => (
            <button
              key={loan.id}
              onClick={() => onSelect(loan)}
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-slate-300
                hover:shadow-2xl
                hover:shadow-slate-200/60
              "
            >
              {/* top accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${loan.gradient}`}
              />

              {/* icon */}
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${loan.gradient} flex items-center justify-center shadow-lg shadow-slate-200`}
                >
                  <LoanIcon id={loan.id} className="w-7 h-7 text-white" />
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-slate-400"
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
                </div>
              </div>

              {/* title */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-1">
                  {loan.name}
                </h3>

                <p className="text-sm text-slate-400">{loan.nameEn}</p>
              </div>

              {/* desc */}
              <p className="text-sm text-slate-600 leading-relaxed mb-6 min-h-[66px]">
                {loan.description}
              </p>

              {/* stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">วงเงินสูงสุด</span>

                  <span className="text-sm font-semibold text-slate-900">
                    {(loan.maxAmount / 1000000).toFixed(0)}M บาท
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">ดอกเบี้ย</span>

                  <span className="text-sm font-semibold text-slate-900">
                    {loan.interestRate}%
                  </span>
                </div>
              </div>

              {/* vc tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {loan.requiredTypes.map((t) => (
                  <div
                    key={t}
                    className="
                      px-2.5
                      py-1
                      rounded-full
                      bg-slate-100
                      text-slate-600
                      text-xs
                      font-medium
                    "
                  >
                    {VC_TYPES[t].vcLabel}
                  </div>
                ))}
              </div>

              {/* footer */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Required Credentials</p>

                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {loan.requiredTypes.length} Required
                  </p>
                </div>

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-slate-100
                    flex
                    items-center
                    justify-center
                    group-hover:bg-slate-900
                    transition-colors
                  "
                >
                  <svg
                    className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors"
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
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN 2: LOAN DETAIL (staff review) ────────────────────────────────────
function ScreenLoanDetail({ loan, onConfirm, onBack }) {
  return (
    <Shell active="apply" onNavigate={() => {}}>
      <TopBar
        title={loan.name}
        subtitle="Loan Verification Configuration"
        actions={
          <Btn onClick={onBack} variant="ghost">
            ← เปลี่ยนสินเชื่อ
          </Btn>
        }
      />

      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        {/* STEP */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto">
          {[
            "เลือกสินเชื่อ",
            "ตรวจสอบข้อมูล",
            "สร้าง QR",
            "Verification",
            "ผลลัพธ์",
          ].map((step, index) => (
            <div key={step} className="flex items-center gap-3 flex-shrink-0">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium
                ${
                  index <= 1
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full
                  ${index <= 1 ? "bg-emerald-500" : "bg-slate-300"}
                `}
                />

                {step}
              </div>

              {index !== 4 && <div className="w-6 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
          {/* MAIN CONTENT */}
          <div>
            {/* HERO */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 mb-6">
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${loan.gradient}`}
              />

              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${loan.gradient}
                  flex items-center justify-center shadow-xl shadow-slate-200 flex-shrink-0`}
                >
                  <LoanIcon id={loan.id} className="w-10 h-10 text-white" />
                </div>

                <div className="flex-1">
                  <div className="mb-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-4">
                      Verification Required
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
                      {loan.name}
                    </h1>

                    <p className="text-slate-600 leading-relaxed max-w-2xl">
                      {loan.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400 mb-1">
                        วงเงินสูงสุด
                      </p>

                      <p className="text-lg font-bold text-slate-900">
                        {(loan.maxAmount / 1000000).toFixed(0)}M
                      </p>

                      <p className="text-xs text-slate-500">บาท</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400 mb-1">ดอกเบี้ย</p>

                      <p className="text-lg font-bold text-slate-900">
                        {loan.interestRate}%
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Required</p>

                      <p className="text-lg font-bold text-slate-900">
                        {loan.requiredTypes.length}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Consent</p>

                      <p className="text-lg font-bold text-slate-900">
                        {loan.consentTypes.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* REQUIRED */}
            <div className="rounded-3xl border border-red-100 bg-white p-8 mb-6">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    ข้อมูลที่จำเป็น
                  </h2>

                  <p className="text-slate-500">
                    Holder จำเป็นต้องส่งข้อมูลเหล่านี้ครบทั้งหมด
                    เพื่อให้ระบบสามารถประเมินสินเชื่อได้
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {loan.requiredTypes.map((t) => {
                  const cfg = VC_TYPES[t];

                  return (
                    <div
                      key={t}
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        p-5
                        hover:border-slate-300
                        hover:bg-slate-50/50
                        transition-all
                      "
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-red-500"
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

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">
                              {cfg.vcLabel}
                            </h3>

                            <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                              Required
                            </span>
                          </div>

                          <p className="text-slate-600 text-sm leading-relaxed">
                            {cfg.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CONSENT */}
            <div className="rounded-3xl border border-blue-100 bg-white p-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-500"
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
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    ข้อมูลเพิ่มเติม
                  </h2>

                  <p className="text-slate-500">
                    ข้อมูลส่วนนี้ขึ้นอยู่กับการยินยอมของ Holder
                  </p>
                </div>
              </div>

              {loan.consentTypes.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
                  <p className="text-slate-500">
                    ไม่มีข้อมูลเพิ่มเติมสำหรับสินเชื่อนี้
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loan.consentTypes.map((t) => {
                    const cfg = VC_TYPES[t];

                    return (
                      <div
                        key={t}
                        className="
                          rounded-2xl
                          border
                          border-slate-200
                          p-5
                          hover:border-slate-300
                          hover:bg-slate-50/50
                          transition-all
                        "
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-blue-500"
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

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="font-semibold text-slate-900">
                                {cfg.vcLabel}
                              </h3>

                              <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                                Optional
                              </span>
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed">
                              {cfg.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-5">
                ขั้นตอนถัดไป
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>

                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      สร้าง QR Code
                    </p>

                    <p className="text-slate-500 text-sm">
                      สำหรับให้ Holder สแกนผ่าน Wallet
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>

                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      Holder ยืนยันข้อมูล
                    </p>

                    <p className="text-slate-500 text-sm">
                      และส่ง Verifiable Presentation
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>

                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      ระบบประเมินผล
                    </p>

                    <p className="text-slate-500 text-sm">
                      และคำนวณวงเงินสินเชื่ออัตโนมัติ
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onConfirm}
                className="
                  w-full
                  h-14
                  rounded-2xl
                  bg-emerald-600
                  hover:bg-emerald-700
                  text-white
                  font-semibold
                  transition-all
                  shadow-lg
                  shadow-emerald-200
                  hover:shadow-xl
                  hover:shadow-emerald-300/50
                "
              >
                ดำเนินการต่อ
              </button>

              <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
                ระบบจะสร้าง QR Code เพื่อให้ Holder ยืนยันข้อมูลผ่าน TrustVault
                Wallet
              </p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN 3: QR CODE ───────────────────────────────────────────────────────
function ScreenQR({ loan, onBack }) {
  const [scanned, setScanned] = useState(false);

  const handleSimulate = () => {
    setScanned(true);

    sessionStorage.setItem(
      "verifier_request",
      JSON.stringify({
        loanId: loan.id,
        loanName: loan.name,
        requiredTypes: loan.requiredTypes,
        consentTypes: loan.consentTypes,
      }),
    );

    setTimeout(() => {
      window.location.href = "/holder";
    }, 1200);
  };

  return (
    <Shell active="apply" onNavigate={() => {}}>
      <TopBar
        title="QR Verification"
        subtitle={loan.name}
        actions={
          <Btn onClick={onBack} variant="ghost">
            ← Back
          </Btn>
        }
      />

      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        {/* STEP FLOW */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto">
          {[
            "เลือกสินเชื่อ",
            "ตรวจสอบข้อมูล",
            "สร้าง QR",
            "Holder Verification",
            "ผลลัพธ์",
          ].map((step, index) => (
            <div key={step} className="flex items-center gap-3 flex-shrink-0">
              <div
                className={`
                  px-4 py-2 rounded-full border text-sm font-medium
                  flex items-center gap-2
                  ${
                    index <= 2
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-400"
                  }
                `}
              >
                <div
                  className={`
                    w-2 h-2 rounded-full
                    ${index <= 2 ? "bg-emerald-500" : "bg-slate-300"}
                  `}
                />

                {step}
              </div>

              {index !== 4 && <div className="w-6 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-8">
          {/* LEFT SIDEBAR */}
          <div className="space-y-6">
            {/* REQUEST DETAIL */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${loan.gradient}
                  flex items-center justify-center shadow-lg shadow-slate-200`}
                >
                  <LoanIcon id={loan.id} className="w-7 h-7 text-white" />
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {loan.name}
                  </p>

                  <p className="text-sm text-slate-400">
                    Credit Verification Request
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-3">
                    Required Credentials
                  </p>

                  <div className="space-y-2">
                    {loan.requiredTypes.map((t) => (
                      <div
                        key={t}
                        className="
                          flex items-center justify-between
                          rounded-2xl
                          border
                          border-red-100
                          bg-red-50/60
                          px-4 py-3
                        "
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {VC_TYPES[t].vcLabel}
                        </span>

                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                          Required
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {loan.consentTypes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-3">
                      Optional Consent
                    </p>

                    <div className="space-y-2">
                      {loan.consentTypes.map((t) => (
                        <div
                          key={t}
                          className="
                            flex items-center justify-between
                            rounded-2xl
                            border
                            border-blue-100
                            bg-blue-50/60
                            px-4 py-3
                          "
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {VC_TYPES[t].vcLabel}
                          </span>

                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                            Optional
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STATUS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                {!scanned ? (
                  <>
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-4 h-4 rounded-full bg-amber-400 animate-ping opacity-30" />

                      <div className="w-3 h-3 rounded-full bg-amber-400 relative z-10" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        Waiting for Scan
                      </p>

                      <p className="text-sm text-slate-500">
                        QR Code expires in 10 minutes
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-30" />

                      <div className="w-3 h-3 rounded-full bg-emerald-500 relative z-10" />
                    </div>

                    <div>
                      <p className="font-semibold text-emerald-700">
                        QR Scanned Successfully
                      </p>

                      <p className="text-sm text-slate-500">
                        Opening TrustVault Wallet...
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  Holder opens TrustVault Wallet
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  Scan QR Verification Request
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  Approve Credential Sharing
                </div>
              </div>
            </div>
          </div>

          {/* QR CENTER */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[32px]
              border
              border-slate-200
              bg-white
              min-h-[720px]
              flex
              flex-col
              items-center
              justify-center
              px-10
              py-14
            "
          >
            {/* BG */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-emerald-50 to-transparent" />

            <div className="relative z-10 flex flex-col items-center w-full">
              {/* BADGE */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-8">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Secure VC Verification
              </div>

              {/* TITLE */}
              <h1 className="text-4xl font-bold text-slate-900 text-center leading-tight mb-4">
                ให้ Holder สแกน QR Code
              </h1>

              <p className="text-slate-500 text-center text-lg max-w-xl leading-relaxed mb-10">
                ใช้ TrustVault Wallet เพื่อยืนยันตัวตน และส่ง Verifiable
                Credentials อย่างปลอดภัย
              </p>

              {/* QR */}
              <div
                className="
                  relative
                  rounded-[40px]
                  bg-white
                  border
                  border-slate-200
                  shadow-2xl
                  shadow-slate-200/60
                  p-10
                  mb-8
                "
              >
                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-emerald-50/40 to-blue-50/40 pointer-events-none" />

                <div className="relative">
                  <MockQR />
                </div>
              </div>

              {/* SECURITY */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                <div
                  className="
                    px-4 py-2 rounded-full
                    bg-emerald-50
                    text-emerald-700
                    text-sm
                    font-semibold
                    flex items-center gap-2
                  "
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  DID Resolution Enabled
                </div>

                <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                  Encrypted Request
                </div>

                <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                  Selective Disclosure
                </div>
              </div>

              {/* ACTION */}
              <button
                onClick={handleSimulate}
                disabled={scanned}
                className="
                  h-14
                  px-8
                  rounded-2xl
                  bg-emerald-600
                  hover:bg-emerald-700
                  disabled:bg-emerald-300
                  text-white
                  font-semibold
                  transition-all
                  shadow-xl
                  shadow-emerald-200
                  hover:shadow-2xl
                  hover:shadow-emerald-300/50
                  flex
                  items-center
                  gap-3
                "
              >
                {!scanned ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Simulate QR Scan
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-30"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-100"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Redirecting to Wallet...
                  </>
                )}
              </button>

              <p className="text-xs text-slate-400 mt-4">
                Demo Environment Only
              </p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN 5: PROCESSING ────────────────────────────────────────────────────
function ScreenProcessing({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    "Resolving Holder DID",
    "Verifying Holder DID Document",
    "Resolving Issuer DID",
    "Verifying Issuer Trust Chain",
    "Validating Verifiable Credentials",
    "Verifying Digital Signatures",
    "Checking Credential Revocation Status",
    "Analyzing Financial Information",
    "Calculating Credit Assessment",
  ];

  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 800)
    );

    const done = setTimeout(() => {
      onComplete();
    }, steps.length * 800 + 1200);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onComplete]);

  return (
    <Shell active="apply" onNavigate={() => {}}>
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          px-6
          py-12
          bg-gradient-to-b
          from-slate-50
          to-slate-100
        "
      >
        <div className="max-w-xl w-full">
          {/* ICON */}
          <div className="relative flex items-center justify-center mb-10">
            <div className="absolute w-44 h-44 rounded-full bg-emerald-200/20 blur-3xl" />

            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg
                className="absolute animate-spin w-32 h-32 text-emerald-100"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>

              <svg
                className="absolute animate-spin w-32 h-32 text-emerald-600"
                style={{ animationDuration: "1s" }}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  className="opacity-100"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>

              <div
                className="
                  w-20 h-20
                  rounded-3xl
                  bg-white
                  shadow-xl
                  border
                  border-slate-200
                  flex
                  items-center
                  justify-center
                "
              >
                <svg
                  className="w-10 h-10 text-emerald-600"
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
          </div>

          {/* TITLE */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              กำลังประมวลผลข้อมูล
            </h1>

            <p className="text-slate-500 text-lg leading-relaxed">
              ระบบกำลังตรวจสอบ Verifiable Credentials และประเมินข้อมูลทางการเงิน
            </p>
          </div>

          {/* DID VERIFICATION */}
          <div
            className="
              rounded-3xl
              border
              border-emerald-100
              bg-white
              p-6
              shadow-xl
              shadow-emerald-100/30
              mb-6
            "
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  DID Verification
                </p>

                <p className="text-sm text-slate-500">
                  Resolving decentralized identifiers
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Check
              </div>
            </div>

            <div className="space-y-4">
              {/* HOLDER DID */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Holder DID
                    </p>

                    <p className="font-mono text-sm text-slate-800 break-all">
                      did:key:z6Mkholder8F3A92LmX
                    </p>
                  </div>

                  {step >= 2 ? (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                      <svg
                        className="w-4 h-4"
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
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-30"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-100"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Resolving...
                    </div>
                  )}
                </div>
              </div>

              {/* ISSUER DID */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Issuer DID
                    </p>

                    <p className="font-mono text-sm text-slate-800 break-all">
                      did:web:issuer.trustbank.io
                    </p>
                  </div>

                  {step >= 4 ? (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                      <svg
                        className="w-4 h-4"
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
                      Trusted
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-30"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-100"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Validating...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-8
              shadow-xl
              shadow-slate-100
            "
          >
            <div className="space-y-6">
              {steps.map((s, i) => {
                const active = i < step;
                const current = i === step;

                return (
                  <div
                    key={i}
                    className="
                      flex
                      items-start
                      gap-4
                    "
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`
                          w-10 h-10 rounded-2xl flex items-center justify-center border transition-all
                          ${
                            active
                              ? "bg-emerald-50 border-emerald-200"
                              : current
                                ? "bg-blue-50 border-blue-200"
                                : "bg-slate-50 border-slate-200"
                          }
                        `}
                      >
                        {active ? (
                          <svg
                            className="w-5 h-5 text-emerald-600"
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
                        ) : current ? (
                          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-slate-300" />
                        )}
                      </div>

                      {i !== steps.length - 1 && (
                        <div
                          className={`
                            w-px h-10 mt-2
                            ${active ? "bg-emerald-200" : "bg-slate-200"}
                          `}
                        />
                      )}
                    </div>

                    <div className="pt-1">
                      <p
                        className={`
                          font-medium
                          ${
                            active
                              ? "text-slate-900"
                              : current
                                ? "text-blue-700"
                                : "text-slate-400"
                          }
                        `}
                      >
                        {s}
                      </p>

                      <p className="text-sm text-slate-400 mt-1">
                        {active
                          ? "Completed"
                          : current
                            ? "Processing..."
                            : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <p className="text-center text-sm text-slate-400 mt-8">
            Secure cryptographic verification in progress
          </p>
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN 6: RESULT ────────────────────────────────────────────────────────
function ScreenResult({ approval, loan, onNewApplication }) {
  if (approval.approved) {
    return (
      <Shell active="apply" onNavigate={() => {}}>
        <div
          className="
            min-h-screen
            bg-gradient-to-b
            from-emerald-50
            via-white
            to-slate-50
            px-6
            py-12
            flex
            items-center
            justify-center
          "
        >
          <div className="max-w-4xl w-full">
            {/* HERO */}
            <div className="text-center mb-10">
              <div className="relative inline-flex mb-7">
                <div
                  className="
                    absolute
                    inset-0
                    bg-emerald-300/30
                    blur-3xl
                    rounded-full
                    scale-150
                  "
                />

                <div
                  className="
                    relative
                    w-32
                    h-32
                    rounded-full
                    bg-white
                    border-[10px]
                    border-emerald-100
                    shadow-2xl
                    flex
                    items-center
                    justify-center
                  "
                >
                  <svg
                    className="w-16 h-16 text-emerald-600"
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

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-full
                  bg-emerald-100
                  text-emerald-700
                  text-sm
                  font-semibold
                  mb-5
                "
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Approved Successfully
              </div>

              <h1
                className="
                  text-6xl
                  md:text-7xl
                  font-black
                  tracking-tight
                  text-slate-900
                  mb-4
                "
              >
                อนุมัติสินเชื่อ
              </h1>

              <p className="text-xl text-slate-600 font-medium mb-2">
                {loan.name}
              </p>

              <p className="text-slate-500 leading-relaxed max-w-xl mx-auto">
                ระบบตรวจสอบ Verifiable Credentials, Digital Signatures
                และข้อมูลทางการเงินเรียบร้อยแล้ว
              </p>
            </div>

            {/* MAIN STATS */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div
                className="
                  rounded-3xl
                  bg-white
                  border
                  border-emerald-100
                  p-8
                  shadow-xl
                  shadow-emerald-100/40
                "
              >
                <p
                  className="
                    text-sm
                    uppercase
                    tracking-[0.2em]
                    text-slate-400
                    font-semibold
                    mb-3
                  "
                >
                  Approved Amount
                </p>

                <div className="flex items-end gap-3">
                  <h2
                    className="
                      text-5xl
                      font-black
                      text-emerald-600
                      leading-none
                    "
                  >
                    {approval.approvedAmount.toLocaleString()}
                  </h2>

                  <span className="text-slate-500 text-lg mb-1">บาท</span>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-emerald-700 font-medium">
                    พร้อมดำเนินการอนุมัติ
                  </span>
                </div>
              </div>

              <div
                className="
                  rounded-3xl
                  bg-white
                  border
                  border-slate-200
                  p-8
                  shadow-xl
                  shadow-slate-100
                "
              >
                <p
                  className="
                    text-sm
                    uppercase
                    tracking-[0.2em]
                    text-slate-400
                    font-semibold
                    mb-3
                  "
                >
                  Estimated Monthly Payment
                </p>

                <div className="flex items-end gap-3">
                  <h2
                    className="
                      text-5xl
                      font-black
                      text-slate-900
                      leading-none
                    "
                  >
                    {approval.monthlyPayment.toLocaleString()}
                  </h2>

                  <span className="text-slate-500 text-lg mb-1">/ เดือน</span>
                </div>

                <p className="text-slate-500 mt-5">
                  ระยะเวลาผ่อน {approval.term}
                </p>
              </div>
            </div>

            {/* DETAIL */}
            <div
              className="
                rounded-3xl
                bg-white
                border
                border-slate-200
                p-8
                shadow-xl
                shadow-slate-100
                mb-8
              "
            >
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    label: "Interest Rate",
                    value: approval.interestRate,
                  },
                  {
                    label: "Loan Term",
                    value: approval.term,
                  },
                  {
                    label: "Loan Type",
                    value: loan.nameEn,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-[0.2em]
                        text-slate-400
                        font-semibold
                        mb-2
                      "
                    >
                      {item.label}
                    </p>

                    <p className="text-lg font-bold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col md:flex-row gap-4">
              <button
                className="
                  flex-1
                  h-14
                  rounded-2xl
                  bg-emerald-600
                  hover:bg-emerald-700
                  text-white
                  font-semibold
                  transition-all
                  shadow-xl
                  shadow-emerald-200
                "
              >
                พิมพ์ใบอนุมัติ
              </button>

              <button
                onClick={onNewApplication}
                className="
                  flex-1
                  h-14
                  rounded-2xl
                  bg-white
                  border
                  border-slate-300
                  hover:bg-slate-50
                  text-slate-700
                  font-semibold
                  transition-all
                "
              >
                เริ่มคำขอใหม่
              </button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell active="apply" onNavigate={() => {}}>
      <div
        className="
          min-h-screen
          bg-gradient-to-b
          from-red-50
          via-white
          to-slate-50
          px-6
          py-12
          flex
          items-center
          justify-center
        "
      >
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="relative inline-flex mb-7">
              <div
                className="
                  absolute
                  inset-0
                  bg-red-300/20
                  blur-3xl
                  rounded-full
                  scale-150
                "
              />

              <div
                className="
                  relative
                  w-32
                  h-32
                  rounded-full
                  bg-white
                  border-[10px]
                  border-red-100
                  shadow-2xl
                  flex
                  items-center
                  justify-center
                "
              >
                <svg
                  className="w-16 h-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            <h1
              className="
                text-5xl
                font-black
                text-slate-900
                mb-4
              "
            >
              ไม่อนุมัติสินเชื่อ
            </h1>

            <p className="text-lg text-slate-500">
              ระบบไม่สามารถอนุมัติคำขอนี้ได้
            </p>
          </div>

          <div
            className="
              rounded-3xl
              bg-white
              border
              border-red-100
              p-8
              shadow-xl
              shadow-red-100/30
              mb-8
            "
          >
            <div className="mb-6">
              <p
                className="
                  text-sm
                  uppercase
                  tracking-[0.2em]
                  text-red-500
                  font-semibold
                "
              >
                Rejection Reasons
              </p>
            </div>

            <div className="space-y-5">
              {approval.reasons.map((reason, i) => (
                <div
                  key={i}
                  className="
                    flex
                    items-start
                    gap-4
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-2xl
                      bg-red-50
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    "
                  >
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="font-medium text-slate-800">{reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNewApplication}
            className="
              w-full
              h-14
              rounded-2xl
              bg-slate-900
              hover:bg-slate-800
              text-white
              font-semibold
              transition-all
            "
          >
            เริ่มคำขอใหม่
          </button>
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN: HISTORY ─────────────────────────────────────────────────────────
function ScreenHistory({ history, onNavigate, onOpenDetail }) {
  const approved = history.filter((h) => h.result === "approved").length;

  const rejected = history.filter((h) => h.result === "rejected").length;

  return (
    <Shell active="history" onNavigate={onNavigate}>
      <div
        className="
          min-h-screen
          bg-slate-50
          px-6
          py-8
        "
      >
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Loan Request History
            </h1>

            <p className="text-slate-500">
              ประวัติการตรวจสอบและอนุมัติสินเชื่อ
            </p>
          </div>

          {/* STATS */}
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              {
                label: "Total Requests",
                value: history.length,
                accent: "bg-slate-900",
              },
              {
                label: "Approved",
                value: approved,
                accent: "bg-emerald-500",
              },
              {
                label: "Rejected",
                value: rejected,
                accent: "bg-red-500",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                  bg-white
                  border
                  border-slate-200
                  p-6
                  shadow-lg
                  shadow-slate-100
                "
              >
                <div
                  className={`
                    absolute
                    top-0
                    left-0
                    w-full
                    h-1
                    ${s.accent}
                  `}
                />

                <p
                  className="
                    text-sm
                    uppercase
                    tracking-[0.2em]
                    text-slate-400
                    font-semibold
                    mb-3
                  "
                >
                  {s.label}
                </p>

                <h2
                  className="
                    text-5xl
                    font-black
                    text-slate-900
                  "
                >
                  {s.value}
                </h2>
              </div>
            ))}
          </div>

          {/* LIST */}
          <div
            className="
              rounded-3xl
              bg-white
              border
              border-slate-200
              overflow-hidden
              shadow-xl
              shadow-slate-100
            "
          >
            <div
              className="
                px-8
                py-5
                border-b
                border-slate-100
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h2 className="font-bold text-slate-900">
                  Recent Applications
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  รายการตรวจสอบล่าสุด
                </p>
              </div>

              <div
                className="
                  px-3
                  py-1.5
                  rounded-full
                  bg-slate-100
                  text-slate-600
                  text-sm
                  font-medium
                "
              >
                {history.length} Records
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {history.map((h) => {
                const approved = h.result === "approved";

                return (
                  <button
                    key={h.id}
                    onClick={() => onOpenDetail(h)}
                    className="
                      w-full
                      px-5
                      py-4
                      flex
                      items-center
                      gap-4
                      hover:bg-slate-50
                      transition-colors
                      text-left
                    "
                  >
                    <div className="flex items-center gap-5">
                      {/* STATUS ICON */}
                      <div
                        className={`
                          w-14
                          h-14
                          rounded-2xl
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                          ${approved ? "bg-emerald-50" : "bg-red-50"}
                        `}
                      >
                        {approved ? (
                          <svg
                            className="w-7 h-7 text-emerald-600"
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
                        ) : (
                          <svg
                            className="w-7 h-7 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>

                      {/* MAIN */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="
                              font-bold
                              text-slate-900
                              truncate
                            "
                          >
                            {h.loanName}
                          </h3>

                          <span
                            className={`
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-semibold
                              border
                              ${
                                approved
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }
                            `}
                          >
                            {approved ? "Approved" : "Rejected"}
                          </span>
                        </div>

                        <p className="text-slate-500 text-sm truncate">
                          {h.holderDid}
                        </p>

                        <p className="text-slate-400 text-sm mt-1">
                          Verified at {h.verifiedAt}
                        </p>
                      </div>

                      {/* AMOUNT */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`
                            text-2xl
                            font-black
                            ${approved ? "text-emerald-600" : "text-red-500"}
                          `}
                        >
                          {approved ? h.amount.toLocaleString() : "—"}
                        </p>

                        <p className="text-slate-400 text-sm">
                          {approved ? "บาท" : "Not Approved"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN: History Detail ──────────────────────────────────────────────────
function ScreenHistoryDetail({ item, onBack }) {
  const approved = item.result === "approved";

  return (
    <Shell active="history" onNavigate={() => {}}>
      <div className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* ส่วนหัว */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <button
                onClick={onBack}
                className="
                  mb-5
                  text-slate-500
                  hover:text-slate-900
                  text-sm
                  font-medium
                "
              >
                ← กลับไปหน้าประวัติ
              </button>

              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`
                    w-16
                    h-16
                    rounded-3xl
                    flex
                    items-center
                    justify-center
                    ${approved ? "bg-emerald-50" : "bg-red-50"}
                  `}
                >
                  {approved ? (
                    <svg
                      className="w-8 h-8 text-emerald-600"
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
                  ) : (
                    <svg
                      className="w-8 h-8 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl font-black text-slate-900">
                    {item.loanName}
                  </h1>

                  <p className="text-slate-500 mt-1">รหัสธุรกรรม: {item.id}</p>
                </div>
              </div>

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-semibold
                  border
                  ${
                    approved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                `}
              >
                <div
                  className={`
                    w-2
                    h-2
                    rounded-full
                    ${approved ? "bg-emerald-500" : "bg-red-500"}
                  `}
                />

                {approved ? "อนุมัติแล้ว" : "ปฏิเสธ"}
              </div>
            </div>

            {approved && (
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-2">วงเงินที่อนุมัติ</p>

                <h2 className="text-5xl font-black text-emerald-600">
                  {item.amount.toLocaleString()}
                </h2>

                <p className="text-slate-500 mt-1">บาท</p>
              </div>
            )}
          </div>

          {/* ไทม์ไลน์ */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* ไทม์ไลน์การตรวจสอบ */}
              <div
                className="
                  rounded-3xl
                  bg-white
                  border
                  border-slate-200
                  p-7
                "
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  ไทม์ไลน์การตรวจสอบข้อมูล
                </h2>

                <div className="space-y-6">
                  {item.timeline.map((t, i) => (
                    <div
                      key={i}
                      className="
                        flex
                        items-start
                        gap-4
                      "
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className="
                            w-10
                            h-10
                            rounded-2xl
                            bg-emerald-50
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <svg
                            className="w-5 h-5 text-emerald-600"
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

                        {i !== item.timeline.length - 1 && (
                          <div className="w-px h-12 bg-slate-200 mt-2" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {t.title}
                        </p>

                        <p className="text-slate-500 text-sm mt-1">{t.desc}</p>

                        <p className="text-slate-400 text-xs mt-2">{t.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* เอกสารรับรองที่แชร์ */}
              <div
                className="
                  rounded-3xl
                  bg-white
                  border
                  border-slate-200
                  p-7
                "
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  เอกสารรับรองที่แชร์
                </h2>

                <div className="space-y-4">
                  {item.sharedCredentials.map((vc) => (
                    <div
                      key={vc.id}
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        p-5
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {vc.label}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          ออกโดย {vc.issuer}
                        </p>
                      </div>

                      <span
                        className="
                          px-3
                          py-1
                          rounded-full
                          bg-emerald-50
                          text-emerald-700
                          text-xs
                          font-semibold
                        "
                      >
                        ตรวจสอบแล้ว
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* แถบด้านข้าง */}
            <div className="space-y-6">
              {/* สถานะการยืนยัน */}
              <div
                className="
                  rounded-3xl
                  bg-white
                  border
                  border-slate-200
                  p-6
                "
              >
                <h2 className="text-lg font-bold text-slate-900 mb-5">
                  สถานะการตรวจสอบ
                </h2>

                <div className="space-y-4">
                  {[
                    "ยืนยัน DID แล้ว",
                    "ลายเซ็นดิจิทัลถูกต้อง",
                    "ผู้ออกเอกสารเชื่อถือได้",
                    "ตรวจสอบการเพิกถอนแล้ว",
                  ].map((v) => (
                    <div
                      key={v}
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <span className="text-slate-600">{v}</span>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-emerald-600
                          text-sm
                          font-semibold
                        "
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        ผ่าน
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* วิเคราะห์ทางการเงิน */}
              <div
                className="
                  rounded-3xl
                  bg-white
                  border
                  border-slate-200
                  p-6
                "
              >
                <h2 className="text-lg font-bold text-slate-900 mb-5">
                  การวิเคราะห์ทางการเงิน
                </h2>

                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">
                      ระดับความเสี่ยง
                    </p>

                    <div
                      className="
                        inline-flex
                        px-3
                        py-1
                        rounded-full
                        bg-emerald-50
                        text-emerald-700
                        text-sm
                        font-semibold
                      "
                    >
                      ความเสี่ยงต่ำ
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">คะแนนรายได้</p>

                    <p className="text-3xl font-black text-slate-900">92</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">
                      สัดส่วนหนี้สิน
                    </p>

                    <p className="text-2xl font-bold text-slate-900">18%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function Verifier() {
  const [screen, setScreen] = useState("loans");
  const [loan, setLoan] = useState(null);
  const [approval, setApproval] = useState(null);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Detect return from holder wallet after VP submission
  useEffect(() => {
    const submittedStr = sessionStorage.getItem("holder_submitted");
    const requestStr = sessionStorage.getItem("verifier_request");

    if (!submittedStr || !requestStr) return;

    let submittedData;
    let requestData;

    try {
      submittedData = JSON.parse(submittedStr);
      requestData = JSON.parse(requestStr);
    } catch (error) {
      console.error("Invalid session storage data", error);

      sessionStorage.removeItem("holder_submitted");
      sessionStorage.removeItem("verifier_request");

      return;
    }

    const { submittedVCTypes = [] } = submittedData;
    const { loanId } = requestData;

    sessionStorage.removeItem("holder_submitted");
    sessionStorage.removeItem("verifier_request");

    const foundLoan = LOAN_PRODUCTS.find((l) => l.id === loanId);

    if (!foundLoan) {
      console.error("Loan not found");
      return;
    }

    const selectedVCs = submittedVCTypes
      .map((type) => MOCK_HOLDER_VCS.find((vc) => vcTypeKey(vc.type) === type))
      .filter(Boolean);

    setLoan(foundLoan);
    setApproval(calculateApproval(foundLoan, selectedVCs));
    setScreen("processing");
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // PROCESS COMPLETE
  // ───────────────────────────────────────────────────────────────────────────
  const handleProcessingDone = () => {
    setApproval((prev) => {
      if (prev) {
        const historyItem = {
          id: `v-${Date.now()}`,

          holderDid: "did:example:holder001",

          loanName: loan?.name || "Unknown",

          loanType: loan?.nameEn || "",

          result: prev.approved ? "approved" : "rejected",

          amount: prev.approved ? prev.approvedAmount : 0,

          verifiedAt: new Date()
            .toLocaleString("en-GB", {
              hour12: false,
            })
            .replace(",", ""),

          // ─── TIMELINE ───────────────────────
          timeline: [
            {
              title: "QR Generated",
              desc: "Verifier generated request QR",
              time: "10:42:01",
            },
            {
              title: "Wallet Connected",
              desc: "Holder scanned QR successfully",
              time: "10:42:08",
            },
            {
              title: "Consent Granted",
              desc: "Holder approved VC sharing",
              time: "10:42:12",
            },
            {
              title: "VP Submitted",
              desc: "Wallet submitted presentation",
              time: "10:42:15",
            },
            {
              title: "Holder DID Verified",
              desc: "Holder DID document resolved successfully",
              time: "10:42:16",
            },
            {
              title: "Issuer DID Trusted",
              desc: "Issuer DID verified against trusted registry",
              time: "10:42:17",
            },
            {
              title: "Credential Verification",
              desc: "All digital signatures validated",
              time: "10:42:18",
            },
            {
              title: prev.approved ? "Loan Approved" : "Loan Rejected",

              desc: prev.approved
                ? "Credit scoring passed"
                : "Credit scoring failed",

              time: "10:42:22",
            },
          ],

          // ─── SHARED VCs ─────────────────────
          sharedCredentials: [...loan.requiredTypes, ...loan.consentTypes].map(
            (t) => ({
              id: t,
              label: VC_TYPES[t]?.vcLabel,
              issuer: "Trusted Issuer",
            }),
          ),

          // ─── VERIFICATION ──────────────────
          verification: {
            didVerified: true,
            holderDid: "did:key:z6Mkholder8F3A92LmX",
            issuerDid: "did:web:issuer.trustbank.io",
            signatureVerified: true,
            issuerTrusted: true,
            revocationChecked: true,
          },

          // ─── ANALYSIS ──────────────────────
          analysis: {
            riskLevel: prev.approved ? "Low Risk" : "High Risk",

            incomeScore: prev.approved ? 92 : 41,

            debtRatio: prev.approved ? "18%" : "73%",
          },

          // ─── APPROVAL DETAIL ───────────────
          approval: {
            interestRate: prev.interestRate,
            term: prev.term,
            monthlyPayment: prev.monthlyPayment,
          },

          // ─── REJECT REASONS ────────────────
          reasons: prev.reasons || [],
        };

        setHistory((h) => [historyItem, ...h]);
      }

      return prev;
    });

    setScreen("result");
  };

  // ───────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ───────────────────────────────────────────────────────────────────────────
  const handleNavigate = (id) => {
    if (id === "apply") {
      setScreen("loans");
    }

    if (id === "history") {
      setScreen("history");
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // OPEN HISTORY DETAIL
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenHistoryDetail = (item) => {
    // FIX OLD MOCK HISTORY THAT HAS NO DETAIL DATA
    const fallbackItem = {
      ...item,

      timeline: item.timeline || [
        {
          title: "Verification Started",
          desc: "Verifier initiated credential verification",
          time: item.verifiedAt,
        },
        {
          title: "Wallet Connected",
          desc: "Holder wallet connected successfully",
          time: item.verifiedAt,
        },
        {
          title: item.result === "approved" ? "Loan Approved" : "Loan Rejected",

          desc:
            item.result === "approved"
              ? "Loan approved successfully"
              : "Loan rejected by risk engine",

          time: item.verifiedAt,
        },
      ],

      sharedCredentials: item.sharedCredentials || [
        {
          id: "kyc",
          label: "KYC VC",
          issuer: "Trusted Issuer",
        },
        {
          id: "income",
          label: "Income VC",
          issuer: "Trusted Issuer",
        },
      ],

      verification: item.verification || {
        didVerified: true,
        signatureVerified: true,
        issuerTrusted: true,
        revocationChecked: true,
      },

      analysis: item.analysis || {
        riskLevel: item.result === "approved" ? "Low Risk" : "High Risk",

        incomeScore: item.result === "approved" ? 90 : 45,

        debtRatio: item.result === "approved" ? "20%" : "70%",
      },

      approval: item.approval || {
        interestRate: "5.99%",
        term: "36 เดือน",
        monthlyPayment: 12000,
      },

      reasons: item.reasons || [],
    };

    setSelectedHistory(fallbackItem);
    setScreen("history-detail");
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SCREENS
  // ───────────────────────────────────────────────────────────────────────────

  if (screen === "loans") {
    return (
      <ScreenLoanList
        onSelect={(l) => {
          setLoan(l);
          setScreen("detail");
        }}
        onNavigate={handleNavigate}
      />
    );
  }

  if (screen === "detail") {
    return (
      <ScreenLoanDetail
        loan={loan}
        onConfirm={() => setScreen("qr")}
        onBack={() => setScreen("loans")}
      />
    );
  }

  if (screen === "qr") {
    return <ScreenQR loan={loan} onBack={() => setScreen("detail")} />;
  }

  if (screen === "processing") {
    return <ScreenProcessing onComplete={handleProcessingDone} />;
  }

  if (screen === "result") {
    return (
      <ScreenResult
        approval={approval}
        loan={loan}
        onNewApplication={() => {
          setLoan(null);
          setApproval(null);
          setScreen("loans");
        }}
      />
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HISTORY
  // ───────────────────────────────────────────────────────────────────────────
  if (screen === "history") {
    return (
      <ScreenHistory
        history={history}
        onNavigate={handleNavigate}
        onOpenDetail={handleOpenHistoryDetail}
      />
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HISTORY DETAIL
  // ───────────────────────────────────────────────────────────────────────────
  if (screen === "history-detail") {
    return (
      <ScreenHistoryDetail
        item={selectedHistory}
        onBack={() => setScreen("history")}
      />
    );
  }

  return null;
}