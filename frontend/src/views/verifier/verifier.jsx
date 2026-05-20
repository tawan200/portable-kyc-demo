import { useState, useEffect } from "react"

// ─── LOAN PRODUCTS ────────────────────────────────────────────────────────────

const LOAN_PRODUCTS = [
  {
    id: "personal", name: "สินเชื่อส่วนบุคคล", nameEn: "Personal Loan",
    description: "สำหรับใช้จ่ายส่วนตัว รีไฟแนนซ์ หรือเหตุฉุกเฉิน",
    maxAmount: 1500000, interestRate: "9.99–24", term: "12–60 เดือน", defaultTerm: 36,
    requiredTypes: ["kyc", "income"], consentTypes: ["workHistory"],
    minIncome: 15000, multiplier: 20,
    gradient: "from-emerald-500 to-teal-600",
    colors: { badge: "bg-emerald-100 text-emerald-700 border border-emerald-200", activeBorder: "border-emerald-400", activeRing: "ring-emerald-100" },
  },
  {
    id: "home", name: "สินเชื่อบ้าน / อสังหาฯ", nameEn: "Home Loan",
    description: "ซื้อบ้าน คอนโด ที่ดิน หรืออสังหาริมทรัพย์",
    maxAmount: 10000000, interestRate: "3.25–6.5", term: "10–30 ปี", defaultTerm: 240,
    requiredTypes: ["kyc", "income", "tax"], consentTypes: ["workHistory"],
    minIncome: 30000, multiplier: 100,
    gradient: "from-blue-500 to-indigo-600",
    colors: { badge: "bg-blue-100 text-blue-700 border border-blue-200", activeBorder: "border-blue-400", activeRing: "ring-blue-100" },
  },
  {
    id: "auto", name: "สินเชื่อรถยนต์", nameEn: "Auto Loan",
    description: "ซื้อรถยนต์ใหม่หรือรถมือสอง ได้ทั้งรถเก๋งและรถกระบะ",
    maxAmount: 2000000, interestRate: "2.79–5.99", term: "12–84 เดือน", defaultTerm: 60,
    requiredTypes: ["kyc", "income"], consentTypes: ["tax"],
    minIncome: 15000, multiplier: 40,
    gradient: "from-violet-500 to-purple-600",
    colors: { badge: "bg-violet-100 text-violet-700 border border-violet-200", activeBorder: "border-violet-400", activeRing: "ring-violet-100" },
  },
  {
    id: "sme", name: "สินเชื่อ SME / Freelance", nameEn: "SME & Freelance Loan",
    description: "สำหรับผู้ประกอบการ Freelance และธุรกิจขนาดเล็ก-กลาง",
    maxAmount: 20000000, interestRate: "5.5–12", term: "12–120 เดือน", defaultTerm: 60,
    requiredTypes: ["kyc", "income", "workHistory"], consentTypes: ["tax"],
    minIncome: 20000, multiplier: 80,
    gradient: "from-amber-500 to-orange-600",
    colors: { badge: "bg-amber-100 text-amber-700 border border-amber-200", activeBorder: "border-amber-400", activeRing: "ring-amber-100" },
  },
]

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_HOLDER_VCS = [
  { id: "vc-kyc-001",    type: ["VerifiableCredential", "KYCCredential"],         issuer: { id: "did:example:kyc-issuer" }, issuanceDate: "2025-10-15T00:00:00.000Z", credentialSubject: { id: "did:example:holder001", full_name: "Somchai Jaidee", national_id: "1-1234-56789-01-2", kyc_level: 3, aml_status: "clear" } },
  { id: "vc-income-001", type: ["VerifiableCredential", "IncomeCredential"],      issuer: { id: "did:example:kyc-issuer" }, issuanceDate: "2025-10-20T00:00:00.000Z", credentialSubject: { id: "did:example:holder001", average_monthly_income: 45000, income_period_months: 12, platform_name: "Fastwork" } },
  { id: "vc-work-001",   type: ["VerifiableCredential", "WorkHistoryCredential"], issuer: { id: "did:example:kyc-issuer" }, issuanceDate: "2025-10-22T00:00:00.000Z", credentialSubject: { id: "did:example:holder001", completed_jobs: 128, average_rating: 4.8, work_consistency_score: 92 } },
  { id: "vc-tax-001",    type: ["VerifiableCredential", "TaxCredential"],         issuer: { id: "did:example:kyc-issuer" }, issuanceDate: "2025-10-25T00:00:00.000Z", credentialSubject: { id: "did:example:holder001", tax_filing_status: "filed", income_bracket: "300,000–500,000", tax_year: 2024 } },
]

