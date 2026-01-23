export default function ConfirmBackModal({
  isOpen,
  onClose,
  onHome,
  onSettings,
  title = "Leave this game?",
  description = "You can return to settings or go back to the home page.",
}: {
  isOpen: boolean;
  onClose: () => void;
  onHome?: () => void;
  onSettings?: () => void;
  title?: string;
  description?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-base-100 text-base-content rounded-lg p-8 z-10 w-11/12 max-w-lg shadow-lg relative">
        <button
          aria-label="Close"
          className="absolute top-3 right-3 btn btn-ghost btn-sm"
          onClick={onClose}
        >
          ×
        </button>

        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="mb-6 text-sm opacity-80">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="btn bg-accent text-accent-content"
            onClick={() => {
              onClose();
              if (onHome) onHome();
            }}
          >
            Back to Home
          </button>
          <button
            className="btn bg-accent text-accent-content"
            onClick={() => {
              onClose();
              if (onSettings) onSettings();
            }}
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
}
