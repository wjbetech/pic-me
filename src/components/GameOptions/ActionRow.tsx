import BackButton from "../BackButton/BackButton";

interface Props {
  onBack?: () => void;
  onConfirm?: () => void;
}

export default function ActionRow({ onBack, onConfirm }: Props) {
  return (
    <div className="flex gap-3">
      <BackButton className="btn-ghost" onBack={onBack} />
      <button className="btn-pop ml-auto min-h-12 px-7 text-base" onClick={onConfirm}>
        Continue
      </button>
    </div>
  );
}
