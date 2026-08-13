interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-sm rounded-t-[28px] bg-paper p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl sm:rounded-[28px] sm:pb-5 dark:bg-ink-600">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-400/25 sm:hidden" />
        <h2 id="confirm-dialog-title" className="text-lg font-bold tracking-tight text-ink-900 dark:text-cream-100">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-400">{description}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-ink-400/25 py-3 text-sm font-semibold text-ink-600 active:scale-[0.98] dark:text-cream-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-full py-3 text-sm font-semibold text-white shadow-lg active:scale-[0.98] ${
              destructive ? 'bg-red-600 shadow-red-600/25' : 'bg-forest-500 shadow-forest-500/25'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
