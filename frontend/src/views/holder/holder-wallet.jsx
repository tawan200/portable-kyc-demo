import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_VCS = [
  {
    id: "vc-1", type: "Income VC", issuer: "Fastwork Co., Ltd.",
    issuerDID: "did:example:fastwork123", summary: "Income · ฿45,000/mo",
    status: "valid", expiry: "2025-12-31",
    fields: [
      { key: "income_amount", label: "Income Amount", value: "฿45,000", required: true },
      { key: "currency", label: "Currency", value: "THB", required: true },
      { key: "pay_period", label: "Pay Period", value: "Monthly", required: false },
      { key: "source_platform", label: "Source Platform", value: "Fastwork", required: false },
      { key: "statement_date", label: "Statement Date", value: "2024-11-01", required: false },
    ],
  },
  {
    id: "vc-2", type: "KYC VC", issuer: "DOPA",
    issuerDID: "did:example:dopa456", summary: "National ID verified",
    status: "valid", expiry: "2026-06-30",
    fields: [
      { key: "national_id", label: "National ID", value: "1-1234-56789-01-2", required: true },
      { key: "full_name", label: "Full Name", value: "Somchai Jaidee", required: true },
      { key: "date_of_birth", label: "Date of Birth", value: "1990-05-15", required: false },
      { key: "nationality", label: "Nationality", value: "Thai", required: false },
    ],
  },
  {
    id: "vc-3", type: "Tax VC", issuer: "Revenue Department",
    issuerDID: "did:example:revdept789", summary: "Tax Year 2023",
    status: "expiring", expiry: "2025-01-31",
    fields: [
      { key: "tax_year", label: "Tax Year", value: "2023", required: true },
      { key: "total_income", label: "Total Income Declared", value: "฿540,000", required: true },
      { key: "tax_paid", label: "Tax Paid", value: "฿27,000", required: false },
      { key: "filing_ref", label: "Filing Reference", value: "TAX2023-001234", required: false },
    ],
  },
];

// Fields grouped by sd (selective disclosure) flag
const INCOMING_VC = {
  id: "vc-new", type: "Work History VC", issuer: "Fastwork Co., Ltd.",
  issuerDID: "did:example:fastwork123", issuerVerified: true,
  expiry: "2026-10-01",
  // sd: false → always sent automatically (non-selective)
  autoFields: [
    { key: "full_name",          label: "Full Name",          description: "Freelancer's full name" },
    { key: "kyc_level",          label: "KYC Level",          description: "Verification level, e.g. Level 2, verified" },
    { key: "aml_status",         label: "AML Status",         description: "Blacklist status" },
    { key: "tax_filing_status",  label: "Tax Filing Status",  description: "Tax filing status" },
  ],
  // sd: true → holder can choose which to disclose
  selectableFields: [
    { key: "national_id",              label: "National ID",              description: "National ID number" },
    { key: "average_monthly_income",   label: "Avg. Monthly Income",      description: "Average monthly income over the past 12 months" },
    { key: "income_period_months",     label: "Income Period",            description: "Income calculation period, e.g. 12 months" },
    { key: "platform_name",            label: "Platform Name",            description: "Platform name, e.g. Fastwork" },
    { key: "income_hash",              label: "Income Hash",              description: "Transaction hash to prove the numbers haven't been tampered with" },
    { key: "completed_jobs",           label: "Completed Jobs",           description: "Number of completed jobs" },
    { key: "average_rating",           label: "Average Rating",           description: "Average rating from clients" },
    { key: "work_consistency_score",   label: "Work Consistency Score",   description: "Work consistency score" },
    { key: "income_bracket",           label: "Income Bracket",           description: "Income range for filing taxes, e.g. 300,000–500,000 baht/year" },
    { key: "tax_year",                 label: "Tax Year",                 description: "Referenced tax year" },
  ],
};

