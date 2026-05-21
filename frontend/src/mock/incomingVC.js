export const INCOMING_VC = {
    id: "vc-new",

    type: "เอกสารประวัติการทำงาน",

    issuer: "บริษัท Fastwork จำกัด",

    issuerDID: "did:example:fastwork123",

    issuerVerified: true,

    expiry: "2026-10-01",

    autoFields: [
        {
            key: "full_name",
            label: "ชื่อ-นามสกุล",
            description: "ชื่อเต็มของฟรีแลนซ์",
        },

        {
            key: "kyc_level",
            label: "ระดับ KYC",
            description: "ระดับการยืนยันตัวตน",
        },

        {
            key: "aml_status",
            label: "สถานะ AML",
            description: "สถานะการตรวจสอบบัญชีดำ",
        },

        {
            key: "tax_filing_status",
            label: "สถานะการยื่นภาษี",
            description: "สถานะการยื่นภาษี",
        },
    ],

    selectableFields: [
        {
            key: "national_id",
            label: "เลขบัตรประชาชน",
            description: "หมายเลขบัตรประชาชน",
        },

        {
            key: "average_monthly_income",
            label: "รายได้เฉลี่ยต่อเดือน",
            description: "รายได้เฉลี่ยย้อนหลัง 12 เดือน",
        },

        {
            key: "income_period_months",
            label: "ช่วงเวลาคำนวณรายได้",
            description: "ระยะเวลาที่ใช้คำนวณรายได้",
        },

        {
            key: "platform_name",
            label: "ชื่อแพลตฟอร์ม",
            description: "ชื่อแพลตฟอร์ม",
        },

        {
            key: "income_hash",
            label: "Income Hash",
            description: "แฮชธุรกรรมยืนยันข้อมูล",
        },

        {
            key: "completed_jobs",
            label: "จำนวนงานที่สำเร็จ",
            description: "จำนวนงานที่ทำเสร็จสมบูรณ์",
        },

        {
            key: "average_rating",
            label: "คะแนนเฉลี่ย",
            description: "คะแนนเฉลี่ยจากลูกค้า",
        },

        {
            key: "work_consistency_score",
            label: "คะแนนความสม่ำเสมอ",
            description: "คะแนนวัดความสม่ำเสมอ",
        },

        {
            key: "income_bracket",
            label: "ช่วงรายได้",
            description: "ช่วงรายได้ต่อปี",
        },

        {
            key: "tax_year",
            label: "ปีภาษี",
            description: "ปีภาษีอ้างอิง",
        },
    ],
};