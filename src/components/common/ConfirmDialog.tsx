interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, destructive }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-[#0f1f18] rounded-3xl border border-stroke-soft shadow-2xl p-6 mx-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-text-primary mb-2 mono-ui">{title}</h3>
        <p className="text-sm text-text-muted mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#13261d] border border-stroke-soft text-text-muted hover:bg-[#183329] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              destructive
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-whatsapp-green text-[#06110d] hover:bg-[#72ffb4]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
