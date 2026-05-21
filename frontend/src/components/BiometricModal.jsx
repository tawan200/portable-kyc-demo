import { Btn } from "../components/index";

export default function BiometricModal({
  onConfirm,
  onCancel,
  action = "ยอมรับเอกสารรับรอง",
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-md shadow-2xl p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v1h-4v-1zm-2 0a4 4 0 014-4v0a4 4 0 014 4v1h1a1 1 0 011 1v6a1 1 0 01-1 1H8a1 1 0 01-1-1v-6a1 1 0 011-1h1v-1z"
              />
            </svg>
          </div>

          <div className="text-center">
            <p className="font-bold text-gray-900 text-base">
              ยืนยันตัวตนด้วยไบโอเมตริกซ์
            </p>

            <p className="text-sm text-gray-500 mt-1">{action}</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mb-6">
          ใช้ Face ID หรือสแกนลายนิ้วมือเพื่อยืนยันการดำเนินการอย่างปลอดภัย
        </p>

        <div className="flex flex-col gap-2.5">
          <Btn onClick={onConfirm} className="w-full justify-center py-3">
            ยืนยันด้วยไบโอเมตริกซ์
          </Btn>

          <Btn
            onClick={onCancel}
            variant="secondary"
            className="w-full justify-center py-3"
          >
            ยกเลิก
          </Btn>
        </div>
      </div>
    </div>
  );
}
