import { useState, useEffect } from "react";

import {
  TypeBadge,
  TrustBadge,
  Panel,
  Btn,
  Sidebar,
  TopBar,
  BiometricModal,
  VCCard,
} from "../../components/index";

import { getAccent } from "../../components/Utils/vcUtils";
import { INCOMING_VC } from "../../mock/incomingVC";
import { VERIFIER_INFO } from "../../mock/verifierInfo";

// ─── ข้อมูลตัวอย่าง (MOCK DATA) ─────────────────────────────────────────────
const MOCK_VCS = [
  {
    id: "vc-1",
    type: "เอกสารรับรองรายได้",
    issuer: "บริษัท Fastwork จำกัด",
    issuerDID: "did:example:fastwork123",
    summary: "รายได้ · ฿45,000/เดือน",
    status: "valid",
    expiry: "2025-12-31",

    fields: [
      {
        key: "income_amount",
        label: "จำนวนรายได้",
        value: "฿45,000",
        required: true,
      },
      {
        key: "currency",
        label: "สกุลเงิน",
        value: "THB",
        required: true,
      },
      {
        key: "pay_period",
        label: "รอบการจ่าย",
        value: "รายเดือน",
        required: false,
      },
      {
        key: "source_platform",
        label: "แพลตฟอร์มต้นทาง",
        value: "Fastwork",
        required: false,
      },
      {
        key: "statement_date",
        label: "วันที่ออกเอกสาร",
        value: "2024-11-01",
        required: false,
      },
    ],
  },

  {
    id: "vc-2",
    type: "เอกสารยืนยันตัวตน (KYC)",
    issuer: "กรมการปกครอง",
    issuerDID: "did:example:dopa456",
    summary: "ยืนยันบัตรประชาชนแล้ว",
    status: "valid",
    expiry: "2026-06-30",

    fields: [
      {
        key: "national_id",
        label: "เลขบัตรประชาชน",
        value: "1-1234-56789-01-2",
        required: true,
      },
      {
        key: "full_name",
        label: "ชื่อ-นามสกุล",
        value: "Somchai Jaidee",
        required: true,
      },
      {
        key: "date_of_birth",
        label: "วันเกิด",
        value: "1990-05-15",
        required: false,
      },
      {
        key: "nationality",
        label: "สัญชาติ",
        value: "ไทย",
        required: false,
      },
    ],
  },

  {
    id: "vc-3",
    type: "เอกสารภาษี",
    issuer: "กรมสรรพากร",
    issuerDID: "did:example:revdept789",
    summary: "ปีภาษี 2023",
    status: "expiring",
    expiry: "2025-01-31",

    fields: [
      {
        key: "tax_year",
        label: "ปีภาษี",
        value: "2023",
        required: true,
      },
      {
        key: "total_income",
        label: "รายได้รวมที่ยื่น",
        value: "฿540,000",
        required: true,
      },
      {
        key: "tax_paid",
        label: "ภาษีที่ชำระ",
        value: "฿27,000",
        required: false,
      },
      {
        key: "filing_ref",
        label: "เลขอ้างอิงการยื่นภาษี",
        value: "TAX2023-001234",
        required: false,
      },
    ],
  },

  {
    id: "vc-4",
    type: "เอกสารประวัติการทำงาน",
    issuer: "บริษัท Fastwork จำกัด",
    issuerDID: "did:example:fastwork123",
    summary: "128 งาน · คะแนน 4.8",
    status: "valid",
    expiry: "2026-10-01",

    fields: [
      {
        key: "completed_jobs",
        label: "จำนวนงานที่สำเร็จ",
        value: "128",
        required: true,
      },
      {
        key: "average_rating",
        label: "คะแนนเฉลี่ย",
        value: "4.8",
        required: true,
      },
      {
        key: "work_consistency_score",
        label: "คะแนนความสม่ำเสมอในการทำงาน",
        value: "92",
        required: false,
      },
      {
        key: "platform_name",
        label: "แพลตฟอร์ม",
        value: "Fastwork",
        required: false,
      },
    ],
  },
];

const VC_KEY_TO_TYPE = {
  kyc: "เอกสารยืนยันตัวตน (KYC)",
  income: "เอกสารรับรองรายได้",
  workHistory: "เอกสารประวัติการทำงาน",
  tax: "เอกสารภาษี",
};

const MOCK_HISTORY = [
  {
    id: 1,
    action: "Shared Income Credential",
    verifier: "SCB Bank",
    date: "21 May 2026 · 13:42",
    status: "success",
  },
  {
    id: 2,
    action: "Received Work Credential",
    verifier: "Fastwork",
    date: "20 May 2026 · 09:20",
    status: "received",
  },
];

const MOCK_ISSUERS = [
  {
    id: "issuer-platform",
    name: "Platform",
    description: "ออกเอกสารรายได้และประวัติการทำงาน",
    did: "did:example:platform001",
    type: ["income", "workHistory"],
  },

  {
    id: "issuer-dopa",
    name: "DOPA",
    description: "กรมการปกครอง",
    did: "did:example:dopa001",
    type: ["kyc"],
  },

  {
    id: "issuer-social",
    name: "Department of Social Development",
    description: "ออกเอกสารด้านสวัสดิการสังคม",
    did: "did:example:social001",
    type: ["welfare"],
  },

  {
    id: "issuer-bureau",
    name: "Bureau",
    description: "หน่วยงานราชการ",
    did: "did:example:bureau001",
    type: ["official"],
  },
];

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
      <Sidebar
        active={active}
        onNavigate={onNavigate}
      />

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