const VERIFIER_INFO = {
  name: "KBank Credit Bureau", did: "did:example:kbank001",
  purpose: "Loan eligibility assessment",
  requestedTypes: ["Income VC", "KYC VC"],
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  valid:    { label: "Valid",         cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  expiring: { label: "Expiring Soon", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  revoked:  { label: "Revoked",       cls: "bg-red-50 text-red-700 border border-red-200" },
};

const TYPE_ACCENT = {
  "Income VC":       "from-blue-600 to-blue-700",
  "KYC VC":          "from-violet-600 to-violet-700",
  "Tax VC":          "from-slate-500 to-slate-600",
  "Work History VC": "from-indigo-600 to-indigo-700",
};

function getAccent(type) { return TYPE_ACCENT[type] || "from-blue-600 to-blue-700"; }

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.valid;
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-sm tracking-wide ${cfg.cls}`}>{cfg.label}</span>;
}

function TypeBadge({ type }) {
  return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 tracking-wide">{type}</span>;
}

function TrustBadge({ verified }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-sm">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
      Verified Issuer
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-sm">⚠ Unknown Issuer</span>
  );
}

function Panel({ children, className = "" }) {
  return <div className={`bg-white border border-gray-200 rounded-md shadow-sm ${className}`}>{children}</div>;
}

function Btn({ children, onClick, disabled, variant = "primary", className = "" }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary:   "bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 shadow-md shadow-blue-200",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 border border-gray-300",
    danger:    "bg-red-50 hover:bg-red-100 text-red-700 px-6 py-2.5 border border-red-200",
    ghost:     "text-blue-700 hover:text-blue-900 px-3 py-1.5",
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
}

// ─── SIDEBAR NAV ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "wallet",   label: "Wallet",   icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2zm0 0V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2" },
  { id: "present",  label: "Present",  icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" },
  { id: "history",  label: "Activity", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#0f1d36] flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">TrustVault</p>
            <p className="text-blue-300/60 text-[10px] tracking-widest uppercase">Digital Wallet</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
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
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active === item.id ? 2 : 1.5} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </nav>

      {/* DID identity */}
      <div className="px-3 pb-5">
        <div className="bg-white/[0.05] border border-white/[0.08] rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex-shrink-0" />
            <p className="text-white text-xs font-semibold">Somchai Jaidee</p>
          </div>
          <p className="text-slate-500 text-[10px] font-mono truncate">did:example:holder001</p>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-slate-500">Secure session active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────

function TopBar({ title, subtitle, actions }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">{subtitle}</p>
        <h1 className="text-gray-900 font-bold text-lg leading-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-sm bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
        </button>
      </div>
    </header>
  );
}

// ─── BIOMETRIC MODAL ──────────────────────────────────────────────────────────

function BiometricModal({ onConfirm, onCancel, action = "Accept credential" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-md shadow-2xl p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v1h-4v-1zm-2 0a4 4 0 014-4v0a4 4 0 014 4v1h1a1 1 0 011 1v6a1 1 0 01-1 1H8a1 1 0 01-1-1v-6a1 1 0 011-1h1v-1z" /></svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-base">Biometric Confirmation</p>
            <p className="text-sm text-gray-500 mt-1">{action}</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mb-6">Use Face ID or fingerprint to authorize this action securely</p>
        <div className="flex flex-col gap-2.5">
          <Btn onClick={onConfirm} className="w-full justify-center py-3">Confirm with Biometrics</Btn>
          <Btn onClick={onCancel} variant="secondary" className="w-full justify-center py-3">Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── VC CARD ─────────────────────────────────────────────────────────────────

function VCCard({ vc, onClick, selectable, selected }) {
  const accent = getAccent(vc.type);
  return (
    <div
      onClick={onClick}
      className={`relative bg-white border rounded-md overflow-hidden cursor-pointer transition-all duration-150 group
        ${selectable
          ? selected ? "border-blue-500 shadow-md shadow-blue-100" : "border-gray-200 hover:border-gray-400"
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
              <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-900 font-bold text-base mt-3 leading-tight">{vc.issuer}</p>
        <p className="text-gray-500 text-sm mt-0.5">{vc.summary}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="text-gray-400 text-xs font-mono truncate max-w-[140px]">{vc.issuerDID}</span>
          </div>
          <span className="text-gray-400 text-xs">Exp. {vc.expiry}</span>
        </div>
      </div>
    </div>
  );
}

// ─── LAYOUT SHELL ─────────────────────────────────────────────────────────────

function Shell({ children, active, onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Sidebar active={active} onNavigate={onNavigate} />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}

// ─── SCREEN: RECEIVE VC ───────────────────────────────────────────────────────

function ScreenReceiveVC({ onAccept, onReject }) {
  const [showBiometric, setShowBiometric] = useState(false);
  const vc = INCOMING_VC;

  return (
    <Shell active="wallet" onNavigate={() => {}}>
      <TopBar title="Incoming Credential" subtitle="Credential Request" />
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">

        {/* Info banner */}
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-sm px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-blue-700 text-sm">An issuer is requesting you to store a credential. Review what will be stored in your wallet before accepting.</p>
        </div>

        {/* Credential header */}
        <Panel className="overflow-hidden mb-5">
          <div className={`h-1 bg-gradient-to-r ${getAccent(vc.type)}`} />
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <TypeBadge type={vc.type} />
              <TrustBadge verified={vc.issuerVerified} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">Issuer</p>
                <p className="text-gray-900 font-bold">{vc.issuer}</p>
                <p className="text-gray-400 text-xs font-mono mt-1 truncate">{vc.issuerDID}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">Expires</p>
                <p className="text-gray-900 font-bold">{vc.expiry}</p>
              </div>
            </div>
          </div>
        </Panel>

        {/* What will be stored */}
        <p className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-3">What Will Be Stored in Your Wallet</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Auto-send fields (sd: false) */}
          <Panel className="overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <p className="text-gray-700 font-bold text-xs uppercase tracking-wider">Automatically Sent</p>
              <span className="ml-auto text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">sd: false</span>
            </div>
            <div className="px-4 py-1">
              <p className="text-gray-400 text-xs py-2 border-b border-gray-50">Always included — not selectively disclosed</p>
              {vc.autoFields.map((f) => (
                <div key={f.key} className="py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-gray-900 text-sm font-semibold">{f.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{f.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">{f.key}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Holder-selectable fields (sd: true) */}
          <Panel className="overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-gray-700 font-bold text-xs uppercase tracking-wider">Holder Selectable</p>
              <span className="ml-auto text-[10px] text-blue-600 font-mono bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">sd: true</span>
            </div>
            <div className="px-4 py-1">
              <p className="text-gray-400 text-xs py-2 border-b border-gray-50">You choose which fields to share per presentation</p>
              {vc.selectableFields.map((f) => (
                <div key={f.key} className="py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-gray-900 text-sm font-semibold">{f.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{f.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">{f.key}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Privacy note */}
        <Panel className="p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <p className="text-gray-600 text-sm">You control what data is shared from this credential. Selectable fields are only disclosed when you explicitly choose to include them in a presentation.</p>
          </div>
        </Panel>

        <div className="flex items-center gap-3">
          <Btn onClick={() => setShowBiometric(true)} className="py-3 px-8">Accept & Save to Wallet</Btn>
          <Btn onClick={onReject} variant="danger" className="py-3 px-6">Reject</Btn>
        </div>
      </div>

      {showBiometric && (
        <BiometricModal
          action="Accept & save credential to wallet"
          onConfirm={() => { setShowBiometric(false); onAccept(); }}
          onCancel={() => setShowBiometric(false)}
        />
      )}
    </Shell>
  );
}

// ─── SCREEN: WALLET HOME ──────────────────────────────────────────────────────

function ScreenWalletHome({ vcs, onCreateVP, onNavigate }) {
  const [activeTab, setActiveTab] = useState("wallet");
  const validCount = vcs.filter((v) => v.status === "valid").length;
  const expiringCount = vcs.filter((v) => v.status === "expiring").length;
  const handleNav = (tab) => { setActiveTab(tab); if (tab === "present") onCreateVP(); };

  return (
    <Shell active={activeTab} onNavigate={handleNav}>
      <TopBar
        title="Credential Wallet"
        subtitle="Holder Dashboard"
        actions={
          <Btn onClick={onCreateVP} className="py-2 px-4 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Create VP
          </Btn>
        }
      />
      <div className="p-6 max-w-6xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Credentials", value: vcs.length,    color: "text-gray-900" },
            { label: "Active & Valid",    value: validCount,    color: "text-emerald-700" },
            { label: "Expiring Soon",     value: expiringCount, color: "text-amber-700" },
          ].map((s) => (
            <Panel key={s.label} className="px-5 py-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </Panel>
          ))}
        </div>

        {/* Security bar */}
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-sm px-4 py-2.5 flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-emerald-700 text-xs font-semibold">Wallet Secure — DID verified · All credentials cryptographically intact</p>
          <span className="ml-auto text-gray-400 text-xs font-mono">did:example:holder001</span>
        </div>

        {/* Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-bold text-xs uppercase tracking-widest">My Credentials</h2>
          <span className="text-gray-400 text-xs">{vcs.length} credential{vcs.length !== 1 ? "s" : ""}</span>
        </div>
        {vcs.length === 0 ? (
          <Panel className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /></svg>
            </div>
            <p className="font-bold text-gray-500">No credentials yet</p>
            <p className="text-gray-400 text-sm mt-1">Credentials issued to you will appear here</p>
          </Panel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {vcs.map((vc) => <VCCard key={vc.id} vc={vc} onClick={() => {}} />)}
          </div>
        )}
      </div>
    </Shell>
  );
}

// ─── SCREEN: CREATE VP ────────────────────────────────────────────────────────

function ScreenCreateVP({ vcs, onNext, onCancel }) {
  const [selected, setSelected] = useState([]);
  const toggle = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <Shell active="present" onNavigate={() => {}}>
      <TopBar title="Create Presentation" subtitle="Verifiable Presentation" actions={<Btn onClick={onCancel} variant="ghost">← Cancel</Btn>} />
      <div className="p-6 max-w-5xl mx-auto w-full">
        <Panel className="p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">Requested by</p>
              <p className="text-gray-900 font-bold text-base">{VERIFIER_INFO.name}</p>
              <p className="text-gray-400 text-xs font-mono mt-0.5">{VERIFIER_INFO.did}</p>
            </div>
            <TrustBadge verified={true} />
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex items-center gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">Purpose</p>
              <p className="text-gray-700 text-sm">{VERIFIER_INFO.purpose}</p>
            </div>
            <div className="ml-auto flex gap-2">
              {VERIFIER_INFO.requestedTypes.map((t) => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        </Panel>

        <h2 className="text-gray-900 font-bold text-xs uppercase tracking-widest mb-3">Select Credentials to Include</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {vcs.map((vc) => (
            <VCCard key={vc.id} vc={vc} selectable selected={selected.includes(vc.id)} onClick={() => toggle(vc.id)} />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Btn disabled={selected.length === 0} onClick={() => onNext(vcs.filter((v) => selected.includes(v.id)))} className="py-3 px-8">
            Next: Choose Fields →
          </Btn>
          {selected.length > 0 && <span className="text-blue-700 text-sm font-medium">{selected.length} credential{selected.length > 1 ? "s" : ""} selected</span>}
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN: SELECTIVE DISCLOSURE ─────────────────────────────────────────────

function ScreenSelectiveDisclosure({ selectedVCs, onNext, onBack }) {
  const initToggles = () => {
    const t = {};
    selectedVCs.forEach((vc) => vc.fields.forEach((f) => { t[`${vc.id}-${f.key}`] = true; }));
    return t;
  };
  const [toggles, setToggles] = useState(initToggles);
  const flip = (vcId, key, required) => {
    if (required) return;
    setToggles((prev) => ({ ...prev, [`${vcId}-${key}`]: !prev[`${vcId}-${key}`] }));
  };

  return (
    <Shell active="present" onNavigate={() => {}}>
      <TopBar title="Choose What to Share" subtitle="Selective Disclosure" actions={<Btn onClick={onBack} variant="ghost">← Back</Btn>} />
      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="mb-5 bg-gray-100 border border-gray-200 rounded-sm px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <p className="text-gray-600 text-sm">Toggle optional fields to control your privacy. Required fields are always shared.</p>
        </div>

        <div className="space-y-4 mb-6">
          {selectedVCs.map((vc) => {
            const disclosed = vc.fields.filter((f) => toggles[`${vc.id}-${f.key}`]);
            const hidden = vc.fields.filter((f) => !toggles[`${vc.id}-${f.key}`] && !f.required);
            return (
              <Panel key={vc.id} className="overflow-hidden">
                <div className={`h-0.5 bg-gradient-to-r ${getAccent(vc.type)}`} />
                <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <TypeBadge type={vc.type} />
                    <p className="text-gray-900 font-semibold text-sm mt-2">{vc.issuer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-700 text-xs font-semibold">{disclosed.length} sharing</p>
                    {hidden.length > 0 && <p className="text-gray-400 text-xs">{hidden.length} hidden</p>}
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {vc.fields.map((f) => {
                    const k = `${vc.id}-${f.key}`;
                    const on = toggles[k];
                    return (
                      <div key={f.key} className="flex items-center px-5 py-3.5 gap-4">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold transition-colors ${on ? "text-gray-900" : "text-gray-300"}`}>{f.label}</p>
                          <p className={`text-xs mt-0.5 truncate font-mono transition-colors ${on ? "text-gray-500" : "text-gray-300"}`}>{f.value}</p>
                        </div>
                        {f.required ? (
                          <span className="text-xs text-gray-400 italic flex-shrink-0 border border-gray-200 px-2 py-0.5 rounded-sm">Required</span>
                        ) : (
                          <button
                            onClick={() => flip(vc.id, f.key, f.required)}
                            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${on ? "bg-blue-600" : "bg-gray-200"}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>
            );
          })}
        </div>
        <div className="flex gap-3">
          <Btn onClick={() => onNext(toggles)} className="py-3 px-8">Next: Review & Send →</Btn>
          <Btn onClick={onBack} variant="secondary" className="py-3 px-6">Back</Btn>
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN: PRESENT VP ───────────────────────────────────────────────────────

function ScreenPresentVP({ selectedVCs, toggles, onBack }) {
  const [showBiometric, setShowBiometric] = useState(false);
  const [sent, setSent] = useState(false);

  const getDisclosed = (vc) => vc.fields.filter((f) => toggles[`${vc.id}-${f.key}`]);
  const getHiddenCount = (vc) => vc.fields.filter((f) => !toggles[`${vc.id}-${f.key}`] && !f.required).length;
  const totalHidden = selectedVCs.reduce((sum, vc) => sum + getHiddenCount(vc), 0);

  if (sent) {
    return (
      <Shell active="present" onNavigate={() => {}}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-gray-900 text-2xl font-bold mb-2">Presentation Sent</h2>
            <p className="text-gray-500 text-sm mb-1">Your credentials were securely delivered to {VERIFIER_INFO.name}.</p>
            <p className="text-gray-400 text-xs mb-8 font-mono">{new Date().toLocaleString()}</p>
            <Panel className="p-4 text-left mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">Delivered to</p>
              <p className="text-gray-900 font-bold">{VERIFIER_INFO.name}</p>
              <p className="text-gray-400 text-xs font-mono mt-0.5 truncate">{VERIFIER_INFO.did}</p>
            </Panel>
            <Btn onClick={onBack} className="py-3 px-8">Return to Wallet</Btn>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell active="present" onNavigate={() => {}}>
      <TopBar title="Review & Send" subtitle="Confirm Presentation" actions={<Btn onClick={onBack} variant="ghost">← Back</Btn>} />
      <div className="p-6 max-w-4xl mx-auto w-full">
        <Panel className="p-5 mb-5">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">Sending to</p>
          <p className="text-gray-900 font-bold text-base">{VERIFIER_INFO.name}</p>
          <p className="text-gray-400 text-xs font-mono mt-0.5 truncate">{VERIFIER_INFO.did}</p>
        </Panel>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {selectedVCs.map((vc) => {
            const disclosed = getDisclosed(vc);
            const hidden = getHiddenCount(vc);
            return (
              <Panel key={vc.id} className="overflow-hidden">
                <div className={`h-0.5 bg-gradient-to-r ${getAccent(vc.type)}`} />
                <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                  <TypeBadge type={vc.type} />
                  {hidden > 0 && <span className="text-xs text-gray-400">{hidden} field{hidden > 1 ? "s" : ""} withheld</span>}
                </div>
                <div className="px-4 py-3">
                  <p className="text-gray-400 text-xs mb-2 font-semibold">{vc.issuer}</p>
                  <div className="space-y-2">
                    {disclosed.map((f) => (
                      <div key={f.key} className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">{f.label}</span>
                        <span className="text-gray-900 text-sm font-semibold">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>

        {totalHidden > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-sm p-3 flex items-center gap-3 mb-4">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            <span className="text-gray-600 text-sm">{totalHidden} field{totalHidden > 1 ? "s" : ""} withheld — the verifier will not see this data.</span>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 flex items-start gap-3 mb-6">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <p className="text-blue-700 text-sm">This presentation will be cryptographically signed with your DID before transmission.</p>
        </div>

        <div className="flex gap-3">
          <Btn onClick={() => setShowBiometric(true)} className="py-3 px-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            Send Presentation
          </Btn>
          <Btn onClick={onBack} variant="secondary" className="py-3 px-6">Back</Btn>
        </div>
      </div>

      {showBiometric && (
        <BiometricModal
          action="Sign & send verifiable presentation"
          onConfirm={() => { setShowBiometric(false); setSent(true); }}
          onCancel={() => setShowBiometric(false)}
        />
      )}
    </Shell>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("receive");
  const [vcs, setVCs] = useState(MOCK_VCS);
  const [selectedVCs, setSelectedVCs] = useState([]);
  const [toggles, setToggles] = useState({});

  if (screen === "receive") return <ScreenReceiveVC onAccept={() => { setVCs((p) => [...p, { ...INCOMING_VC, status: "valid", summary: "Work · Senior Dev", fields: [...INCOMING_VC.autoFields.map(f => ({...f, value: "—", required: true})), ...INCOMING_VC.selectableFields.map(f => ({...f, value: "—", required: false}))] }]); setScreen("wallet"); }} onReject={() => setScreen("wallet")} />;
  if (screen === "wallet") return <ScreenWalletHome vcs={vcs} onCreateVP={() => setScreen("createVP")} onNavigate={() => {}} />;
  if (screen === "createVP") return <ScreenCreateVP vcs={vcs} onNext={(sel) => { setSelectedVCs(sel); setScreen("disclosure"); }} onCancel={() => setScreen("wallet")} />;
  if (screen === "disclosure") return <ScreenSelectiveDisclosure selectedVCs={selectedVCs} onNext={(t) => { setToggles(t); setScreen("presentVP"); }} onBack={() => setScreen("createVP")} />;
  if (screen === "presentVP") return <ScreenPresentVP selectedVCs={selectedVCs} toggles={toggles} onBack={() => setScreen("wallet")} />;
  return null;
}

