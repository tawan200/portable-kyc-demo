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

// ─── โครงสร้างหลักของหน้า (LAYOUT SHELL) ───────────────────────────────────
function Shell({ children, active, onNavigate }) {
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <Sidebar active={active} onNavigate={onNavigate} />

      {/* เนื้อหาหลัก */}
      <div className="lg:ml-60 min-w-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}

// ─── หน้ารับ VC ───────────────────────────────────────────────────────────────
function ScreenReceiveVC({ onAccept, onReject }) {
  const [showBiometric, setShowBiometric] = useState(false);
  const vc = INCOMING_VC;

  return (
    <Shell active="wallet" onNavigate={() => {}}>

      <TopBar
        title="เอกสารรับรองที่ได้รับ"
        subtitle="คำขอรับเอกสารรับรอง"
      />

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">

        {/* แถบแจ้งข้อมูล */}
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
            ผู้ออกเอกสารกำลังส่งคำขอเพื่อจัดเก็บเอกสารรับรองลงในกระเป๋าดิจิทัลของคุณ
            กรุณาตรวจสอบข้อมูลที่จะถูกจัดเก็บก่อนกดยอมรับ
          </p>
        </div>

        {/* ส่วนหัวของ Credential */}
        <Panel className="overflow-hidden mb-5">

          <div className={`h-1 bg-gradient-to-r ${getAccent(vc.type)}`} />

          <div className="p-6">

            <div className="flex items-start justify-between mb-5">
              <TypeBadge type={vc.type} />
              <TrustBadge verified={vc.issuerVerified} />
            </div>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">
                  ผู้ออกเอกสาร
                </p>

                <p className="text-gray-900 font-bold">
                  {vc.issuer}
                </p>

                <p className="text-gray-400 text-xs font-mono mt-1 truncate">
                  {vc.issuerDID}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">
                  วันหมดอายุ
                </p>

                <p className="text-gray-900 font-bold">
                  {vc.expiry}
                </p>
              </div>
            </div>
          </div>
        </Panel>

        {/* ข้อมูลที่จะถูกจัดเก็บ */}
        <p className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-3">
          ข้อมูลที่จะถูกจัดเก็บในกระเป๋าดิจิทัลของคุณ
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

          {/* ฟิลด์ที่ถูกส่งอัตโนมัติ */}
          <Panel className="overflow-hidden">

            <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center gap-2">

              <div className="w-2 h-2 rounded-full bg-gray-400" />

              <p className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                ข้อมูลที่ส่งอัตโนมัติ
              </p>

              <span className="ml-auto text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                sd: false
              </span>
            </div>

            <div className="px-4 py-1">

              <p className="text-gray-400 text-xs py-2 border-b border-gray-50">
                ข้อมูลส่วนนี้จะถูกแนบเสมอ และไม่สามารถเลือกเปิดเผยเฉพาะบางรายการได้
              </p>

              {vc.autoFields.map((f) => (
                <div
                  key={f.key}
                  className="py-2.5 border-b border-gray-50 last:border-0"
                >

                  <div className="flex items-start justify-between gap-2">

                    <div>
                      <p className="text-gray-900 text-sm font-semibold">
                        {f.label}
                      </p>

                      <p className="text-gray-400 text-xs mt-0.5">
                        {f.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">
                      {f.key}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* ฟิลด์ที่ผู้ถือเลือกเปิดเผยได้ */}
          <Panel className="overflow-hidden">

            <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center gap-2">

              <div className="w-2 h-2 rounded-full bg-blue-500" />

              <p className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                ข้อมูลที่ผู้ถือเลือกเปิดเผยได้
              </p>

              <span className="ml-auto text-[10px] text-blue-600 font-mono bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                sd: true
              </span>
            </div>

            <div className="px-4 py-1">

              <p className="text-gray-400 text-xs py-2 border-b border-gray-50">
                คุณสามารถเลือกได้ว่าจะเปิดเผยข้อมูลใดบ้างในแต่ละครั้งที่นำเสนอข้อมูล
              </p>

              {vc.selectableFields.map((f) => (
                <div
                  key={f.key}
                  className="py-2.5 border-b border-gray-50 last:border-0"
                >

                  <div className="flex items-start justify-between gap-2">

                    <div>
                      <p className="text-gray-900 text-sm font-semibold">
                        {f.label}
                      </p>

                      <p className="text-gray-400 text-xs mt-0.5">
                        {f.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">
                      {f.key}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* หมายเหตุด้านความเป็นส่วนตัว */}
        <Panel className="p-4 mb-6">

          <div className="flex items-start gap-3">

            <svg
              className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0"
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

            <p className="text-gray-600 text-sm">
              คุณสามารถควบคุมข้อมูลที่ถูกเปิดเผยจากเอกสารรับรองนี้ได้เอง
              โดยข้อมูลที่เลือกเปิดเผยได้จะถูกแชร์ก็ต่อเมื่อคุณอนุญาตเท่านั้น
            </p>
          </div>
        </Panel>

        {/* ปุ่มดำเนินการ */}
        <div className="flex items-center gap-3">

          <Btn
            onClick={() => setShowBiometric(true)}
            className="py-3 px-8"
          >
            ยอมรับและบันทึกลง Wallet
          </Btn>

          <Btn
            onClick={onReject}
            variant="danger"
            className="py-3 px-6"
          >
            ปฏิเสธ
          </Btn>
        </div>
      </div>

      {/* โมดอลยืนยันตัวตน */}
      {showBiometric && (
        <BiometricModal
          action="ยอมรับและบันทึกเอกสารลง Wallet"
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
function ScreenWalletHome({ vcs, onCreateVP, onNavigate }) {
  const [activeTab, setActiveTab] = useState("wallet");

  const validCount = vcs.filter((v) => v.status === "valid").length;

  const expiringCount = vcs.filter(
    (v) => v.status === "expiring"
  ).length;

  const handleNav = (tab) => {
    setActiveTab(tab);

    if (tab === "present") {
      onCreateVP();
    }
  };

  return (
    <Shell active={activeTab} onNavigate={handleNav}>

      <TopBar
        title="กระเป๋าเอกสารรับรอง"
        subtitle="แดชบอร์ดผู้ถือเอกสาร"
        actions={
          <Btn
            onClick={onCreateVP}
            className="py-2 px-4 text-xs"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>

            สร้าง VP
          </Btn>
        }
      />

      <div className="p-6 max-w-6xl mx-auto w-full">

        {/* สถิติ */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          {[
            {
              label: "เอกสารทั้งหมด",
              value: vcs.length,
              color: "text-gray-900",
            },
            {
              label: "ใช้งานได้",
              value: validCount,
              color: "text-emerald-700",
            },
            {
              label: "ใกล้หมดอายุ",
              value: expiringCount,
              color: "text-amber-700",
            },
          ].map((s) => (
            <Panel
              key={s.label}
              className="px-5 py-4"
            >
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">
                {s.label}
              </p>

              <p className={`text-2xl font-bold ${s.color}`}>
                {s.value}
              </p>
            </Panel>
          ))}
        </div>

        {/* แถบสถานะความปลอดภัย */}
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-sm px-4 py-2.5 flex items-center gap-3">

          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

          <p className="text-emerald-700 text-xs font-semibold">
            Wallet ปลอดภัย — DID ได้รับการยืนยัน · เอกสารทั้งหมดมีการเข้ารหัสครบถ้วน
          </p>

          <span className="ml-auto text-gray-400 text-xs font-mono">
            did:example:holder001
          </span>
        </div>

        {/* ส่วนแสดงรายการ Credential */}
        <div className="flex items-center justify-between mb-4">

          <h2 className="text-gray-900 font-bold text-xs uppercase tracking-widest">
            เอกสารรับรองของฉัน
          </h2>

          <span className="text-gray-400 text-xs">
            {vcs.length} เอกสาร
          </span>
        </div>

        {vcs.length === 0 ? (
          <Panel className="p-16 flex flex-col items-center justify-center text-center">

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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
              </svg>
            </div>

            <p className="font-bold text-gray-500">
              ยังไม่มีเอกสารรับรอง
            </p>

            <p className="text-gray-400 text-sm mt-1">
              เอกสารรับรองที่ออกให้คุณจะแสดงที่นี่
            </p>
          </Panel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {vcs.map((vc) => (
              <VCCard
                key={vc.id}
                vc={vc}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

// ─── หน้าสร้าง VP ───────────────────────────────────────────────────────────
function ScreenCreateVP({
  vcs,
  onNext,
  onCancel,
}) {
  const [selected, setSelected] = useState([]);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );

  return (
    <Shell active="present" onNavigate={() => {}}>

      <TopBar
        title="สร้าง Presentation"
        subtitle="Verifiable Presentation"
        actions={
          <Btn onClick={onCancel} variant="ghost">
            ← ยกเลิก
          </Btn>
        }
      />

      <div className="p-6 max-w-5xl mx-auto w-full">

        {/* ข้อมูลผู้ร้องขอ */}
        <Panel className="p-5 mb-6">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">
                ร้องขอโดย
              </p>

              <p className="text-gray-900 font-bold text-base">
                {VERIFIER_INFO.name}
              </p>

              <p className="text-gray-400 text-xs font-mono mt-0.5">
                {VERIFIER_INFO.did}
              </p>
            </div>

            <TrustBadge verified={true} />
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4 flex items-center gap-4">

            <div>
              <p className="text-gray-400 text-xs mb-1">
                วัตถุประสงค์
              </p>

              <p className="text-gray-700 text-sm">
                {VERIFIER_INFO.purpose}
              </p>
            </div>

            <div className="ml-auto flex gap-2">
              {VERIFIER_INFO.requestedTypes.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          </div>
        </Panel>

        {/* เลือก Credential */}
        <h2 className="text-gray-900 font-bold text-xs uppercase tracking-widest mb-3">
          เลือกเอกสารรับรองที่ต้องการแนบ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">

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

        {/* ปุ่มดำเนินการ */}
        <div className="flex items-center gap-4">

          <Btn
            disabled={selected.length === 0}
            onClick={() =>
              onNext(
                vcs.filter((v) =>
                  selected.includes(v.id)
                )
              )
            }
            className="py-3 px-8"
          >
            ถัดไป: เลือกข้อมูล →
          </Btn>

          {selected.length > 0 && (
            <span className="text-blue-700 text-sm font-medium">
              เลือกแล้ว {selected.length} เอกสาร
            </span>
          )}
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

  const flip = (vcId, key, required) => {
    if (required) return;

    setToggles((prev) => ({
      ...prev,
      [`${vcId}-${key}`]: !prev[`${vcId}-${key}`],
    }));
  };

  return (
    <Shell active="present" onNavigate={() => {}}>
      <TopBar
        title="เลือกข้อมูลที่ต้องการแชร์"
        subtitle="Selective Disclosure"
        actions={
          <Btn onClick={onBack} variant="ghost">
            ← กลับ
          </Btn>
        }
      />

      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="mb-5 bg-gray-100 border border-gray-200 rounded-sm px-4 py-3 flex items-start gap-3">
          <svg
            className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0"
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

          <p className="text-gray-600 text-sm">
            เปิดหรือปิดข้อมูลเพิ่มเติมเพื่อควบคุมความเป็นส่วนตัวของคุณ
            โดยข้อมูลที่จำเป็นจะถูกแชร์เสมอ
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {selectedVCs.map((vc) => {
            const disclosed = vc.fields.filter(
              (f) => toggles[`${vc.id}-${f.key}`],
            );

            const hidden = vc.fields.filter(
              (f) =>
                !toggles[`${vc.id}-${f.key}`] && !f.required,
            );

            return (
              <Panel key={vc.id} className="overflow-hidden">
                <div
                  className={`h-0.5 bg-gradient-to-r ${getAccent(vc.type)}`}
                />

                <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <TypeBadge type={vc.type} />

                    <p className="text-gray-900 font-semibold text-sm mt-2">
                      {vc.issuer}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-emerald-700 text-xs font-semibold">
                      แชร์ {disclosed.length} รายการ
                    </p>

                    {hidden.length > 0 && (
                      <p className="text-gray-400 text-xs">
                        ซ่อน {hidden.length} รายการ
                      </p>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {vc.fields.map((f) => {
                    const k = `${vc.id}-${f.key}`;
                    const on = toggles[k];

                    return (
                      <div
                        key={f.key}
                        className="flex items-center px-5 py-3.5 gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold transition-colors ${
                              on
                                ? "text-gray-900"
                                : "text-gray-300"
                            }`}
                          >
                            {f.label}
                          </p>

                          <p
                            className={`text-xs mt-0.5 truncate font-mono transition-colors ${
                              on
                                ? "text-gray-500"
                                : "text-gray-300"
                            }`}
                          >
                            {f.value}
                          </p>
                        </div>

                        {f.required ? (
                          <span className="text-xs text-gray-400 italic flex-shrink-0 border border-gray-200 px-2 py-0.5 rounded-sm">
                            จำเป็น
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              flip(vc.id, f.key, f.required)
                            }
                            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                              on
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                on
                                  ? "translate-x-5"
                                  : "translate-x-0.5"
                              }`}
                            />
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
          <Btn
            onClick={() => onNext(toggles)}
            className="py-3 px-8"
          >
            ถัดไป: ตรวจสอบและส่ง →
          </Btn>

          <Btn
            onClick={onBack}
            variant="secondary"
            className="py-3 px-6"
          >
            กลับ
          </Btn>
        </div>
      </div>
    </Shell>
  );
}

// ─── SCREEN: PRESENT VP ───────────────────────────────────────────────────────

function ScreenPresentVP({ selectedVCs, toggles, onBack }) {
  const [showBiometric, setShowBiometric] = useState(false);
  const [sent, setSent] = useState(false);

  const getDisclosed = (vc) =>
    vc.fields.filter((f) => toggles[`${vc.id}-${f.key}`]);

  const getHiddenCount = (vc) =>
    vc.fields.filter(
      (f) =>
        !toggles[`${vc.id}-${f.key}`] && !f.required,
    ).length;

  const totalHidden = selectedVCs.reduce(
    (sum, vc) => sum + getHiddenCount(vc),
    0,
  );

  if (sent) {
    return (
      <Shell active="present" onNavigate={() => {}}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
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

            <h2 className="text-gray-900 text-2xl font-bold mb-2">
              ส่ง Presentation สำเร็จ
            </h2>

            <p className="text-gray-500 text-sm mb-1">
              Credential ของคุณถูกส่งอย่างปลอดภัยไปยัง{" "}
              {VERIFIER_INFO.name}
            </p>

            <p className="text-gray-400 text-xs mb-8 font-mono">
              {new Date().toLocaleString()}
            </p>

            <Panel className="p-4 text-left mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">
                ส่งไปยัง
              </p>

              <p className="text-gray-900 font-bold">
                {VERIFIER_INFO.name}
              </p>

              <p className="text-gray-400 text-xs font-mono mt-0.5 truncate">
                {VERIFIER_INFO.did}
              </p>
            </Panel>

            {sessionStorage.getItem("verifier_request") ? (
              <Btn
                onClick={() => {
                  window.location.href = "/verifier";
                }}
                className="py-3 px-8"
              >
                กลับไปที่ Verifier →
              </Btn>
            ) : (
              <Btn
                onClick={onBack}
                className="py-3 px-8"
              >
                กลับไปยัง Wallet
              </Btn>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell active="present" onNavigate={() => {}}>
      <TopBar
        title="ตรวจสอบและส่ง"
        subtitle="ยืนยันการนำเสนอข้อมูล"
        actions={
          <Btn onClick={onBack} variant="ghost">
            ← กลับ
          </Btn>
        }
      />

      <div className="p-6 max-w-4xl mx-auto w-full">
        <Panel className="p-5 mb-5">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">
            กำลังส่งไปยัง
          </p>

          <p className="text-gray-900 font-bold text-base">
            {VERIFIER_INFO.name}
          </p>

          <p className="text-gray-400 text-xs font-mono mt-0.5 truncate">
            {VERIFIER_INFO.did}
          </p>
        </Panel>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {selectedVCs.map((vc) => {
            const disclosed = getDisclosed(vc);
            const hidden = getHiddenCount(vc);

            return (
              <Panel key={vc.id} className="overflow-hidden">
                <div
                  className={`h-0.5 bg-gradient-to-r ${getAccent(vc.type)}`}
                />

                <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                  <TypeBadge type={vc.type} />

                  {hidden > 0 && (
                    <span className="text-xs text-gray-400">
                      ซ่อนข้อมูล {hidden} รายการ
                    </span>
                  )}
                </div>

                <div className="px-4 py-3">
                  <p className="text-gray-400 text-xs mb-2 font-semibold">
                    {vc.issuer}
                  </p>

                  <div className="space-y-2">
                    {disclosed.map((f) => (
                      <div
                        key={f.key}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-500 text-sm">
                          {f.label}
                        </span>

                        <span className="text-gray-900 text-sm font-semibold">
                          {f.value}
                        </span>
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
            <svg
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>

            <span className="text-gray-600 text-sm">
              มีข้อมูลถูกซ่อนทั้งหมด {totalHidden} รายการ —
              ผู้ตรวจสอบจะไม่สามารถเห็นข้อมูลเหล่านี้ได้
            </span>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 flex items-start gap-3 mb-6">
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>

          <p className="text-blue-700 text-sm">
            Presentation นี้จะถูกลงลายเซ็นดิจิทัลด้วย DID
            ของคุณก่อนส่งข้อมูล
          </p>
        </div>

        <div className="flex gap-3">
          <Btn
            onClick={() => setShowBiometric(true)}
            className="py-3 px-8"
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

            ส่ง Presentation
          </Btn>

          <Btn
            onClick={onBack}
            variant="secondary"
            className="py-3 px-6"
          >
            กลับ
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
                submittedVCTypes: selectedVCs.map(
                  (vc) => vc.type,
                ),
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

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("receive");
  const [vcs, setVCs] = useState(MOCK_VCS);
  const [selectedVCs, setSelectedVCs] = useState([]);
  const [toggles, setToggles] = useState({});

  useEffect(() => {
    const reqStr = sessionStorage.getItem("verifier_request")
    if (!reqStr) return
    const req = JSON.parse(reqStr)
    const typeStrings = [...(req.requiredTypes || []), ...(req.consentTypes || [])]
      .map(k => VC_KEY_TO_TYPE[k]).filter(Boolean)
    const matched = MOCK_VCS.filter(vc => typeStrings.includes(vc.type))
    if (matched.length > 0) {
      setSelectedVCs(matched)
      setScreen("disclosure")
    }
  }, []);

  if (screen === "receive") return <ScreenReceiveVC onAccept={() => { setVCs((p) => [...p, { ...INCOMING_VC, status: "valid", summary: "Work · Senior Dev", fields: [...INCOMING_VC.autoFields.map(f => ({...f, value: "—", required: true})), ...INCOMING_VC.selectableFields.map(f => ({...f, value: "—", required: false}))] }]); setScreen("wallet"); }} onReject={() => setScreen("wallet")} />;
  if (screen === "wallet") return <ScreenWalletHome vcs={vcs} onCreateVP={() => setScreen("createVP")} onNavigate={() => {}} />;
  if (screen === "createVP") return <ScreenCreateVP vcs={vcs} onNext={(sel) => { setSelectedVCs(sel); setScreen("disclosure"); }} onCancel={() => setScreen("wallet")} />;
  if (screen === "disclosure") return <ScreenSelectiveDisclosure selectedVCs={selectedVCs} onNext={(t) => { setToggles(t); setScreen("presentVP"); }} onBack={() => setScreen("createVP")} />;
  if (screen === "presentVP") return <ScreenPresentVP selectedVCs={selectedVCs} toggles={toggles} onBack={() => setScreen("wallet")} />;
  return null;
}