// ─── หน้ารับ VC ───────────────────────────────────────────────────────────────
function ScreenReceiveVC({ onAccept, onReject }) {
  const [showBiometric, setShowBiometric] = useState(false);
  const vc = INCOMING_VC;

  return (
    <Shell active="wallet" onNavigate={() => {}}>
      <div className="min-h-screen bg-[#f3f6fb]">
        {/* HERO */}
        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#0f172a]
            via-[#13213f]
            to-[#1d3b6d]
            px-6
            pt-8
            pb-10
          "
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-white text-2xl font-bold">
                  Credential Request
                </p>

                <p className="text-blue-100/70 text-sm mt-1">
                  ตรวจสอบเอกสารก่อนบันทึกลง Wallet
                </p>
              </div>

              <div
                className="
                  px-4 py-2
                  rounded-full
                  bg-emerald-500/10
                  border
                  border-emerald-400/20
                  text-emerald-300
                  text-xs
                  font-semibold
                "
              >
                Verified Issuer
              </div>
            </div>

            {/* VC HERO CARD */}
            <div
              className="
                rounded-[32px]
                bg-white/10
                backdrop-blur-2xl
                border
                border-white/10
                p-6
              "
            >
              <div className="flex items-start justify-between gap-5">
                <div className="flex items-start gap-5">
                  <div
                    className={`
                      w-16 h-16 rounded-3xl
                      bg-gradient-to-br
                      ${getAccent(vc.type)}
                      flex items-center justify-center
                      shadow-xl
                    `}
                  >
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-white text-xl font-bold mb-1">
                      {vc.type}
                    </p>

                    <p className="text-blue-100/70 text-sm leading-relaxed">
                      เอกสารรับรองกำลังจะถูกจัดเก็บ ลงในกระเป๋าดิจิทัลของคุณ
                    </p>

                    <div className="flex items-center gap-2 mt-5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />

                      <span className="text-emerald-300 text-xs font-medium">
                        DID Verified Organization
                      </span>
                    </div>
                  </div>
                </div>

                <TrustBadge verified={vc.issuerVerified} />
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <p className="text-blue-100/50 text-xs uppercase tracking-widest mb-2">
                    Issuer
                  </p>

                  <p className="text-white font-semibold">{vc.issuer}</p>

                  <p className="text-blue-100/40 text-xs font-mono mt-1 truncate">
                    {vc.issuerDID}
                  </p>
                </div>

                <div>
                  <p className="text-blue-100/50 text-xs uppercase tracking-widest mb-2">
                    Expiration
                  </p>

                  <p className="text-white font-semibold">{vc.expiry}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* SECURITY NOTE */}
          <div
            className="
              rounded-3xl
              bg-emerald-50
              border
              border-emerald-100
              p-5
              flex
              items-start
              gap-4
              mb-8
            "
          >
            <div
              className="
                w-12 h-12
                rounded-2xl
                bg-emerald-100
                flex
                items-center
                justify-center
                flex-shrink-0
              "
            >
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 11V7a5 5 0 00-10 0v4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 11h14v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7z"
                />
              </svg>
            </div>

            <div>
              <p className="text-emerald-900 font-semibold mb-1">
                คุณเป็นเจ้าของข้อมูลของคุณเอง
              </p>

              <p className="text-emerald-700/80 text-sm leading-relaxed">
                Credential นี้รองรับ Selective Disclosure
                ทำให้คุณสามารถเลือกเปิดเผยเฉพาะข้อมูลที่จำเป็นได้
              </p>
            </div>
          </div>

          {/* FIELD GROUPS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {/* AUTO */}
            <div
              className="
                rounded-3xl
                border
                border-slate-200
                bg-white
                overflow-hidden
              "
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />

                  <p className="font-bold text-slate-900">Always Shared</p>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed">
                  ข้อมูลส่วนนี้จะถูกแนบทุกครั้ง เมื่อมีการนำเสนอ Credential
                </p>
              </div>

              <div className="p-3">
                {vc.autoFields.map((f) => (
                  <div
                    key={f.key}
                    className="
                      rounded-2xl
                      border
                      border-slate-100
                      p-4
                      mb-3
                      last:mb-0
                    "
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 mb-1">
                          {f.label}
                        </p>

                        <p className="text-sm text-slate-500">
                          {f.description}
                        </p>
                      </div>

                      <div
                        className="
                          px-2 py-1
                          rounded-lg
                          bg-slate-100
                          text-slate-500
                          text-xs
                          font-mono
                        "
                      >
                        {f.key}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SD */}
            <div
              className="
                rounded-3xl
                border
                border-blue-200
                bg-blue-50/40
                overflow-hidden
              "
            >
              <div className="p-5 border-b border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />

                  <p className="font-bold text-slate-900">
                    Selective Disclosure
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  คุณสามารถเลือกเปิดเผยข้อมูลแต่ละรายการได้เอง ในอนาคต
                </p>
              </div>

              <div className="p-3">
                {vc.selectableFields.map((f) => (
                  <div
                    key={f.key}
                    className="
                      rounded-2xl
                      border
                      border-blue-100
                      bg-white
                      p-4
                      mb-3
                      last:mb-0
                    "
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 mb-1">
                          {f.label}
                        </p>

                        <p className="text-sm text-slate-500">
                          {f.description}
                        </p>
                      </div>

                      <div
                        className="
                          px-2 py-1
                          rounded-lg
                          bg-blue-50
                          text-blue-600
                          text-xs
                          font-mono
                        "
                      >
                        SD
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBiometric(true)}
              className="
                flex-1
                h-14
                rounded-2xl
                bg-[#0f172a]
                hover:bg-[#18253d]
                text-white
                font-semibold
                transition-all
                shadow-xl
                shadow-slate-200
              "
            >
              ยอมรับและบันทึกลง Wallet
            </button>

            <button
              onClick={onReject}
              className="
                h-14
                px-7
                rounded-2xl
                border
                border-slate-200
                bg-white
                hover:bg-slate-50
                text-slate-700
                font-semibold
                transition-all
              "
            >
              ปฏิเสธ
            </button>
          </div>
        </div>
      </div>

      {showBiometric && (
        <BiometricModal
          action="ยืนยันการบันทึก Credential"
          onConfirm={() => {
            setShowBiometric(false);
            onAccept();
          }}
          onCancel={() => setShowBiometric(false)}
        />
      )}
    </Shell>
  );
}

// ─── หน้าหลัก Wallet ────────────────────────────────────────────────────────
function ScreenWalletHome({ vcs, onCreateVP, onNavigate, onOpenDetails }) {
  const [activeTab, setActiveTab] = useState("wallet");

  const validCount = vcs.filter((v) => v.status === "valid").length;

  const expiringCount = vcs.filter((v) => v.status === "expiring").length;

  const handleNav = (tab) => {
    setActiveTab(tab);

    if (tab === "present") {
      onCreateVP();
    }
  };

  return (
    <Shell active="wallet" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f4f7fb]">
        {/* HERO */}
        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#0b172b]
            via-[#12213f]
            to-[#1d3d70]
            px-6
            pt-8
            pb-10
          "
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-white text-3xl font-bold mb-2">
                  Identity Wallet
                </p>

                <p className="text-blue-100/70 text-base">
                  จัดการ Verifiable Credentials และควบคุมข้อมูลดิจิทัลของคุณ
                </p>

                <div className="flex items-center gap-2 mt-5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                  <span className="text-emerald-300 text-sm font-medium">
                    Wallet Secure & Verified
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate("scanVC")}
                className="
                  h-12
                  px-5
                  rounded-2xl
                  bg-blue-500
                  hover:bg-blue-600
                  text-white
                  font-semibold
                  transition-all
                  shadow-xl
                "
              >
                สร้าง VC
              </button>
              
              <button
                onClick={onCreateVP}
                className="
                  h-12
                  px-5
                  rounded-2xl
                  bg-white
                  hover:bg-slate-100
                  text-slate-900
                  font-semibold
                  transition-all
                  shadow-xl
                "
              >
                สร้าง VP
              </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                {
                  label: "Credentials",
                  value: vcs.length,
                },
                {
                  label: "Valid",
                  value: validCount,
                },
                {
                  label: "Expiring",
                  value: expiringCount,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="
                    rounded-3xl
                    bg-white/10
                    backdrop-blur-xl
                    border
                    border-white/10
                    p-5
                  "
                >
                  <p className="text-blue-100/60 text-sm mb-2">{s.label}</p>

                  <p className="text-white text-3xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* SECURITY */}
          <div
            className="
              rounded-3xl
              bg-emerald-50
              border
              border-emerald-100
              p-5
              flex
              items-center
              gap-4
              mb-8
            "
          >
            <div
              className="
                w-12 h-12
                rounded-2xl
                bg-emerald-100
                flex
                items-center
                justify-center
                flex-shrink-0
              "
            >
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 11V7a5 5 0 00-10 0v4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 11h14v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7z"
                />
              </svg>
            </div>

            <div className="flex-1">
              <p className="text-emerald-900 font-semibold mb-1">
                Wallet Protected
              </p>

              <p className="text-emerald-700/80 text-sm">
                DID ได้รับการยืนยันแล้ว และข้อมูลทั้งหมดถูกเข้ารหัสแบบ
                end-to-end
              </p>
            </div>

            <div
              className="
                hidden md:flex
                px-3 py-2
                rounded-xl
                bg-white
                border
                border-emerald-100
                text-xs
                font-mono
                text-slate-500
              "
            >
              did:example:holder001
            </div>
          </div>

          {/* HEADER */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-slate-900 text-xl font-bold">
                My Credentials
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                เอกสารรับรองทั้งหมดใน Wallet
              </p>
            </div>

            <div
              className="
                px-4 py-2
                rounded-xl
                bg-white
                border
                border-slate-200
                text-sm
                text-slate-500
              "
            >
              {vcs.length} Credentials
            </div>
          </div>

          {/* EMPTY */}
          {vcs.length === 0 ? (
            <div
              className="
                rounded-[36px]
                border
                border-dashed
                border-slate-300
                bg-white
                p-20
                text-center
              "
            >
              <div
                className="
                  w-20 h-20
                  rounded-3xl
                  bg-slate-100
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-6
                "
              >
                <svg
                  className="w-10 h-10 text-slate-300"
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

              <p className="text-slate-900 text-xl font-bold mb-2">
                ยังไม่มี Credentials
              </p>

              <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
                เมื่อองค์กรออกเอกสารรับรองให้คุณ เอกสารทั้งหมดจะปรากฏที่นี่
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {vcs.map((vc) => (
                <VCCard key={vc.id} vc={vc} onClick={() => onOpenDetails(vc)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

// ─── แสกน QR ────────────────────────────────────────────────────────
function ScreenScanIssuerQR({
  issuer,
  onComplete,
  onBack,
}) {
  return (
    <Shell active="wallet">
      <div className="min-h-screen bg-[#f4f7fb] px-6 py-8">
        <div className="max-w-xl mx-auto">
          <button
            onClick={onBack}
            className="text-slate-500 text-sm mb-6"
          >
            ← กลับ
          </button>

          <div className="bg-white rounded-[32px] p-8 border border-slate-200 text-center">
            <div
              className="
                w-24 h-24
                rounded-3xl
                bg-blue-100
                mx-auto
                flex
                items-center
                justify-center
                mb-6
              "
            >
              <svg
                className="w-12 h-12 text-blue-600"
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

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Scan Issuer QR
            </h2>

            <p className="text-slate-500 mb-8">
              สแกน QR Code ที่ออกโดย {issuer.name}
            </p>

            {/* MOCK QR */}
            <div
              className="
                w-64 h-64
                mx-auto
                rounded-3xl
                border-8
                border-slate-100
                bg-[repeating-linear-gradient(45deg,#111_0,#111_10px,#fff_10px,#fff_20px)]
                mb-8
              "
            />

            <button
              onClick={onComplete}
              className="
                w-full
                h-14
                rounded-2xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-semibold
                transition-all
              "
            >
              Demo: Complete Request
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── แสดง status ────────────────────────────────────────────────────────
function ScreenVCRequestStatus({
  issuer,
  onDone,
}) {
  return (
    <Shell active="wallet">
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-6">
        <div
          className="
            max-w-lg
            w-full
            bg-white
            rounded-[36px]
            border
            border-slate-200
            p-10
            text-center
          "
        >
          <div
            className="
              w-24 h-24
              rounded-full
              bg-emerald-100
              flex
              items-center
              justify-center
              mx-auto
              mb-6
            "
          >
            <svg
              className="w-12 h-12 text-emerald-600"
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

          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Request Completed
          </h1>

          <p className="text-slate-500 leading-relaxed">
            คำขอ VC ถูกส่งไปยัง {issuer.name} แล้ว
            ระบบกำลังดำเนินการออก Credential
          </p>

          <div
            className="
              mt-8
              rounded-2xl
              bg-slate-50
              border
              border-slate-200
              p-4
              text-left
            "
          >
            <p className="text-sm text-slate-400 mb-1">
              Issuer DID
            </p>

            <p className="font-mono text-sm text-slate-700">
              {issuer.did}
            </p>
          </div>

          <button
            onClick={onDone}
            className="
              mt-8
              w-full
              h-14
              rounded-2xl
              bg-slate-900
              hover:bg-black
              text-white
              font-semibold
              transition-all
            "
          >
            กลับหน้า Wallet
          </button>
        </div>
      </div>
    </Shell>
  );
}

// ─── หน้าสร้าง VP ───────────────────────────────────────────────────────────
function ScreenCreateVP({ vcs, onNext, onCancel }) {
  const [selected, setSelected] = useState([]);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const selectedVCs = vcs.filter((v) => selected.includes(v.id));

  return (
    <Shell active="present" onNavigate={() => {}}>
      <TopBar
        title="สร้าง Verifiable Presentation"
        subtitle="เลือกเอกสารที่ต้องการนำเสนอ"
        actions={
          <Btn onClick={onCancel} variant="ghost">
            ← ยกเลิก
          </Btn>
        }
      />

      <div className="p-6 max-w-6xl mx-auto w-full">
        {/* Request Overview */}
        <Panel className="overflow-hidden mb-6">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              {/* Left */}
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-7 h-7 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586A1 1 0 0113.293 3.293l4.414 4.414A1 1 0 0118 8.414V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="text-slate-900 font-bold text-lg">
                      {VERIFIER_INFO.name}
                    </p>

                    <TrustBadge verified />
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                    {VERIFIER_INFO.purpose}
                  </p>

                  <p className="text-slate-400 text-xs font-mono mt-3 truncate">
                    {VERIFIER_INFO.did}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col gap-3 lg:items-end">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-w-[220px]">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    ต้องการข้อมูล
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {VERIFIER_INFO.requestedTypes.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Secure DID Connection
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Selection Summary */}
        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-slate-900 font-bold text-sm">
              เลือกเอกสารรับรอง
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              เลือกเอกสารที่ต้องการใช้สร้าง Presentation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
              <p className="text-blue-700 text-sm font-semibold">
                เลือกแล้ว {selected.length} เอกสาร
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              <p className="text-slate-500 text-sm">
                ทั้งหมด {vcs.length} เอกสาร
              </p>
            </div>
          </div>
        </div>

        {/* VC Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-7">
          {vcs.map((vc) => (
            <VCCard
              key={vc.id}
              vc={vc}
              selectable
              selected={selected.includes(vc.id)}
              onClick={() => toggle(vc.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {vcs.length === 0 && (
          <Panel className="p-14 text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586A1 1 0 0113.293 3.293l4.414 4.414A1 1 0 0118 8.414V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <p className="text-slate-700 font-bold text-base">
              ยังไม่มีเอกสารรับรอง
            </p>

            <p className="text-slate-400 text-sm mt-1">
              เอกสารที่ได้รับจะปรากฏที่นี่
            </p>
          </Panel>
        )}

        {/* Sticky Action Bar */}
        <div className="sticky bottom-4 z-20">
          <div className="bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              {selected.length === 0 ? (
                <>
                  <p className="text-slate-700 font-semibold text-sm">
                    ยังไม่ได้เลือกเอกสาร
                  </p>

                  <p className="text-slate-400 text-xs mt-1">
                    กรุณาเลือกอย่างน้อย 1 เอกสารเพื่อดำเนินการต่อ
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-900 font-semibold text-sm">
                    พร้อมสร้าง Presentation
                  </p>

                  <p className="text-slate-500 text-xs mt-1">
                    ระบบจะให้คุณเลือกข้อมูลที่ต้องการเปิดเผยในขั้นตอนถัดไป
                  </p>
                </>
              )}
            </div>

            <Btn
              disabled={selected.length === 0}
              onClick={() => onNext(selectedVCs)}
              className="py-3 px-8 justify-center bg-blue-700 hover:bg-blue-800 shadow-blue-200"
            >
              ถัดไป: เลือกข้อมูล →
            </Btn>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN: SELECTIVE DISCLOSURE ─────────────────────────────────────────────
function ScreenSelectiveDisclosure({ selectedVCs, onNext, onBack }) {
  const initToggles = () => {
    const t = {};

    selectedVCs.forEach((vc) =>
      vc.fields.forEach((f) => {
        t[`${vc.id}-${f.key}`] = true;
      }),
    );

    return t;
  };

  const [toggles, setToggles] = useState(initToggles);

  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(selectedVCs.map((v) => [v.id, false])),
  );

  const flip = (vcId, key, required) => {
    if (required) return;

    setToggles((prev) => ({
      ...prev,
      [`${vcId}-${key}`]: !prev[`${vcId}-${key}`],
    }));
  };

  const toggleExpand = (vcId) => {
    setExpanded((prev) => ({
      ...prev,
      [vcId]: !prev[vcId],
    }));
  };

  const totalShared = Object.values(toggles).filter(Boolean).length;

  const totalFields = selectedVCs.reduce(
    (sum, vc) => sum + vc.fields.length,
    0,
  );

  const totalHidden = totalFields - totalShared;

  return (
    <Shell active="present" onNavigate={() => {}}>
      <TopBar
        title="Selective Disclosure"
        subtitle="ควบคุมข้อมูลที่ต้องการเปิดเผย"
        actions={
          <Btn onClick={onBack} variant="ghost">
            ← กลับ
          </Btn>
        }
      />

      {/* PAGE */}
      <div className="flex flex-col min-h-[calc(100vh-72px)]">
        {/* CONTENT AREA */}
        <div className="flex-1 w-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-40">
            {/* HEADER SUMMARY */}
            <Panel className="overflow-hidden mb-6 shadow-sm border border-slate-200 rounded-3xl">
              {/* Accent */}
              <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

              <div className="p-5 sm:p-6">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                  {/* LEFT */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-7 h-7 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                        />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-semibold mb-1">
                        ส่งข้อมูลไปยัง
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                          {VERIFIER_INFO.name}
                        </h2>

                        <TrustBadge verified />
                      </div>

                      <p className="text-slate-400 text-xs font-mono mt-2 break-all">
                        {VERIFIER_INFO.did}
                      </p>

                      <p className="text-slate-500 text-sm mt-4 leading-relaxed max-w-2xl">
                        กรุณาตรวจสอบข้อมูลที่จะถูกแชร์ก่อนยืนยันการส่ง
                        ระบบจะลงลายเซ็นดิจิทัลด้วย DID ของคุณ
                        เพื่อยืนยันความถูกต้องของ Presentation
                      </p>

                      {/* Privacy Note */}
                      {totalHidden > 0 && (
                        <div className="flex items-center gap-2 mt-4">
                          <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />

                          <p className="text-xs font-medium text-amber-700">
                            มีบางข้อมูลถูกซ่อนเพื่อเพิ่มความเป็นส่วนตัว
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SUMMARY */}
                  <div className="grid grid-cols-2 gap-3 w-full xl:w-auto xl:min-w-[280px]">
                    {/* Selected VC */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-slate-400 text-[11px] uppercase tracking-wide font-semibold mb-2">
                        เอกสารที่เลือก
                      </p>

                      <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-slate-900 leading-none">
                          {selectedVCs.length}
                        </p>

                        <span className="text-slate-400 text-sm mb-1">VCs</span>
                      </div>
                    </div>

                    {/* Shared Fields */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                      <p className="text-emerald-600 text-[11px] uppercase tracking-wide font-semibold mb-2">
                        ข้อมูลที่แชร์
                      </p>

                      <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-emerald-700 leading-none">
                          {totalShared}
                        </p>

                        <span className="text-emerald-600 text-sm mb-1">
                          Fields
                        </span>
                      </div>
                    </div>

                    {/* Hidden Fields */}
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-[11px] uppercase tracking-wide font-semibold mb-1">
                            ข้อมูลที่ซ่อน
                          </p>

                          <p className="text-lg font-bold text-slate-900">
                            {totalHidden} รายการ
                          </p>
                        </div>

                        <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.956 9.956 0 012.042-3.368m3.1-2.59A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-4.132 5.411M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L3 3"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>

            {/* INFO BANNER */}
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-3xl p-4 sm:p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white border border-blue-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-700"
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

              <div className="min-w-0">
                <p className="text-blue-900 font-semibold text-sm">
                  ข้อมูลที่ปิดไว้จะไม่ถูกแชร์ออกจาก Wallet
                </p>

                <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                  Required fields จำเป็นต่อการยืนยันตัวตนและไม่สามารถปิดได้
                </p>
              </div>
            </div>

            {/* VC LIST */}
            <div className="space-y-4">
              {selectedVCs.map((vc) => {
                const disclosed = vc.fields.filter(
                  (f) => toggles[`${vc.id}-${f.key}`],
                );

                const hidden = vc.fields.filter(
                  (f) => !toggles[`${vc.id}-${f.key}`] && !f.required,
                );

                const isExpanded = expanded[vc.id];

                return (
                  <Panel
                    key={vc.id}
                    className="
                      overflow-hidden
                      border border-slate-200
                      rounded-3xl
                      bg-white
                      shadow-sm
                    "
                  >
                    {/* Accent */}
                    <div
                      className={`h-1.5 bg-gradient-to-r ${getAccent(vc.type)}`}
                    />

                    {/* HEADER */}
                    <button
                      onClick={() => toggleExpand(vc.id)}
                      className="
                        w-full text-left
                        p-4 sm:p-5
                        hover:bg-slate-50
                        transition-colors
                      "
                    >
                      <div className="flex items-start gap-4">
                        {/* Main */}
                        <div className="flex-1 min-w-0">
                          <TypeBadge type={vc.type} />

                          <div className="mt-3">
                            <p className="text-slate-900 font-bold text-sm sm:text-base leading-snug">
                              {vc.issuer}
                            </p>

                            <p className="text-slate-400 text-xs font-mono mt-1 truncate">
                              {vc.issuerDID}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="hidden sm:flex bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-center flex-col min-w-[72px]">
                            <p className="text-[11px] text-emerald-600 font-semibold">
                              แชร์
                            </p>

                            <p className="text-lg font-bold text-emerald-700">
                              {disclosed.length}
                            </p>
                          </div>

                          {hidden.length > 0 && (
                            <div className="hidden sm:flex bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-center flex-col min-w-[72px]">
                              <p className="text-[11px] text-slate-500 font-semibold">
                                ซ่อน
                              </p>

                              <p className="text-lg font-bold text-slate-700">
                                {hidden.length}
                              </p>
                            </div>
                          )}

                          {/* Expand */}
                          <div
                            className={`
                              w-10 h-10 rounded-2xl border border-slate-200
                              bg-white
                              flex items-center justify-center
                              transition-all duration-200
                              ${isExpanded ? "rotate-180 bg-slate-50" : ""}
                            `}
                          >
                            <svg
                              className="w-5 h-5 text-slate-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Summary */}
                      <div className="flex sm:hidden items-center gap-2 mt-4">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5">
                          <p className="text-xs font-semibold text-emerald-700">
                            แชร์ {disclosed.length}
                          </p>
                        </div>

                        {hidden.length > 0 && (
                          <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
                            <p className="text-xs font-semibold text-slate-700">
                              ซ่อน {hidden.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* CONTENT */}
                    {isExpanded && (
                      <div className="border-t border-slate-100">
                        <div className="max-h-[420px] overflow-y-auto">
                          <div className="divide-y divide-slate-100">
                            {vc.fields.map((f) => {
                              const k = `${vc.id}-${f.key}`;
                              const on = toggles[k];

                              return (
                                <button
                                  key={f.key}
                                  disabled={f.required}
                                  onClick={() => flip(vc.id, f.key, f.required)}
                                  className={`
                                    w-full text-left
                                    px-4 sm:px-5 py-4
                                    transition-all
                                    ${
                                      on ? "bg-white" : "bg-slate-50 opacity-75"
                                    }
                                    ${
                                      !f.required
                                        ? "hover:bg-blue-50"
                                        : "cursor-default"
                                    }
                                  `}
                                >
                                  <div className="flex items-start gap-4">
                                    {/* Toggle */}
                                    <div
                                      className={`
                                        relative w-11 h-6 rounded-full mt-0.5 flex-shrink-0
                                        transition-colors
                                        ${on ? "bg-blue-600" : "bg-slate-300"}
                                      `}
                                    >
                                      <span
                                        className={`
                                          absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                                          ${
                                            on
                                              ? "translate-x-6"
                                              : "translate-x-1"
                                          }
                                        `}
                                      />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p
                                          className={`
                                            text-sm font-semibold
                                            ${
                                              on
                                                ? "text-slate-900"
                                                : "text-slate-400"
                                            }
                                          `}
                                        >
                                          {f.label}
                                        </p>

                                        {f.required && (
                                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 border border-red-100 text-red-600">
                                            Required
                                          </span>
                                        )}
                                      </div>

                                      <p
                                        className={`
                                          text-xs font-mono mt-1 break-all leading-relaxed
                                          ${
                                            on
                                              ? "text-slate-500"
                                              : "text-slate-300"
                                          }
                                        `}
                                      >
                                        {f.value}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </Panel>
                );
              })}
            </div>
          </div>
        </div>

        {/* FIXED ACTION BAR */}
        <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
          <div className="lg:pl-60">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
              <div
                className="
                  pointer-events-auto
                  bg-white/95 backdrop-blur-2xl
                  border border-slate-200
                  shadow-2xl
                  rounded-3xl
                  overflow-hidden
                "
              >
                {/* Accent */}
                <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />

                <div className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={`
                            w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border
                            ${
                              totalShared > 0
                                ? "bg-blue-50 border-blue-100"
                                : "bg-slate-100 border-slate-200"
                            }
                          `}
                        >
                          <svg
                            className={`w-5 h-5 ${
                              totalShared > 0
                                ? "text-blue-700"
                                : "text-slate-400"
                            }`}
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
                        </div>

                        {/* Text */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-slate-900 font-semibold text-sm">
                              พร้อมสร้าง Verifiable Presentation
                            </p>

                            <div className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                              <span className="text-[11px] font-semibold text-blue-700">
                                แชร์ {totalShared} รายการ
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                            ระบบจะสร้าง Presentation จากข้อมูลที่เปิดเผยเท่านั้น
                          </p>

                          {totalHidden > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />

                              <p className="text-[11px] text-amber-700 font-medium">
                                มีบางข้อมูลถูกซ่อนเพื่อเพิ่มความเป็นส่วนตัว
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <Btn
                        onClick={onBack}
                        variant="secondary"
                        className="py-3 px-6 w-full sm:w-auto justify-center"
                      >
                        กลับ
                      </Btn>

                      <Btn
                        onClick={() => onNext(toggles)}
                        className="
                          py-3 px-8
                          w-full sm:w-auto
                          justify-center
                          bg-blue-700 hover:bg-blue-800
                          shadow-lg shadow-blue-200
                        "
                      >
                        ตรวจสอบและส่ง →
                      </Btn>
                    </div>
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

// ─── SCREEN: PRESENT VP (UX/UI IMPROVED) ─────────────────────────────────────
function ScreenPresentVP({ selectedVCs, toggles, onBack }) {
  const [showBiometric, setShowBiometric] = useState(false);
  const [sent, setSent] = useState(false);

  const getDisclosed = (vc) =>
    vc.fields.filter((f) => toggles[`${vc.id}-${f.key}`]);

  const getHiddenCount = (vc) =>
    vc.fields.filter((f) => !toggles[`${vc.id}-${f.key}`] && !f.required)
      .length;

  const totalHidden = selectedVCs.reduce(
    (sum, vc) => sum + getHiddenCount(vc),
    0,
  );

  const totalDisclosed = selectedVCs.reduce(
    (sum, vc) => sum + getDisclosed(vc).length,
    0,
  );

  if (sent) {
    return (
      <Shell active="present" onNavigate={() => {}}>
        <div className="flex-1 flex items-center justify-center px-6 py-10 bg-slate-50">
          <div className="max-w-lg w-full">
            <Panel className="overflow-hidden border-emerald-200 shadow-xl shadow-emerald-100/40">
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

              <div className="p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <p className="text-emerald-700 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                  Presentation Sent
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  ส่งข้อมูลสำเร็จ
                </h2>

                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                  ข้อมูล Verifiable Presentation ถูกเข้ารหัส
                  และส่งไปยังผู้ตรวจสอบเรียบร้อยแล้ว
                </p>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-slate-400 text-[11px] uppercase tracking-widest font-semibold mb-1">
                        ผู้รับข้อมูล
                      </p>

                      <p className="text-slate-900 font-bold text-base">
                        {VERIFIER_INFO.name}
                      </p>

                      <p className="text-slate-400 text-[11px] font-mono mt-1 break-all">
                        {VERIFIER_INFO.did}
                      </p>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                      Verified
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-slate-400 text-[11px] mb-1">
                        แชร์ข้อมูล
                      </p>

                      <p className="text-lg font-bold text-slate-900">
                        {totalDisclosed}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-slate-400 text-[11px] mb-1">
                        ซ่อนข้อมูล
                      </p>

                      <p className="text-lg font-bold text-slate-900">
                        {totalHidden}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  {sessionStorage.getItem("verifier_request") ? (
                    <Btn
                      onClick={() => {
                        window.location.href = "/verifier";
                      }}
                      className="py-3 px-8 bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-200"
                    >
                      กลับไปยัง Verifier →
                    </Btn>
                  ) : (
                    <Btn
                      onClick={onBack}
                      className="py-3 px-8 bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-200"
                    >
                      กลับไปยัง Wallet
                    </Btn>
                  )}
                </div>

                <p className="text-slate-400 text-[11px] mt-5">
                  {new Date().toLocaleString("th-TH")}
                </p>
              </div>
            </Panel>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell active="present" onNavigate={() => {}}>
      <TopBar
        title="ตรวจสอบก่อนส่ง"
        subtitle="Verifiable Presentation Review"
        actions={
          <Btn onClick={onBack} variant="ghost">
            ← กลับ
          </Btn>
        }
      />

      <div className="p-6 max-w-6xl mx-auto w-full">
        {/* HEADER SUMMARY */}
        <Panel className="overflow-hidden mb-6 shadow-sm border-slate-200">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-7 h-7 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-semibold mb-1">
                    ส่งข้อมูลไปยัง
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900">
                    {VERIFIER_INFO.name}
                  </h2>

                  <p className="text-slate-400 text-xs font-mono mt-1 break-all">
                    {VERIFIER_INFO.did}
                  </p>

                  <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-2xl">
                    กรุณาตรวจสอบข้อมูลที่จะถูกแชร์ก่อนยืนยันการส่ง
                    ระบบจะลงลายเซ็นดิจิทัลด้วย DID ของคุณ
                    เพื่อยืนยันความถูกต้องของ Presentation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 min-w-[240px]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-slate-400 text-[11px] mb-1">
                    เอกสารที่เลือก
                  </p>

                  <p className="text-2xl font-bold text-slate-900">
                    {selectedVCs.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-slate-400 text-[11px] mb-1">
                    ข้อมูลที่แชร์
                  </p>

                  <p className="text-2xl font-bold text-emerald-700">
                    {totalDisclosed}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* PRIVACY ALERT */}
        {totalHidden > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"
                />
              </svg>
            </div>

            <div className="flex-1">
              <p className="text-amber-800 font-semibold text-sm">
                มีข้อมูลถูกซ่อน {totalHidden} รายการ
              </p>

              <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                ผู้ตรวจสอบจะไม่สามารถเข้าถึงข้อมูลที่คุณไม่ได้อนุญาตให้แชร์ได้
              </p>
            </div>
          </div>
        )}

        {/* VC LIST */}
        <div className="space-y-5 mb-8">
          {selectedVCs.map((vc) => {
            const disclosed = getDisclosed(vc);
            const hidden = getHiddenCount(vc);

            return (
              <Panel
                key={vc.id}
                className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`h-1 bg-gradient-to-r ${getAccent(vc.type)}`} />

                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-slate-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                          />
                        </svg>
                      </div>

                      <div>
                        <TypeBadge type={vc.type} />

                        <p className="text-slate-900 font-bold text-base mt-2">
                          {vc.issuer}
                        </p>

                        <p className="text-slate-400 text-xs font-mono mt-1 break-all">
                          {vc.issuerDID}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-center min-w-[90px]">
                        <p className="text-[11px] text-emerald-600 mb-0.5">
                          แชร์
                        </p>

                        <p className="text-lg font-bold text-emerald-700">
                          {disclosed.length}
                        </p>
                      </div>

                      {hidden > 0 && (
                        <div className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-center min-w-[90px]">
                          <p className="text-[11px] text-slate-500 mb-0.5">
                            ซ่อน
                          </p>

                          <p className="text-lg font-bold text-slate-700">
                            {hidden}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {disclosed.map((f) => (
                    <div
                      key={f.key}
                      className="px-6 py-4 flex items-start justify-between gap-5 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-slate-900 text-sm font-semibold">
                          {f.label}
                        </p>

                        <p className="text-slate-400 text-[11px] mt-1 font-mono">
                          {f.key}
                        </p>
                      </div>

                      <div className="text-right min-w-[160px]">
                        <p className="text-slate-700 text-sm font-medium break-words">
                          {f.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>

        {/* SECURITY INFO */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 flex items-start gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <div>
            <p className="text-blue-800 font-semibold text-sm">
              ข้อมูลได้รับการปกป้องด้วย Cryptographic Proof
            </p>

            <p className="text-blue-700 text-sm mt-1 leading-relaxed">
              ระบบจะลงลายเซ็นดิจิทัลด้วย DID ของคุณก่อนส่งข้อมูล
              เพื่อป้องกันการปลอมแปลงและยืนยันความถูกต้องของ Presentation
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Btn
            onClick={() => setShowBiometric(true)}
            className="py-3.5 px-8 bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-200"
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            ยืนยันและส่ง Presentation
          </Btn>

          <Btn onClick={onBack} variant="secondary" className="py-3.5 px-6">
            กลับไปแก้ไข
          </Btn>
        </div>
      </div>

      {showBiometric && (
        <BiometricModal
          action="ลงลายเซ็นและส่ง Verifiable Presentation"
          onConfirm={() => {
            sessionStorage.setItem(
              "holder_submitted",
              JSON.stringify({
                submittedVCTypes: selectedVCs.map((vc) => vc.type),
              }),
            );

            setShowBiometric(false);
            setSent(true);
          }}
          onCancel={() => setShowBiometric(false)}
        />
      )}
    </Shell>
  );
}

// ─── Login ─────────────────────────────────────
function ScreenLogin({ onLogin, onGoRegister }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-xl">
        <div className="bg-gradient-to-br from-[#0b172b] via-[#12213f] to-[#1d3d70] px-8 py-10">
          <p className="text-blue-100 text-sm uppercase tracking-[0.25em] font-semibold mb-3">
            Identity Wallet
          </p>

          <h1 className="text-white text-3xl font-bold">Welcome Back</h1>

          <p className="text-blue-100/70 mt-3 text-sm leading-relaxed">
            เข้าสู่ระบบเพื่อจัดการ Digital Identity ของคุณ
          </p>
        </div>

        <div className="p-8 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  email: e.target.value,
                }))
              }
              className="w-full h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              Password
            </label>

            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  password: e.target.value,
                }))
              }
              className="w-full h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            onClick={onLogin}
            className="w-full h-14 rounded-2xl bg-[#0f172a] text-white font-semibold"
          >
            Sign In
          </button>

          <button
            onClick={onGoRegister}
            className="w-full h-14 rounded-2xl border border-slate-200"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ScreenRegister ─────────────────────────────────────
function ScreenRegister({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-xl">
        <div className="bg-gradient-to-br from-[#0b172b] via-[#12213f] to-[#1d3d70] px-8 py-10">
          <h1 className="text-white text-3xl font-bold">
            Create Wallet Account
          </h1>

          <p className="text-blue-100/70 text-sm mt-3">
            สร้างบัญชี Wallet ใหม่
          </p>
        </div>

        <div className="p-8 space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) =>
              setForm((p) => ({ ...p, fullName: e.target.value }))
            }
            className="w-full h-14 rounded-2xl border border-slate-200 px-4"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full h-14 rounded-2xl border border-slate-200 px-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            className="w-full h-14 rounded-2xl border border-slate-200 px-4"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((p) => ({ ...p, confirmPassword: e.target.value }))
            }
            className="w-full h-14 rounded-2xl border border-slate-200 px-4"
          />

          <button
            onClick={onRegister}
            className="w-full h-14 rounded-2xl bg-[#0f172a] text-white font-semibold"
          >
            Create Account
          </button>

          <button
            onClick={onGoLogin}
            className="w-full h-14 rounded-2xl border border-slate-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KYC PAGE ─────────────────────────────────────
function ScreenKYC({ onComplete }) {
  const [step, setStep] = useState(1);

  return (
    <Shell active="kyc" onNavigate={() => {}}>
      <div className="min-h-screen bg-[#f4f7fb] px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#0b172b] via-[#12213f] to-[#1d3d70] rounded-[36px] px-8 py-10 text-white mb-8">
            <h1 className="text-4xl font-bold mb-4">Identity Verification</h1>

            <p className="text-blue-100/70 leading-relaxed max-w-2xl">
              ยืนยันตัวตนเพื่อใช้งาน Wallet เต็มรูปแบบ
            </p>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    className="h-14 rounded-2xl border border-slate-200 px-4"
                    placeholder="ชื่อ"
                  />

                  <input
                    className="h-14 rounded-2xl border border-slate-200 px-4"
                    placeholder="นามสกุล"
                  />

                  <input
                    className="h-14 rounded-2xl border border-slate-200 px-4 md:col-span-2"
                    placeholder="เลขบัตรประชาชน"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Upload Documents</h2>

                <div className="border-2 border-dashed border-slate-300 rounded-[32px] p-16 text-center">
                  Upload ID Card
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center">
                <div className="w-40 h-40 rounded-full bg-slate-100 mx-auto mb-6" />

                <h2 className="text-2xl font-bold mb-3">Face Verification</h2>

                <p className="text-slate-500">สแกนใบหน้าเพื่อยืนยันตัวตน</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-10">
              <button
                disabled={step === 1}
                onClick={() => setStep((p) => p - 1)}
                className="h-12 px-6 rounded-2xl border border-slate-200"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep((p) => p + 1)}
                  className="h-12 px-8 rounded-2xl bg-[#0f172a] text-white font-semibold"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="h-12 px-8 rounded-2xl bg-emerald-700 text-white font-semibold"
                >
                  Complete Verification
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── CONSENT MODAL ─────────────────────────────────────
function ConsentModal({
  open,
  requestor,
  purpose,
  requestedFields,
  expiresIn,
  onApprove,
  onReject,
}) {
  const [accepted, setAccepted] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-8 py-6">
          <div className="flex items-center gap-3 mb-3">

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-white text-2xl font-bold">
                ขอความยินยอมในการแชร์ข้อมูล
              </h2>

              <p className="text-slate-300 text-sm mt-1">
                กรุณาตรวจสอบข้อมูลก่อนอนุมัติ
              </p>
            </div>

          </div>
        </div>

        {/* BODY */}
        <div className="p-8">

          {/* REQUESTOR */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              ผู้ร้องขอข้อมูล
            </p>

            <p className="text-lg font-bold text-slate-900">
              {requestor.name}
            </p>

            <p className="text-xs text-slate-500 font-mono mt-2 break-all">
              {requestor.did}
            </p>
          </div>

          {/* PURPOSE */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-700 mb-2">
              วัตถุประสงค์การใช้งานข้อมูล
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed">
              {purpose}
            </div>
          </div>

          {/* REQUESTED FIELDS */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              ข้อมูลที่กำลังจะถูกแชร์
            </p>

            <div className="space-y-3">
              {requestedFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <span className="text-slate-700 font-medium">
                    {field}
                  </span>

                  <span className="text-emerald-600 text-sm font-semibold">
                    Shared
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LEGAL NOTICE */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
            <p className="text-sm font-bold text-amber-800 mb-2">
              ข้อกำหนดด้านกฎหมายและความเป็นส่วนตัว
            </p>

            <ul className="space-y-2 text-sm text-amber-900/90 leading-relaxed">
              <li>
                • ข้อมูลจะถูกใช้ตามวัตถุประสงค์ที่ระบุเท่านั้น
              </li>

              <li>
                • ผู้ใช้งานสามารถถอน Consent ได้ภายหลัง
              </li>

              <li>
                • ระบบมีการบันทึก Audit Log ตามมาตรฐานความปลอดภัย
              </li>

              <li>
                • ข้อมูลจะถูกเก็บรักษาตาม PDPA/GDPR Compliance
              </li>

              <li>
                • Consent นี้มีอายุ {expiresIn}
              </li>
            </ul>
          </div>

          {/* CHECKBOX */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-300"
            />

            <span className="text-sm text-slate-600 leading-relaxed">
              ฉันยินยอมให้มีการแชร์ข้อมูลตามรายละเอียดด้านบน
              และรับทราบข้อกำหนดด้านความปลอดภัยและกฎหมาย
            </span>
          </label>

          {/* ACTION */}
          <div className="flex items-center gap-4">

            <button
              onClick={onReject}
              className="flex-1 h-14 rounded-2xl border border-slate-200 font-semibold"
            >
              ปฏิเสธ
            </button>

            <button
              disabled={!accepted}
              onClick={onApprove}
              className={`flex-1 h-14 rounded-2xl text-white font-semibold transition-all ${
                accepted
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              ยืนยันการแชร์ข้อมูล
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

// ─── USAGE HISTORY PAGE ─────────────────────────────────────
function ScreenUsageHistory({
  onBack,
  onNavigate,
}) {
  return (
    <Shell
      active="history"
      onNavigate={onNavigate}
    >
      <div className="min-h-screen bg-[#f4f7fb] px-6 py-8">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Usage History
              </h1>

              <p className="text-slate-500 mt-2">
                ประวัติการใช้งาน Wallet
              </p>
            </div>

            <button
              onClick={onBack}
              className="h-12 px-6 rounded-2xl border border-slate-200 bg-white"
            >
              Back
            </button>
          </div>

          <div className="space-y-4">
            {MOCK_HISTORY.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-[28px] p-6"
              >
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-slate-900 font-bold text-lg">
                      {item.action}
                    </p>

                    <p className="text-slate-500 mt-1">
                      {item.verifier}
                    </p>

                    <p className="text-slate-400 text-sm mt-3">
                      {item.date}
                    </p>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm">
                    {item.status}
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Shell>
  );
}

// ─── USAGE HISTORY PAGE ─────────────────────────────────────
function ScreenCredentialDetails({ vc, onBack }) {
  return (
    <Shell active="wallet" onNavigate={() => {}}>
      <div className="min-h-screen bg-[#f4f7fb] px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 h-12 px-6 rounded-2xl border border-slate-200 bg-white"
          >
            ← Back
          </button>

          <div className="rounded-[36px] overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className={`h-2 bg-gradient-to-r ${getAccent(vc.type)}`} />

            <div className="p-8">
              <div className="flex items-start justify-between gap-5 mb-8">
                <div>
                  <TypeBadge type={vc.type} />

                  <h1 className="text-3xl font-bold text-slate-900 mt-4">
                    {vc.type}
                  </h1>

                  <p className="text-slate-500 mt-2">{vc.summary}</p>
                </div>

                <TrustBadge verified />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-slate-400 text-sm mb-2">Issuer</p>

                  <p className="text-slate-900 font-bold">{vc.issuer}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-slate-400 text-sm mb-2">Expiry Date</p>

                  <p className="text-slate-900 font-bold">{vc.expiry}</p>
                </div>
              </div>

              <div className="space-y-4">
                {vc.fields.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {field.label}
                        </p>

                        <p className="text-slate-400 text-xs font-mono mt-1">
                          {field.key}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-700 font-medium">
                          {field.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");

  const [vcs, setVCs] = useState(MOCK_VCS);

  const [selectedVCs, setSelectedVCs] = useState([]);

  const [selectedCredential, setSelectedCredential] = useState(null);

  const [toggles, setToggles] = useState({});

  const [showConsent, setShowConsent] = useState(false);

  const [selectedIssuer, setSelectedIssuer] = useState(null);

  const handleNavigate = (target) => {
    if (target === "wallet") {
      setScreen("wallet");
    }

    if (target === "history") {
      setScreen("history");
    }

    if (target === "present") {
      setScreen("createVP");
    }

    if (target === "settings") {
      setScreen("settings");
    }

    if (target === "scanVC") {
      setSelectedIssuer(MOCK_ISSUERS[0]);
      setScreen("scanIssuerQR");
    }
  };

  // =========================================
  // HANDLE VERIFIER REQUEST
  // =========================================

  useEffect(() => {
    const reqStr = sessionStorage.getItem("verifier_request");

    if (!reqStr) return;

    try {
      const req = JSON.parse(reqStr);

      const typeStrings = [
        ...(req.requiredTypes || []),
        ...(req.consentTypes || []),
      ]
        .map((k) => VC_KEY_TO_TYPE[k])
        .filter(Boolean);

      const matched = MOCK_VCS.filter((vc) => typeStrings.includes(vc.type));

      if (matched.length > 0) {
        setSelectedVCs(matched);
        setScreen("disclosure");
      }
    } catch (err) {
      console.error("Invalid verifier request", err);
    }
  }, []);

  // =========================================
  // LOGIN
  // =========================================

  if (screen === "login") {
    return (
      <ScreenLogin
        onLogin={() => setScreen("wallet")}
        onGoRegister={() => setScreen("register")}
      />
    );
  }

  // =========================================
  // REGISTER
  // =========================================

  if (screen === "register") {
    return (
      <ScreenRegister
        onRegister={() => setScreen("kyc")}
        onGoLogin={() => setScreen("login")}
      />
    );
  }

  // =========================================
  // KYC
  // =========================================

  if (screen === "kyc") {
    return (
      <ScreenKYC
        onComplete={() => {
          setVCs((p) => [
            ...p,
            {
              id: "vc-kyc",
              type: "KYC Credential",
              issuer: "DOPA",
              issuerDID: "did:example:dopa",
              summary: "Identity Verified",
              status: "valid",
              expiry: "2028-01-01",
              fields: [
                {
                  key: "verification_level",
                  label: "Verification Level",
                  value: "Level 2",
                  required: true,
                },
              ],
            },
          ]);

          setScreen("wallet");
        }}
      />
    );
  }

  // =========================================
  // RECEIVE VC
  // =========================================

  if (screen === "receive") {
    return (
      <ScreenReceiveVC
        onAccept={() => {
          setVCs((p) => [
            ...p,
            {
              ...INCOMING_VC,
              status: "valid",
              summary: "Work · Senior Dev",
              fields: [
                ...INCOMING_VC.autoFields.map((f) => ({
                  ...f,
                  value: "—",
                  required: true,
                })),

                ...INCOMING_VC.selectableFields.map((f) => ({
                  ...f,
                  value: "—",
                  required: false,
                })),
              ],
            },
          ]);

          setScreen("wallet");
        }}
        onReject={() => setScreen("wallet")}
      />
    );
  }

  // =========================================
  // SCAN ISSUER QR
  // =========================================

  if (screen === "scanIssuerQR") {
    return (
      <ScreenScanIssuerQR
        issuer={selectedIssuer}
        onBack={() => setScreen("wallet")}
        onComplete={() => {
          setScreen("vcRequestStatus");
        }}
      />
    );
  }

  // =========================================
  // VC REQUEST STATUS
  // =========================================

  if (screen === "vcRequestStatus") {
    return (
      <ScreenVCRequestStatus
        issuer={selectedIssuer}
        onDone={() => {
          setScreen("wallet");
        }}
      />
    );
  }

  // =========================================
  // WALLET HOME
  // =========================================

  if (screen === "wallet") {
    return (
      <ScreenWalletHome
        vcs={vcs}
        onCreateVP={() => setScreen("createVP")}
        onNavigate={(target) => {
          if (target === "wallet") {
            setScreen("wallet");
          }

          if (target === "history") {
            setScreen("history");
          }

          if (target === "present") {
            setScreen("createVP");
          }

          if (target === "settings") {
            setScreen("settings");
          }

          if (target === "scanVC") {
            setSelectedIssuer(MOCK_ISSUERS[0]);
            setScreen("scanIssuerQR");
          }
        }}
        onOpenDetails={(vc) => {
          setSelectedCredential(vc);
          setScreen("credential-details");
        }}
      />
    );
  }

  // =========================================
  // USAGE HISTORY
  // =========================================

  if (screen === "history") {
    return (
      <ScreenUsageHistory
        onBack={() => setScreen("wallet")}
        onNavigate={handleNavigate}
      />
    );
  }

  // =========================================
  // CREDENTIAL DETAILS
  // =========================================

  if (screen === "credential-details") {
    return (
      <ScreenCredentialDetails
        vc={selectedCredential}
        onBack={() => setScreen("wallet")}
      />
    );
  }

  // =========================================
  // CREATE VP
  // =========================================

  if (screen === "createVP") {
    return (
      <ScreenCreateVP
        vcs={vcs}
        onNext={(sel) => {
          setSelectedVCs(sel);
          setScreen("disclosure");
        }}
        onCancel={() => setScreen("wallet")}
      />
    );
  }

  // =========================================
  // SELECTIVE DISCLOSURE
  // =========================================

  if (screen === "disclosure") {
    return (
      <ScreenSelectiveDisclosure
        selectedVCs={selectedVCs}
        onNext={(t) => {
          setToggles(t);
          setScreen("presentVP");
        }}
        onBack={() => setScreen("createVP")}
      />
    );
  }

  // =========================================
  // PRESENT VP
  // =========================================

  if (screen === "presentVP") {
    return (
      <>
        <ScreenPresentVP
          selectedVCs={selectedVCs}
          toggles={toggles}
          onBack={() => setScreen("wallet")}
          onSubmit={() => {
            setShowConsent(true);
          }}
        />

        <ConsentModal
          open={showConsent}
          requestor={{
            name: "SCB Bank",
            did: "did:scb:verifier:8821",
          }}
          purpose="ใช้เพื่อยืนยันรายได้สำหรับการสมัครสินเชื่อดิจิทัล"
          expiresIn="30 วัน"
          requestedFields={["ชื่อ-นามสกุล", "รายได้", "สถานะการทำงาน"]}
          onReject={() => {
            setShowConsent(false);
          }}
          onApprove={() => {
            setShowConsent(false);

            alert("Consent Approved: ข้อมูลถูกแชร์สำเร็จ");

            setScreen("wallet");
          }}
        />
      </>
    );
  }

  return null;
}