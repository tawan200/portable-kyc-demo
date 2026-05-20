import { useState } from "react"

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_HOLDER_VCS = [
  {
    id: "vc-kyc-001",
    type: ["VerifiableCredential", "KYCCredential"],
    issuer: { id: "did:example:kyc-issuer" },
    issuanceDate: "2025-10-15T00:00:00.000Z",
    credentialSubject: { id: "did:example:holder001", full_name: "Somchai Jaidee", national_id: "1-1234-56789-01-2", kyc_level: 3, aml_status: "clear" },
  },
  {
    id: "vc-income-001",
    type: ["VerifiableCredential", "IncomeCredential"],
    issuer: { id: "did:example:kyc-issuer" },
    issuanceDate: "2025-10-20T00:00:00.000Z",
    credentialSubject: { id: "did:example:holder001", average_monthly_income: 45000, income_period_months: 12, platform_name: "Fastwork" },
  },
  {
    id: "vc-work-001",
    type: ["VerifiableCredential", "WorkHistoryCredential"],
    issuer: { id: "did:example:kyc-issuer" },
    issuanceDate: "2025-10-22T00:00:00.000Z",
    credentialSubject: { id: "did:example:holder001", completed_jobs: 128, average_rating: 4.8, work_consistency_score: 92 },
  },
  {
    id: "vc-tax-001",
    type: ["VerifiableCredential", "TaxCredential"],
    issuer: { id: "did:example:kyc-issuer" },
    issuanceDate: "2025-10-25T00:00:00.000Z",
    credentialSubject: { id: "did:example:holder001", tax_filing_status: "filed", income_bracket: "300,000–500,000", tax_year: 2024 },
  },
]

const MOCK_HISTORY = [
  { id: "v-1", holderDid: "did:example:holder001", purpose: "Loan Eligibility",   result: "approved", verifiedAt: "2025-11-02 10:15", credentials: ["Income VC", "KYC VC"] },
  { id: "v-2", holderDid: "did:example:holder002", purpose: "Rental Application", result: "approved", verifiedAt: "2025-10-29 14:32", credentials: ["Income VC"] },
  { id: "v-3", holderDid: "did:example:holder003", purpose: "Loan Eligibility",   result: "rejected", verifiedAt: "2025-10-20 09:01", credentials: ["KYC VC"] },
]

const PURPOSES = ["Loan Eligibility", "Rental Application", "Freelance Job Application", "Account Opening"]

// ─── VC TYPE CONFIG ───────────────────────────────────────────────────────────

