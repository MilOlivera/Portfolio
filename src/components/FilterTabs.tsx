// Terminal-style toggle buttons shared by Projects and Timeline.
// Horizontal overflow scrolls inside the bar, never the page.
export default function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="scrollbar-hide -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="group" aria-label={label} className="flex w-max gap-2">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt)}
              className={`rounded-sm border px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-colors ${
                active
                  ? "border-green bg-green/10 text-green"
                  : "border-border-strong bg-bg-elev text-text-mute hover:border-green hover:text-text"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
