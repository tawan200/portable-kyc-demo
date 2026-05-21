export default function TopBar({ title, subtitle, actions }) {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
          {subtitle}
        </p>

        <h1 className="text-gray-900 font-bold text-lg leading-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <button className="relative w-8 h-8 flex items-center justify-center rounded-sm bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
        </button>
      </div>
    </header>
  );
}