const MOCK_HISTORY = [
  { id: "v-1", holderDid: "did:example:holder001", loanName: "สินเชื่อส่วนบุคคล", result: "approved", amount: 900000, verifiedAt: "2025-11-02 10:15" },
  { id: "v-2", holderDid: "did:example:holder002", loanName: "สินเชื่อรถยนต์",    result: "approved", amount: 1200000, verifiedAt: "2025-10-29 14:32" },
  { id: "v-3", holderDid: "did:example:holder003", loanName: "สินเชื่อบ้าน/อสังหาฯ", result: "rejected", amount: 0, verifiedAt: "2025-10-20 09:01" },
]

// ─── VC TYPE CONFIG ───────────────────────────────────────────────────────────

const VC_TYPES = {
  kyc:         { label: "KYC",          credType: "KYCCredential",         vcLabel: "KYC VC",          accent: "from-violet-600 to-violet-700", badge: "bg-violet-50 text-violet-700 border border-violet-200", desc: "ยืนยันตัวตนและ AML status" },
  income:      { label: "Income",       credType: "IncomeCredential",      vcLabel: "Income VC",       accent: "from-blue-600 to-blue-700",     badge: "bg-blue-50 text-blue-700 border border-blue-200",       desc: "ประเมินความสามารถในการชำระหนี้" },
  workHistory: { label: "Work History", credType: "WorkHistoryCredential", vcLabel: "Work History VC", accent: "from-indigo-600 to-indigo-700", badge: "bg-indigo-50 text-indigo-700 border border-indigo-200", desc: "ข้อมูลประวัติการทำงาน Freelance" },
  tax:         { label: "Tax",          credType: "TaxCredential",         vcLabel: "Tax VC",          accent: "from-slate-500 to-slate-600",   badge: "bg-slate-100 text-slate-600 border border-slate-200",   desc: "ยืนยันสถานะการยื่นภาษี" },
}

function vcTypeKey(types) {
  const credType = types?.find((t) => t !== "VerifiableCredential")
  return Object.entries(VC_TYPES).find(([, v]) => v.credType === credType)?.[0]
}
function vcCfg(types) {
  return VC_TYPES[vcTypeKey(types)] || { vcLabel: "Credential", accent: "from-gray-500 to-gray-600", badge: "bg-gray-50 text-gray-700 border border-gray-200" }
}

// ─── APPROVAL LOGIC ───────────────────────────────────────────────────────────

