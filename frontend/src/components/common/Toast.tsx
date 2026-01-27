interface ToastProps {
  message: string;
  onClose?: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div
      role="alert"
      className="fixed right-6 top-6 z-50 rounded-lg border border-red-400/60 bg-red-500/90 px-4 py-3 text-sm text-white shadow-lg backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold">Error</span>
        <span className="text-red-50/90">{message}</span>
        {onClose ? (
          <button
            onClick={onClose}
            className="ml-auto text-red-100/80 hover:text-white"
            aria-label="Dismiss"
          >
            x
          </button>
        ) : null}
      </div>
    </div>
  );
}
