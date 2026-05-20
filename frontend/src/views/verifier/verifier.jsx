import { useState } from "react"

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_HISTORY = [
  { id: "v-1", holderDid: "did:example:holder001", purpose: "Loan eligibility",   result: "approved", verifiedAt: "2025-11-02 10:15", credentials: ["Income VC", "KYC VC"] },
  { id: "v-2", holderDid: "did:example:holder002", purpose: "Rental application", result: "approved", verifiedAt: "2025-10-29 14:32", credentials: ["Income VC"] },
  { id: "v-3", holderDid: "did:example:holder003", purpose: "Loan eligibility",   result: "rejected", verifiedAt: "2025-10-20 09:01", credentials: ["KYC VC"] },
]

const MOCK_RESULT = {
  success: true,
  holderDid: "did:example:holder001",
  credentials: [
    {
      type: ["VerifiableCredential", "IncomeCredential"],
      issuer: { id: "did:example:kyc-issuer" },
      issuanceDate: "2025-11-01T00:00:00.000Z",
      credentialSubject: { id: "did:example:holder001", average_monthly_income: 45000, income_period_months: 12, platform_name: "Fastwork" },
    },
    {
      type: ["VerifiableCredential", "KYCCredential"],
      issuer: { id: "did:example:kyc-issuer" },
      issuanceDate: "2025-11-01T00:00:00.000Z",
      credentialSubject: { id: "did:example:holder001", full_name: "Somchai Jaidee", national_id: "1-1234-56789-01-2", kyc_level: 3, aml_status: "clear" },
    },
  ],
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const TYPE_ACCENT = {
  IncomeCredential:      "from-blue-600 to-blue-700",
  KYCCredential:         "from-violet-600 to-violet-700",
  TaxCredential:         "from-slate-500 to-slate-600",
  WorkHistoryCredential: "from-indigo-600 to-indigo-700",
}
const TYPE_BADGE = {
  IncomeCredential:      "bg-blue-50 text-blue-700 border border-blue-200",
  KYCCredential:         "bg-violet-50 text-violet-700 border border-violet-200",
  TaxCredential:         "bg-slate-100 text-slate-600 border border-slate-200",
  WorkHistoryCredential: "bg-indigo-50 text-indigo-700 border border-indigo-200",
}

const getVCType  = (types) => types?.find((t) => t !== "VerifiableCredential") || "Credential"
const getAccent  = (types) => TYPE_ACCENT[getVCType(types)] || "from-gray-500 to-gray-600"
const getBadge   = (types) => TYPE_BADGE[getVCType(types)]  || "bg-gray-50 text-gray-700 border border-gray-200"
const vcLabel    = (types) => getVCType(types).replace("Credential", " VC")

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
  { id: "verify",  label: "Verify Presentation",  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { id: "history", label: "Verification History", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
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

// ─── SCREEN: VERIFY ───────────────────────────────────────────────────────────

function ScreenVerify({ onVerified }) {
  const [vpJwt, setVpJwt]     = useState("")
  const [loading, setLoading] = useState(false)
  const [scanMode, setScanMode] = useState(false)

  const handleVerify = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onVerified(MOCK_RESULT) }, 1200)
  }

  const useSample = () => {
    setScanMode(false)
    setVpJwt("eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2cCI6eyJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXX0sImlzcyI6ImRpZDpleGFtcGxlOmhvbGRlcjAwMSJ9.mock_sig")
  }

  return (
    <Shell active="verify" onNavigate={() => {}}>
      <TopBar title="Verify Presentation" subtitle="Verifier Portal" />
      <div className="p-6 max-w-2xl mx-auto w-full">

        <Panel className="p-5 mb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">Verification Purpose</p>
              <p className="text-gray-900 font-bold">Loan Eligibility Assessment</p>
              <p className="text-gray-400 text-xs mt-0.5">Requesting: Income VC · KYC VC</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-sm">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Trusted Verifier
            </span>
          </div>
        </Panel>

        <div className="flex gap-3 mb-4">
          <button onClick={() => setScanMode(false)} className={`flex-1 py-2.5 rounded-sm border text-sm font-semibold transition-colors ${!scanMode ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
            Paste VP JWT
          </button>
          <button onClick={() => setScanMode(true)} className={`flex-1 py-2.5 rounded-sm border text-sm font-semibold transition-colors ${scanMode ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
            <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 8H3m18-8h.01M5 16H3" /></svg>
            Scan QR
          </button>
        </div>

        {scanMode ? (
          <Panel className="p-12 flex flex-col items-center justify-center mb-5">
            <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 8H3m18-8h.01M5 16H3" /></svg>
            </div>
            <p className="text-gray-500 text-sm mb-1">Point camera at holder's QR code</p>
            <p className="text-gray-400 text-xs mb-4">Camera access required</p>
            <Btn onClick={useSample} variant="secondary" className="py-2 px-5">Use Sample QR (Demo)</Btn>
          </Panel>
        ) : (
          <Panel className="p-5 mb-5">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Verifiable Presentation JWT</label>
            <textarea
              value={vpJwt} onChange={(e) => setVpJwt(e.target.value)} rows={5}
              placeholder="eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ..."
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-gray-400 text-xs">Paste the VP JWT from the holder's wallet</p>
              <button onClick={useSample} className="text-xs text-emerald-700 font-semibold hover:text-emerald-900">Use sample</button>
            </div>
          </Panel>
        )}

        <Btn onClick={handleVerify} disabled={loading || (!scanMode && !vpJwt.trim())} className="py-3 w-full justify-center bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200">
          {loading ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Verifying...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>Verify Presentation</>
          )}
        </Btn>
      </div>
    </Shell>
  )
}

// ─── SCREEN: RESULT ───────────────────────────────────────────────────────────

function ScreenResult({ result, onVerifyAnother, onDecided }) {
  const [decision, setDecision] = useState(null)

  const decide = (d) => { setDecision(d); onDecided(d) }

  if (decision) {
    return (
      <Shell active="verify" onNavigate={() => {}}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${decision === "approved" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
              {decision === "approved"
                ? <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                : <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${decision === "approved" ? "text-emerald-700" : "text-red-600"}`}>
              {decision === "approved" ? "Application Approved" : "Application Rejected"}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {decision === "approved" ? "Credentials verified. Application has been approved." : "Application rejected based on submitted credentials."}
            </p>
            <Btn onClick={onVerifyAnother} variant="secondary" className="py-3 px-8">Verify Another</Btn>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell active="verify" onNavigate={() => {}}>
      <TopBar title="Verification Result" subtitle="Verifier Portal" actions={<Btn onClick={onVerifyAnother} variant="ghost">← Verify Another</Btn>} />
      <div className="p-6 max-w-4xl mx-auto w-full">

        <div className={`mb-5 rounded-sm px-4 py-3 flex items-center gap-3 border ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          {result.success ? (
            <>
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <div>
                <p className="text-emerald-800 font-bold text-sm">All credentials verified successfully</p>
                <p className="text-emerald-700 text-xs">Cryptographic signatures valid · Issuer trusted · Not revoked</p>
              </div>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <div><p className="text-red-700 font-bold text-sm">Verification failed</p><p className="text-red-600 text-xs">{result.error}</p></div>
            </>
          )}
        </div>

        <Panel className="p-5 mb-5">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">Holder Identity</p>
          <p className="text-gray-900 font-bold text-sm font-mono">{result.holderDid}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-500">Identity verified via cryptographic proof</span>
          </div>
        </Panel>

        {result.success && (
          <>
            <p className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-3">Disclosed Credentials</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {result.credentials.map((cred, i) => {
                const { id: _id, ...fields } = cred.credentialSubject
                return (
                  <Panel key={i} className="overflow-hidden">
                    <div className={`h-0.5 bg-gradient-to-r ${getAccent(cred.type)}`} />
                    <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-sm tracking-wide ${getBadge(cred.type)}`}>{vcLabel(cred.type)}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
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

            <Panel className="p-5">
              <p className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-4">Make Decision</p>
              <div className="flex gap-3">
                <Btn onClick={() => decide("approved")} variant="success" className="py-3 px-8 flex-1 justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Approve
                </Btn>
                <Btn onClick={() => decide("rejected")} variant="danger" className="py-3 px-8 flex-1 justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Reject
                </Btn>
              </div>
            </Panel>
          </>
        )}
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
            { label: "Total Verified", value: history.length,                                   color: "text-gray-900"    },
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
  const [screen, setScreen]   = useState("verify")
  const [result, setResult]   = useState(null)
  const [history, setHistory] = useState(MOCK_HISTORY)

  const handleDecided = (decision) => {
    if (!result) return
    setHistory((prev) => [{
      id: `v-${Date.now()}`, holderDid: result.holderDid, purpose: "Loan eligibility",
      result: decision,
      verifiedAt: new Date().toLocaleString("en-GB", { hour12: false }).replace(",", ""),
      credentials: result.credentials.map((c) => vcLabel(c.type)),
    }, ...prev])
  }

  if (screen === "verify")  return <ScreenVerify onVerified={(r) => { setResult(r); setScreen("result") }} />
  if (screen === "result")  return <ScreenResult result={result} onVerifyAnother={() => setScreen("verify")} onDecided={handleDecided} />
  if (screen === "history") return <ScreenHistory history={history} onNavigate={(id) => id === "verify" && setScreen("verify")} />
  return null
}
