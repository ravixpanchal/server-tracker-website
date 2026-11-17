export default function TerminalPanel({ title, action, className = '', children }) {
  return (
    <div className={`log-console flex flex-col overflow-hidden rounded-2xl border border-indigo-900/40 font-mono text-[10px] sm:text-xs ${className}`}>
      <div className="flex h-9 shrink-0 items-center justify-between gap-3 border-b border-indigo-900/30 bg-[#182461] px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div aria-hidden="true" className="flex shrink-0 gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500" />
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span className="size-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="ml-2 truncate font-bold text-slate-300">{title}</div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
