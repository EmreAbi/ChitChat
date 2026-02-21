export default function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Yukleniyor">
      <div className="w-8 h-8 border-[3px] border-whatsapp-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
