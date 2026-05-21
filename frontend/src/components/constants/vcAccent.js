export const TYPE_ACCENT = {
    "Income VC": "from-blue-600 to-blue-700",

    "KYC VC": "from-violet-600 to-violet-700",

    "Tax VC": "from-slate-500 to-slate-600",

    "Work History VC": "from-indigo-600 to-indigo-700",
};

export function getAccent(type) {
    return TYPE_ACCENT[type] || "from-blue-600 to-blue-700";
}