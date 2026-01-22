import React from "react";

interface BackButtonProps {
  onBack?: () => void;
  requireConfirm?: boolean;
  confirmMessage?: string;
  className?: string;
  label?: string;
  children?: React.ReactNode;
}

export default function BackButton({
  onBack,
  requireConfirm = false,
  confirmMessage = "Are you sure you want to go back? Unsaved progress may be lost.",
  className = "",
  label,
  children,
}: BackButtonProps) {
  const handleClick = () => {
    if (requireConfirm) {
      if (window.confirm(confirmMessage)) onBack?.();
    } else {
      onBack?.();
    }
  };

  return (
    <button
      type="button"
      aria-label={label ?? "Go back"}
      className={`btn bg-base-100 ${className}`}
      onClick={handleClick}
    >
      {children ?? label ?? "Back"}
    </button>
  );
}
