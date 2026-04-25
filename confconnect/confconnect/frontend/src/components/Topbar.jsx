export default function Topbar({ title, subtitle, children }) {
  return (
    <header className="bg-white border-b border-gray-200 px-7 h-16 flex items-center justify-between sticky top-0 z-40">
      <div>
        <p className="text-xs text-gray-400">ConfConnect › <span className="text-navy font-medium">{title}</span></p>
        <h1 className="text-xl font-bold text-[#0f2156] leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </header>
  );
}
