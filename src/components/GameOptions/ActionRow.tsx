import BackButton from "../BackButton/BackButton";

interface Props {
  onBack?: () => void;
  onConfirm?: () => void;
}

export default function ActionRow({ onBack, onConfirm }: Props) {
  return (
    <div className="px-6 pb-6 flex gap-3">
      <BackButton className="btn-ghost" onBack={onBack} />
      <button className="btn btn-primary ml-auto" onClick={onConfirm}>
        Continue
      </button>
    </div>
  );
}
