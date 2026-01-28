import type { GameMode } from "../../constants/gameModes";

interface Props {
  options: GameMode[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function ModeTabs({ options, selected, onSelect }: Props) {
  return (
    <div className="bg-base-200 border-b overflow-x-auto overscroll-x-contain scrollbar-hidden rounded-t-lg">
      <div className="flex min-w-full gap-0 m-0 p-0 sm:px-0 py-0 touch-pan-x">
        {options.map((o, i) => {
          const isFirst = i === 0;
          const isLast = i === options.length - 1;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id)}
              className={`flex-1 px-4 py-3 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                selected === o.id ? "bg-accent" : "hover:bg-base-100/50"
              } ${isFirst ? "rounded-tl-lg" : ""} ${isLast ? "rounded-tr-lg" : ""}`}
              aria-pressed={selected === o.id}
            >
              {o.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