function calculateApproval(loan, selectedVCs) {
  const provided = new Set(selectedVCs.map((vc) => vcTypeKey(vc.type)))
  const missing  = loan.requiredTypes.filter((t) => !provided.has(t))

  if (missing.length > 0) {
    return { approved: false, reasons: missing.map((t) => `ไม่ได้แนบ ${VC_TYPES[t].vcLabel} ซึ่งเป็นข้อมูลจำเป็น`) }
  }

  const incomeVC      = selectedVCs.find((vc) => vcTypeKey(vc.type) === "income")
  const monthlyIncome = incomeVC?.credentialSubject?.average_monthly_income || 0

  if (monthlyIncome < loan.minIncome) {
    return {
      approved: false,
      reasons: [
        `รายได้ต่อเดือน ${monthlyIncome.toLocaleString()} บาท ต่ำกว่าเกณฑ์ขั้นต่ำ ${loan.minIncome.toLocaleString()} บาท/เดือน`,
        "ไม่ผ่านเกณฑ์การประเมินความสามารถในการชำระหนี้",
      ],
    }
  }

  const approvedAmount = Math.min(Math.floor((monthlyIncome * loan.multiplier) / 10000) * 10000, loan.maxAmount)
  const r = parseFloat(loan.interestRate.split("–")[0]) / 100 / 12
  const n = loan.defaultTerm
  const monthly = Math.round((approvedAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))

  return {
    approved: true,
    approvedAmount,
    interestRate: loan.interestRate.split("–")[0] + "% ต่อปี",
    term: `${n} เดือน`,
    monthlyPayment: monthly,
  }
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Panel({ children, className = "" }) {
  return <div className={`bg-white border border-gray-200 rounded-md shadow-sm ${className}`}>{children}</div>
}

function Btn({ children, onClick, disabled, variant = "primary", className = "" }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
  const styles = {
    primary:   "bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 shadow-md shadow-blue-200",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 border border-gray-300",
    danger:    "bg-red-50 hover:bg-red-100 text-red-700 px-6 py-2.5 border border-red-200",
    ghost:     "text-blue-700 hover:text-blue-900 px-3 py-1.5",
    success:   "bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 shadow-md shadow-emerald-200",
  }
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>{children}</button>
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const NAV = [
  { id: "apply",   label: "ขอสินเชื่อ",          icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { id: "history", label: "ประวัติการขอสินเชื่อ", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
]

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#0f1d36] flex-shrink-0">
      <div className="px-5 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">TrustVerifier</p>
            <p className="text-emerald-300/60 text-[10px] tracking-widest uppercase">KBank Credit Bureau</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${active === item.id ? "bg-emerald-600/20 text-emerald-200 border-l-2 border-emerald-400 pl-[10px]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active === item.id ? 2 : 1.5} d={item.icon} />
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
          <p className="text-slate-500 text-[10px] font-mono truncate">did:example:kbank001</p>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-slate-500">Verification service active</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function TopBar({ title, subtitle, actions }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">{subtitle}</p>
        <h1 className="text-gray-900 font-bold text-lg leading-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">{actions}</div>
    </header>
  )
}

function Shell({ children, active, onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Sidebar active={active} onNavigate={onNavigate} />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  )
}

// ─── LOAN ICON ────────────────────────────────────────────────────────────────

function LoanIcon({ id, className = "w-7 h-7 text-white" }) {
  const paths = {
    personal: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    home:     "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    auto:     "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    sme:      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={paths[id] || paths.personal} />
    </svg>
  )
}

// ─── MOCK QR CODE ─────────────────────────────────────────────────────────────

function MockQR() {
  const rows = [
    [1,1,1,1,1,1,1,0,1,1,0,0,1,0,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],[1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,0,1,1,1,0,1],[1,0,0,0,0,0,1,0,1,1,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,0,1,1,0,1,1,0,1,0,1],[0,1,0,0,1,0,0,0,1,1,0,0,0,1,1,0,0,1,0,1,0],
    [1,0,1,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0,1],[0,1,0,1,0,0,0,1,1,0,1,0,1,1,0,0,0,1,1,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,0,1,0,0,1,1,0,1,1,1],[0,0,0,0,0,0,0,0,1,1,0,1,0,1,1,0,0,1,0,0,0],
    [1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,0,1,1,0,1,0],[1,0,0,0,0,0,1,0,1,1,0,0,0,1,0,1,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],[1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1,0,1],[1,0,0,0,0,0,1,0,1,0,1,1,0,0,0,0,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,0,1,1,0,1,0,0,1,0,1],
  ]
  return (
    <div className="bg-white p-3 border-2 border-gray-900 rounded-sm inline-block">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(21, 8px)", gap: "1px" }}>
        {rows.flat().map((cell, i) => (
          <div key={i} style={{ width: 8, height: 8, backgroundColor: cell ? "#111827" : "transparent", borderRadius: 1 }} />
        ))}
      </div>
    </div>
  )
}

// ─── SCREEN 1: LOAN LIST ──────────────────────────────────────────────────────

function ScreenLoanList({ onSelect, onNavigate }) {
  return (
    <Shell active="apply" onNavigate={onNavigate}>
      <TopBar title="เลือกประเภทสินเชื่อ" subtitle="KBank Credit Portal" />
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-sm px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-700 text-sm">เลือกประเภทสินเชื่อที่ลูกค้าต้องการ พนักงานจะได้เห็นข้อมูลที่จำเป็นต้องขอจาก holder</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {LOAN_PRODUCTS.map((loan) => (
            <button key={loan.id} onClick={() => onSelect(loan)}
              className="text-left rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all overflow-hidden group"
            >
              <div className={`bg-gradient-to-br ${loan.gradient} p-5 flex items-center gap-3`}>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <LoanIcon id={loan.id} />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm leading-snug">{loan.name}</p>
                  <p className="text-white/70 text-[10px]">{loan.nameEn}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-xs mb-3 leading-relaxed">{loan.description}</p>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">วงเงินสูงสุด</span>
                    <span className="text-gray-700 font-semibold">{(loan.maxAmount / 1000000).toFixed(0)}M บาท</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">ดอกเบี้ย</span>
                    <span className="text-gray-700 font-semibold">{loan.interestRate}%</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {loan.requiredTypes.map((t) => (
                    <span key={t} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${VC_TYPES[t].badge}`}>{VC_TYPES[t].vcLabel}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">{loan.requiredTypes.length} required · {loan.consentTypes.length} consent</span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  )
}

// ─── SCREEN 2: LOAN DETAIL (staff review) ────────────────────────────────────

function ScreenLoanDetail({ loan, onConfirm, onBack }) {
  return (
    <Shell active="apply" onNavigate={() => {}}>
      <TopBar
        title={loan.name}
        subtitle="ตรวจสอบข้อมูลที่จำเป็น"
        actions={<Btn onClick={onBack} variant="ghost">← เปลี่ยนสินเชื่อ</Btn>}
      />
      <div className="p-6 max-w-3xl mx-auto w-full">

        <Panel className={`mb-5 overflow-hidden`}>
          <div className={`h-1 bg-gradient-to-r ${loan.gradient}`} />
          <div className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${loan.gradient}`}>
              <LoanIcon id={loan.id} className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-bold">{loan.name}</p>
              <p className="text-gray-500 text-sm">{loan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">วงเงินสูงสุด</p>
              <p className="text-gray-900 font-bold">{loan.maxAmount.toLocaleString()} บาท</p>
              <p className="text-gray-400 text-xs mt-0.5">ดอกเบี้ย {loan.interestRate}%</p>
            </div>
          </div>
        </Panel>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Panel className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-sm">ข้อมูลที่จำเป็น (Required)</p>
                <p className="text-gray-400 text-xs">ต้องมีครบทุกรายการ</p>
              </div>
            </div>
            <div className="space-y-3">
              {loan.requiredTypes.map((t) => {
                const cfg = VC_TYPES[t]
                return (
                  <div key={t} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${cfg.badge}`}>{cfg.vcLabel}</span>
                      <p className="text-gray-500 text-xs mt-0.5">{cfg.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-sm">ข้อมูลเพิ่มเติม (Consent)</p>
                <p className="text-gray-400 text-xs">ขึ้นอยู่กับความยินยอม holder</p>
              </div>
            </div>
            {loan.consentTypes.length === 0 ? (
              <p className="text-gray-400 text-sm">ไม่มีข้อมูล consent เพิ่มเติม</p>
            ) : (
              <div className="space-y-3">
                {loan.consentTypes.map((t) => {
                  const cfg = VC_TYPES[t]
                  return (
                    <div key={t} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${cfg.badge}`}>{cfg.vcLabel}</span>
                        <p className="text-gray-500 text-xs mt-0.5">{cfg.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>

        <Panel className="p-4 mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-amber-700 text-sm">หลังกดดำเนินการ ระบบจะสร้าง QR code ให้ holder สแกนด้วย TrustVault wallet</p>
          </div>
        </Panel>

        <Btn onClick={onConfirm} className="py-3 px-8 bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 8H3m18-8h.01M5 16H3" />
          </svg>
          ดำเนินการ — สร้าง QR Code
        </Btn>
      </div>
    </Shell>
  )
}

// ─── SCREEN 3: QR CODE ───────────────────────────────────────────────────────

function ScreenQR({ loan, onHolderScanned, onBack }) {
  const [scanned, setScanned] = useState(false)

  const handleSimulate = () => {
    setScanned(true)
    setTimeout(onHolderScanned, 900)
  }

  return (
    <Shell active="apply" onNavigate={() => {}}>
      <TopBar
        title="รอ Holder สแกน QR"
        subtitle={loan.name}
        actions={<Btn onClick={onBack} variant="ghost">← Back</Btn>}
      />
      <div className="p-6 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Panel className="p-5">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">รายละเอียดคำขอ</p>
              <p className="text-gray-900 font-bold text-base mb-0.5">{loan.name}</p>
              <p className="text-gray-400 text-xs font-mono mb-4">did:example:kbank001</p>
              <div className="space-y-2.5">
                {loan.requiredTypes.map((t) => (
                  <div key={t} className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-sm flex-shrink-0">Required</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${VC_TYPES[t].badge}`}>{VC_TYPES[t].vcLabel}</span>
                  </div>
                ))}
                {loan.consentTypes.map((t) => (
                  <div key={t} className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-sm flex-shrink-0">Consent</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${VC_TYPES[t].badge}`}>{VC_TYPES[t].vcLabel}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-4 flex items-center gap-3">
              {!scanned ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">รอ holder สแกน...</p>
                    <p className="text-gray-400 text-xs">QR หมดอายุใน 10 นาที</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-700 text-sm font-semibold">สแกนแล้ว — กำลังเปิด wallet...</p>
                    <p className="text-gray-400 text-xs">กำลัง redirect ไปยังอุปกรณ์ holder</p>
                  </div>
                </>
              )}
            </Panel>
          </div>

          <Panel className="p-6 flex flex-col items-center">
            <MockQR />
            <p className="text-gray-500 text-sm mt-4 font-semibold">แสดง QR นี้ให้ holder สแกน</p>
            <p className="text-gray-400 text-xs mt-1 mb-6">ใช้ TrustVault wallet สแกน</p>
            <Btn onClick={handleSimulate} disabled={scanned} className="w-full justify-center py-3 bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Simulate: Holder สแกน QR
            </Btn>
            <p className="text-center text-gray-400 text-[11px] mt-2">Demo เท่านั้น</p>
          </Panel>
        </div>
      </div>
    </Shell>
  )
}

// ─── SCREEN 4: HOLDER WALLET (simulated) ─────────────────────────────────────

function ScreenHolderWallet({ loan, onSubmit }) {
  const [consent, setConsent] = useState(() => Object.fromEntries(loan.consentTypes.map((t) => [t, true])))
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    setSubmitting(true)
    const vcsByKey = Object.fromEntries(MOCK_HOLDER_VCS.map((vc) => [vcTypeKey(vc.type), vc]))
    const selected = [
      ...loan.requiredTypes.map((t) => vcsByKey[t]).filter(Boolean),
      ...loan.consentTypes.filter((t) => consent[t]).map((t) => vcsByKey[t]).filter(Boolean),
    ]
    setTimeout(() => { setSubmitting(false); onSubmit(selected) }, 1200)
  }

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="bg-amber-500 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-white text-xs font-semibold">Demo Simulation — TrustVault Wallet บนมือถือ holder</p>
      </div>

      <div className="flex-1 flex items-start justify-center py-8 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-300">

          <div className="bg-[#0f1d36] px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">TrustVault</p>
              <p className="text-blue-300/60 text-[10px] uppercase tracking-widest">Portable KYC Wallet</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-400 text-[10px]">online</span>
            </div>
          </div>

          <div className="bg-blue-50 border-b border-blue-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-gray-900 font-bold text-sm">KBank ขอข้อมูลสินเชื่อ</p>
                <p className="text-blue-700 text-xs font-semibold mt-0.5">{loan.name}</p>
                <p className="text-gray-400 text-[10px] font-mono mt-0.5 truncate">did:example:kbank001</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                ข้อมูลที่จำเป็น (Required)
              </p>
              <div className="space-y-2">
                {loan.requiredTypes.map((t) => {
                  const cfg = VC_TYPES[t]
                  const vc  = MOCK_HOLDER_VCS.find((v) => vcTypeKey(v.type) === t)
                  return (
                    <div key={t} className="rounded-md border-2 border-blue-400 bg-blue-50/30 overflow-hidden">
                      <div className={`h-0.5 bg-gradient-to-r ${cfg.accent}`} />
                      <div className="px-3 py-2 flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${cfg.badge}`}>{cfg.vcLabel}</span>
                          <p className="text-gray-400 text-[10px] mt-0.5 truncate">issued {vc ? new Date(vc.issuanceDate).toLocaleDateString("th-TH") : "—"}</p>
                        </div>
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-sm flex-shrink-0">Required</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {loan.consentTypes.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                  ข้อมูลเพิ่มเติม (Consent)
                </p>
                <div className="space-y-2">
                  {loan.consentTypes.map((t) => {
                    const cfg = VC_TYPES[t]
                    const on  = consent[t]
                    return (
                      <button key={t} onClick={() => setConsent((p) => ({ ...p, [t]: !p[t] }))}
                        className={`w-full text-left rounded-md border-2 overflow-hidden transition-all ${on ? "border-blue-300 bg-blue-50/20" : "border-gray-200 bg-white"}`}
                      >
                        <div className={`h-0.5 bg-gradient-to-r ${cfg.accent}`} />
                        <div className="px-3 py-2 flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${on ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                            {on && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${cfg.badge}`}>{cfg.vcLabel}</span>
                            <p className="text-gray-400 text-[10px] mt-0.5">{cfg.desc}</p>
                          </div>
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-sm flex-shrink-0">Consent</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pb-6">
            <button onClick={handleSubmit} disabled={submitting}
              className={`w-full py-3 rounded-sm font-bold text-sm transition-all flex items-center justify-center gap-2 ${submitting ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#1a3a6e] hover:bg-[#0f2a5e] text-white"}`}
            >
              {submitting ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>กำลังส่งข้อมูล...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>ยืนยันและส่ง VP</>
              )}
            </button>
            <p className="text-center text-gray-400 text-[10px] mt-2">ข้อมูลได้รับการปกป้องด้วย cryptographic proof</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN 5: PROCESSING ────────────────────────────────────────────────────

function ScreenProcessing({ onComplete }) {
  const [step, setStep] = useState(0)
  const steps = ["ตรวจสอบ credentials...", "ยืนยัน digital signatures...", "วิเคราะห์ข้อมูลทางการเงิน...", "คำนวณวงเงินสินเชื่อ..."]

  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 550))
    const done   = setTimeout(onComplete, steps.length * 550 + 700)
    return () => { timers.forEach(clearTimeout); clearTimeout(done) }
  }, [])

  return (
    <Shell active="apply" onNavigate={() => {}}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative flex items-center justify-center">
            <svg className="animate-spin w-20 h-20 text-emerald-200 absolute" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
            </svg>
            <svg className="animate-spin w-20 h-20 text-emerald-600 absolute" style={{ animationDuration: "0.9s" }} fill="none" viewBox="0 0 24 24">
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="text-gray-900 text-xl font-bold mb-1">กำลังประมวลผล...</h2>
          <p className="text-gray-500 text-sm mb-8">กรุณารอสักครู่</p>

          <Panel className="p-5 text-left">
            <div className="space-y-3">
              {steps.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i < step ? "opacity-100" : "opacity-25"}`}>
                  {i < step ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${i < step ? "text-gray-700 font-medium" : "text-gray-400"}`}>{s}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </Shell>
  )
}

// ─── SCREEN 6: RESULT ────────────────────────────────────────────────────────

function ScreenResult({ approval, loan, onNewApplication }) {
  if (approval.approved) {
    return (
      <Shell active="apply" onNavigate={() => {}}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-emerald-50/40">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="w-28 h-28 bg-emerald-100 border-4 border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-14 h-14 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-8xl font-black text-emerald-600 tracking-tight leading-none mb-3">ผ่าน</h1>
              <p className="text-emerald-700 text-xl font-bold">{loan.name}</p>
              <p className="text-gray-500 text-sm mt-1">ผ่านการตรวจสอบ credentials ทั้งหมด · อนุมัติแล้ว</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Panel className="px-5 py-5 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">วงเงินที่อนุมัติ</p>
                <p className="text-4xl font-black text-emerald-600">{approval.approvedAmount.toLocaleString()}</p>
                <p className="text-gray-500 text-sm mt-0.5">บาท</p>
              </Panel>
              <Panel className="px-5 py-5 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">ผ่อนต่อเดือน (ประมาณ)</p>
                <p className="text-4xl font-black text-gray-900">{approval.monthlyPayment.toLocaleString()}</p>
                <p className="text-gray-500 text-sm mt-0.5">บาท / {approval.term}</p>
              </Panel>
            </div>

            <Panel className="p-5 mb-6">
              <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
                {[
                  { label: "อัตราดอกเบี้ย", value: approval.interestRate },
                  { label: "ระยะเวลาผ่อน", value: approval.term },
                  { label: "ประเภทสินเชื่อ", value: loan.nameEn },
                ].map((item) => (
                  <div key={item.label} className="px-4">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold mb-1">{item.label}</p>
                    <p className="text-gray-900 font-bold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-sm text-sm transition-colors">
                พิมพ์ใบอนุมัติ
              </button>
              <button onClick={onNewApplication} className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-sm text-sm border border-gray-300 transition-colors">
                ลูกค้ารายถัดไป
              </button>
            </div>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell active="apply" onNavigate={() => {}}>
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-red-50/20">
        <div className="max-w-xl w-full">
          <div className="text-center mb-8">
            <div className="w-28 h-28 bg-red-100 border-4 border-red-300 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-14 h-14 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-8xl font-black text-red-500 tracking-tight leading-none mb-3">ไม่ผ่าน</h1>
            <p className="text-red-600 text-xl font-bold">{loan.name}</p>
            <p className="text-gray-500 text-sm mt-1">ไม่อนุมัติสินเชื่อ</p>
          </div>

          <Panel className="p-5 mb-6">
            <p className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-4">เหตุผลที่ไม่อนุมัติ</p>
            <div className="space-y-3">
              {approval.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-sm">{reason}</p>
                </div>
              ))}
            </div>
          </Panel>

          <button onClick={onNewApplication} className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-sm text-sm border border-gray-300 transition-colors">
            ลูกค้ารายถัดไป
          </button>
        </div>
      </div>
    </Shell>
  )
}

// ─── SCREEN: HISTORY ─────────────────────────────────────────────────────────

function ScreenHistory({ history, onNavigate }) {
  return (
    <Shell active="history" onNavigate={onNavigate}>
      <TopBar title="ประวัติการขอสินเชื่อ" subtitle="KBank Credit Portal" />
      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "ทั้งหมด",  value: history.length,                                        color: "text-gray-900"    },
            { label: "อนุมัติ",  value: history.filter((h) => h.result === "approved").length, color: "text-emerald-700" },
            { label: "ไม่อนุมัติ", value: history.filter((h) => h.result === "rejected").length, color: "text-red-600"  },
          ].map((s) => (
            <Panel key={s.label} className="px-5 py-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </Panel>
          ))}
        </div>

        <Panel className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <p className="text-gray-700 font-bold text-xs uppercase tracking-widest">รายการ</p>
          </div>
          <div className="divide-y divide-gray-50">
            {history.map((h) => (
              <div key={h.id} className="px-5 py-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${h.result === "approved" ? "bg-emerald-100" : "bg-red-100"}`}>
                  {h.result === "approved"
                    ? <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    : <svg className="w-4 h-4 text-red-500"     fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm truncate">{h.holderDid}</p>
                  <p className="text-gray-400 text-xs">{h.loanName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${h.result === "approved" ? "text-emerald-700" : "text-red-500"}`}>
                    {h.result === "approved" ? `${h.amount.toLocaleString()} บาท` : "ไม่อนุมัติ"}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{h.verifiedAt}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm flex-shrink-0 ${h.result === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {h.result === "approved" ? "อนุมัติ" : "ไม่อนุมัติ"}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Shell>
  )
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function Verifier() {
  const [screen, setScreen]     = useState("loans")
  const [loan, setLoan]         = useState(null)
  const [approval, setApproval] = useState(null)
  const [history, setHistory]   = useState(MOCK_HISTORY)

  const handleVPSubmitted = (selectedVCs) => {
    const result = calculateApproval(loan, selectedVCs)
    setApproval(result)
    setScreen("processing")
  }

  const handleProcessingDone = () => {
    if (approval) {
      setHistory((prev) => [{
        id: `v-${Date.now()}`,
        holderDid: "did:example:holder001",
        loanName: loan.name,
        result: approval.approved ? "approved" : "rejected",
        amount: approval.approved ? approval.approvedAmount : 0,
        verifiedAt: new Date().toLocaleString("en-GB", { hour12: false }).replace(",", ""),
      }, ...prev])
    }
    setScreen("result")
  }

  const handleNavigate = (id) => {
    if (id === "apply")   setScreen("loans")
    if (id === "history") setScreen("history")
  }

  if (screen === "loans")      return <ScreenLoanList onSelect={(l) => { setLoan(l); setScreen("detail") }} onNavigate={handleNavigate} />
  if (screen === "detail")     return <ScreenLoanDetail loan={loan} onConfirm={() => setScreen("qr")} onBack={() => setScreen("loans")} />
  if (screen === "qr")         return <ScreenQR loan={loan} onHolderScanned={() => setScreen("holder")} onBack={() => setScreen("detail")} />
  if (screen === "holder")     return <ScreenHolderWallet loan={loan} onSubmit={handleVPSubmitted} />
  if (screen === "processing") return <ScreenProcessing onComplete={handleProcessingDone} />
  if (screen === "result")     return <ScreenResult approval={approval} loan={loan} onNewApplication={() => { setLoan(null); setApproval(null); setScreen("loans") }} />
  if (screen === "history")    return <ScreenHistory history={history} onNavigate={handleNavigate} />
  return null
}
