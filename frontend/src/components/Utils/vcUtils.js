export function getAccent(type) {
  switch (type) {

    case "เอกสารรับรองรายได้":
      return "from-blue-600 to-cyan-500";

    case "เอกสารยืนยันตัวตน (KYC)":
      return "from-violet-600 to-fuchsia-500";

    case "เอกสารภาษี":
      return "from-emerald-600 to-lime-500";

    case "เอกสารประวัติการทำงาน":
      return "from-amber-500 to-orange-500";

    default:
      return "from-slate-500 to-slate-600";
  }
}