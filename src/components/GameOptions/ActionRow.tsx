import BackButton from "../BackButton/BackButton";

interface Props {
  onBack?: () => void;
  onConfirm?: () => void;
}

export default function ActionRow({ onBack, onConfirm }: Props) {
  return (
    <div className="flex gap-3">
      <BackButton className="btn-ghost" onBack={onBack} />
      <button
        className="btn btn-primary ml-auto font-semibold border-base-content"
        onClick={onConfirm}
      >
        Continue
      </button>
    </div>
  );
}