const VC_TYPES = {
  kyc:         { label: "KYC",          credType: "KYCCredential",         vcLabel: "KYC VC",          accent: "from-violet-600 to-violet-700", badge: "bg-violet-50 text-violet-700 border border-violet-200" },
  income:      { label: "Income",       credType: "IncomeCredential",      vcLabel: "Income VC",       accent: "from-blue-600 to-blue-700",     badge: "bg-blue-50 text-blue-700 border border-blue-200" },
  workHistory: { label: "Work History", credType: "WorkHistoryCredential", vcLabel: "Work History VC", accent: "from-indigo-600 to-indigo-700", badge: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  tax:         { label: "Tax",          credType: "TaxCredential",         vcLabel: "Tax VC",          accent: "from-slate-500 to-slate-600",   badge: "bg-slate-100 text-slate-600 border border-slate-200" },
}

function vcTypeKey(types) {
  const credType = types?.find((t) => t !== "VerifiableCredential")
  return Object.entries(VC_TYPES).find(([, v]) => v.credType === credType)?.[0]
}

function vcCfg(types) {
  return VC_TYPES[vcTypeKey(types)] || { vcLabel: "Credential", accent: "from-gray-500 to-gray-600", badge: "bg-gray-50 text-gray-700 border border-gray-200" }
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
  { id: "verify",  label: "New Verification",     icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { id: "history", label: "Verification History",  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
              active === item.id
                ? "bg-emerald-600/20 text-emerald-200 border-l-2 border-emerald-400 pl-[10px]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
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

// ─── MOCK QR CODE ─────────────────────────────────────────────────────────────

function MockQR() {
  const rows = [
    [1,1,1,1,1,1,1,0,1,1,0,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,0,1,1,0,1,1,0,1,0,1],
    [0,1,0,0,1,0,0,0,1,1,0,0,0,1,1,0,0,1,0,1,0],
    [1,0,1,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0,1],
    [0,1,0,1,0,0,0,1,1,0,1,0,1,1,0,0,0,1,1,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,0,1,0,0,1,1,0,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,1,1,0,0,1,0,0,0],
    [1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,0,1,1,0,1,0],
    [1,0,0,0,0,0,1,0,1,1,0,0,0,1,0,1,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,1,0,0,0,0,0,1,0,1,0],
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

// ─── SCREEN: REQUIREMENTS ────────────────────────────────────────────────────

function ScreenRequirements({ onGenerate, onNavigate }) {
  const [purpose, setPurpose]   = useState("")
  const [required, setRequired] = useState({ kyc: false, income: false, workHistory: false, tax: false })

  const toggle      = (k) => setRequired((p) => ({ ...p, [k]: !p[k] }))
  const canGenerate = purpose.trim() && Object.values(required).some(Boolean)

  return (
    <Shell active="verify" onNavigate={onNavigate}>
      <TopBar title="New Verification Request" subtitle="Verifier Portal" />
      <div className="p-6 max-w-2xl mx-auto w-full">

        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-sm px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-700 text-sm">เลือก credential ที่ต้องการจาก holder แล้วระบบจะสร้าง QR ให้ holder สแกนด้วย wallet</p>
        </div>

        <Panel className="p-5 mb-5">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">Verification Purpose</p>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            วัตถุประสงค์ <span className="text-red-500">*</span>
          </label>
          <input
            value={purpose} onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Loan Eligibility Assessment"
            className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <div className="flex flex-wrap gap-2 mt-2.5">
            {PURPOSES.map((p) => (
              <button key={p} onClick={() => setPurpose(p)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-sm border transition-colors ${purpose === p ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
              >{p}</button>
            ))}
          </div>
        </Panel>

        <p className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-3">Credentials ที่ต้องการ</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(VC_TYPES).map(([key, cfg]) => (
            <button key={key} onClick={() => toggle(key)}
              className={`p-3 rounded-md border-2 text-left transition-all ${required[key] ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <div className={`h-0.5 w-full bg-gradient-to-r ${cfg.accent} mb-2 rounded`} />
              <p className={`text-xs font-bold ${required[key] ? "text-emerald-700" : "text-gray-600"}`}>{cfg.vcLabel}</p>
              <div className={`mt-1.5 w-4 h-4 rounded-sm border-2 flex items-center justify-center ${required[key] ? "bg-emerald-600 border-emerald-600" : "border-gray-300"}`}>
                {required[key] && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        <Btn
          disabled={!canGenerate}
          onClick={() => onGenerate({ purpose: purpose.trim(), requiredTypes: Object.keys(required).filter((k) => required[k]) })}
          className="py-3 px-8 bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 8H3m18-8h.01M5 16H3" />
          </svg>
          สร้าง QR Code
        </Btn>
      </div>
    </Shell>
  )
}

// ─── SCREEN: QR CODE ─────────────────────────────────────────────────────────

function ScreenQR({ requirements, onHolderScanned, onBack }) {
  const [scanned, setScanned] = useState(false)

  const handleSimulate = () => {
    setScanned(true)
    setTimeout(onHolderScanned, 800)
  }

  return (
    <Shell active="verify" onNavigate={() => {}}>
      <TopBar
        title="Verification QR Code"
        subtitle="Verifier Portal"
        actions={<Btn onClick={onBack} variant="ghost">← Back</Btn>}
      />
      <div className="p-6 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-4">
            <Panel className="p-5">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">Verification Request</p>
              <p className="text-gray-900 font-bold text-base mb-1">{requirements.purpose}</p>
              <p className="text-gray-400 text-xs font-mono mb-4">did:example:kbank001</p>
              <div className="space-y-2">
                {requirements.requiredTypes.map((t) => {
                  const cfg = VC_TYPES[t]
                  return (
                    <div key={t} className="flex items-center gap-2.5">
                      <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${cfg.badge}`}>{cfg.vcLabel}</span>
                      <span className="text-gray-400 text-xs">Required</span>
                    </div>
                  )
                })}
              </div>
            </Panel>

            <Panel className="p-4 flex items-center gap-3">
              {!scanned ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">รอ holder สแกน QR...</p>
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
            <Btn
              onClick={handleSimulate}
              disabled={scanned}
              className="w-full justify-center py-3 bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Simulate: Holder สแกน QR
            </Btn>
            <p className="text-center text-gray-400 text-[11px] mt-2">Demo เท่านั้น — จำลองการสแกน QR</p>
          </Panel>
        </div>
      </div>
    </Shell>
  )
}

// ─── SCREEN: HOLDER VIEW (simulated) ─────────────────────────────────────────

function ScreenHolderView({ requirements, onVPCreated }) {
  const [selected, setSelected] = useState(() => {
    const s = {}
    MOCK_HOLDER_VCS.forEach((vc) => {
      s[vc.id] = requirements.requiredTypes.includes(vcTypeKey(vc.type))
    })
    return s
  })
  const [creating, setCreating] = useState(false)

  const selectedVCs    = MOCK_HOLDER_VCS.filter((vc) => selected[vc.id])
  const allRequiredMet = requirements.requiredTypes.every((t) => selectedVCs.some((vc) => vcTypeKey(vc.type) === t))
  const missingTypes   = requirements.requiredTypes.filter((t) => !selectedVCs.some((vc) => vcTypeKey(vc.type) === t))

  const handleCreate = () => {
    setCreating(true)
    setTimeout(() => { setCreating(false); onVPCreated(selectedVCs) }, 1200)
  }

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <div className="bg-amber-500 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-white text-xs font-semibold">Demo Simulation — Holder's Wallet (TrustVault) บนมือถือ</p>
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
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-400 text-[10px]">online</span>
            </div>
          </div>

          <div className="bg-blue-50 border-b border-blue-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-gray-900 font-bold text-sm">KBank ขอ credentials ของคุณ</p>
                <p className="text-gray-500 text-xs mt-0.5">วัตถุประสงค์: {requirements.purpose}</p>
                <p className="text-gray-400 text-[10px] font-mono mt-0.5 truncate">did:example:kbank001</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3 ml-12">
              {requirements.requiredTypes.map((t) => {
                const cfg = VC_TYPES[t]
                return (
                  <span key={t} className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${cfg.badge}`}>
                    {cfg.vcLabel} · <span className="opacity-70">Required</span>
                  </span>
                )
              })}
            </div>
          </div>

          <div className="px-5 py-4">
            <p className="text-gray-500 text-[11px] uppercase tracking-widest font-semibold mb-3">เลือก credentials ที่จะแชร์</p>
            <div className="space-y-2">
              {MOCK_HOLDER_VCS.map((vc) => {
                const key    = vcTypeKey(vc.type)
                const cfg    = vcCfg(vc.type)
                const isReq  = requirements.requiredTypes.includes(key)
                const isSel  = selected[vc.id]
                const { id: _id, ...fields } = vc.credentialSubject

                return (
                  <button key={vc.id}
                    onClick={() => setSelected((p) => ({ ...p, [vc.id]: !p[vc.id] }))}
                    className={`w-full text-left rounded-md border-2 overflow-hidden transition-all ${isSel ? "border-blue-500 bg-blue-50/40" : "border-gray-200 bg-white"}`}
                  >
                    <div className={`h-0.5 bg-gradient-to-r ${cfg.accent}`} />
                    <div className="px-3 pt-2.5 pb-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSel ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                          {isSel && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${cfg.badge}`}>{cfg.vcLabel}</span>
                        {isReq && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm">Required</span>
                        )}
                      </div>
                      {isSel && (
                        <div className="ml-6 space-y-0.5 pb-0.5">
                          {Object.entries(fields).slice(0, 2).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-gray-400 text-[10px] capitalize">{k.replace(/_/g, " ")}</span>
                              <span className="text-gray-700 text-[10px] font-semibold">{String(v)}</span>
                            </div>
                          ))}
                          {Object.keys(fields).length > 2 && (
                            <p className="text-gray-400 text-[10px]">+{Object.keys(fields).length - 2} fields อื่น ๆ</p>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {!allRequiredMet && selectedVCs.length >= 0 && missingTypes.length > 0 && (
            <div className="mx-5 mb-3 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
              <p className="text-amber-700 text-xs font-semibold">
                ยังขาด: {missingTypes.map((t) => VC_TYPES[t]?.vcLabel).join(", ")}
              </p>
            </div>
          )}

          <div className="px-5 pb-6">
            <button
              onClick={handleCreate}
              disabled={creating || selectedVCs.length === 0}
              className={`w-full py-3 rounded-sm font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                creating || selectedVCs.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#1a3a6e] hover:bg-[#0f2a5e] text-white"
              }`}
            >
              {creating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  กำลังสร้าง VP...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  สร้างและส่ง VP ({selectedVCs.length} credential{selectedVCs.length !== 1 ? "s" : ""})
                </>
              )}
            </button>
            <p className="text-center text-gray-400 text-[10px] mt-2">ข้อมูลของคุณได้รับการปกป้องด้วย cryptographic proof</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN: RESULT ───────────────────────────────────────────────────────────

function ScreenResult({ result, requirements, onVerifyAnother, onDecided }) {
  const [decision, setDecision] = useState(null)

  const decide = (d) => { setDecision(d); onDecided(d) }

  const providedTypes  = new Set(result.credentials.map((vc) => vcTypeKey(vc.type)))
  const allRequiredMet = requirements?.requiredTypes.every((t) => providedTypes.has(t))
  const missingTypes   = requirements?.requiredTypes.filter((t) => !providedTypes.has(t)) || []

  if (decision) {
    return (
      <Shell active="verify" onNavigate={() => {}}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${decision === "approved" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
              {decision === "approved"
                ? <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                : <svg className="w-10 h-10 text-red-500"    fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${decision === "approved" ? "text-emerald-700" : "text-red-600"}`}>
              {decision === "approved" ? "Application Approved" : "Application Rejected"}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {decision === "approved" ? "Credentials verified. Application has been approved." : "Application rejected based on submitted credentials."}
            </p>
            <Btn onClick={onVerifyAnother} variant="secondary" className="py-3 px-8">New Verification</Btn>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell active="verify" onNavigate={() => {}}>
      <TopBar title="Verification Result" subtitle="Verifier Portal" actions={<Btn onClick={onVerifyAnother} variant="ghost">← New Verification</Btn>} />
      <div className="p-6 max-w-4xl mx-auto w-full">

        <div className={`mb-5 rounded-sm px-4 py-3 flex items-center gap-3 border ${allRequiredMet ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          {allRequiredMet ? (
            <>
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-emerald-800 font-bold text-sm">ครบทุก credential ที่ต้องการ · ยืนยันแล้ว</p>
                <p className="text-emerald-700 text-xs">Cryptographic signatures valid · Issuer trusted · Not revoked</p>
              </div>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-amber-800 font-bold text-sm">Credentials ไม่ครบตามที่ขอ</p>
                <p className="text-amber-700 text-xs">ขาด: {missingTypes.map((t) => VC_TYPES[t]?.vcLabel).join(", ")}</p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Panel className="p-5">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">Requirements Check</p>
            <div className="space-y-2">
              {requirements?.requiredTypes.map((t) => {
                const cfg      = VC_TYPES[t]
                const provided = providedTypes.has(t)
                return (
                  <div key={t} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${provided ? "bg-emerald-100" : "bg-red-100"}`}>
                      {provided
                        ? <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-3 h-3 text-red-500"     fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      }
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${cfg.badge}`}>{cfg.vcLabel}</span>
                    <span className={`text-xs font-semibold ${provided ? "text-emerald-600" : "text-red-500"}`}>{provided ? "Provided" : "Not provided"}</span>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">Holder Identity</p>
            <p className="text-gray-900 font-bold text-sm font-mono">{result.holderDid}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500">Identity verified via cryptographic proof</span>
            </div>
          </Panel>
        </div>

        {result.credentials.length > 0 && (
          <>
            <p className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-3">Disclosed Credentials</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {result.credentials.map((cred, i) => {
                const cfg = vcCfg(cred.type)
                const { id: _id, ...fields } = cred.credentialSubject
                return (
                  <Panel key={i} className="overflow-hidden">
                    <div className={`h-0.5 bg-gradient-to-r ${cfg.accent}`} />
                    <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-sm tracking-wide ${cfg.badge}`}>{cfg.vcLabel}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    </div>
                    <div className="px-4 py-3 space-y-2.5">
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest pb-2 border-b border-gray-50">
                        {typeof cred.issuer === "string" ? cred.issuer : cred.issuer?.id}
                      </p>
                      {Object.entries(fields).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm capitalize">{k.replace(/_/g, " ")}</span>
                          <span className="text-gray-900 text-sm font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )
              })}
            </div>
          </>
        )}

        <Panel className="p-5">
          <p className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-4">Make Decision</p>
          <div className="flex gap-3">
            <Btn onClick={() => decide("approved")} variant="success" className="py-3 px-8 flex-1 justify-center" disabled={!allRequiredMet}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Approve
            </Btn>
            <Btn onClick={() => decide("rejected")} variant="danger" className="py-3 px-8 flex-1 justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Reject
            </Btn>
          </div>
          {!allRequiredMet && (
            <p className="text-amber-600 text-xs mt-2 text-center">Approve ถูก disable เพราะ credentials ไม่ครบตามที่ขอ</p>
          )}
        </Panel>
      </div>
    </Shell>
  )
}

// ─── SCREEN: HISTORY ──────────────────────────────────────────────────────────

function ScreenHistory({ history, onNavigate }) {
  return (
    <Shell active="history" onNavigate={onNavigate}>
      <TopBar title="Verification History" subtitle="Verifier Portal" />
      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Verified", value: history.length,                                        color: "text-gray-900"    },
            { label: "Approved",       value: history.filter((h) => h.result === "approved").length, color: "text-emerald-700" },
            { label: "Rejected",       value: history.filter((h) => h.result === "rejected").length, color: "text-red-600"     },
          ].map((s) => (
            <Panel key={s.label} className="px-5 py-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </Panel>
          ))}
        </div>

        <Panel className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <p className="text-gray-700 font-bold text-xs uppercase tracking-widest">Verification Log</p>
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
                  <p className="text-gray-400 text-xs">{h.purpose}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {h.credentials.map((c) => <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">{c}</span>)}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-gray-400 text-xs">{h.verifiedAt}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm mt-0.5 inline-block ${h.result === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {h.result === "approved" ? "Approved" : "Rejected"}
                  </span>
                </div>
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
  const [screen, setScreen]             = useState("requirements")
  const [requirements, setRequirements] = useState(null)
  const [result, setResult]             = useState(null)
  const [history, setHistory]           = useState(MOCK_HISTORY)

  const handleVPCreated = (selectedVCs) => {
    setResult({ success: true, holderDid: "did:example:holder001", credentials: selectedVCs })
    setScreen("result")
  }

  const handleDecided = (decision) => {
    if (!result) return
    setHistory((prev) => [{
      id: `v-${Date.now()}`,
      holderDid: result.holderDid,
      purpose: requirements?.purpose || "Unknown",
      result: decision,
      verifiedAt: new Date().toLocaleString("en-GB", { hour12: false }).replace(",", ""),
      credentials: result.credentials.map((c) => vcCfg(c.type).vcLabel),
    }, ...prev])
  }

  const handleNavigate = (id) => {
    if (id === "verify")   setScreen("requirements")
    if (id === "history")  setScreen("history")
  }

  if (screen === "requirements") return <ScreenRequirements onGenerate={(req) => { setRequirements(req); setScreen("qr") }} onNavigate={handleNavigate} />
  if (screen === "qr")           return <ScreenQR requirements={requirements} onHolderScanned={() => setScreen("holder")} onBack={() => setScreen("requirements")} />
  if (screen === "holder")       return <ScreenHolderView requirements={requirements} onVPCreated={handleVPCreated} />
  if (screen === "result")       return <ScreenResult result={result} requirements={requirements} onVerifyAnother={() => setScreen("requirements")} onDecided={handleDecided} />
  if (screen === "history")      return <ScreenHistory history={history} onNavigate={handleNavigate} />
  return null
}
