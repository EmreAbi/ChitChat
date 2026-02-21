interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <span className="text-5xl mb-4 drop-shadow-[0_0_12px_rgba(65,243,154,0.24)]">{icon}</span>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-xs leading-relaxed">{description}</p>
    </div>
  )
}
