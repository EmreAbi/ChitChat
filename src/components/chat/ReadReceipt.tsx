interface ReadReceiptProps {
  status: 'sent' | 'delivered' | 'read'
}

export default function ReadReceipt({ status }: ReadReceiptProps) {
  const color = status === 'read' ? 'text-tick-blue' : 'text-gray-400'

  if (status === 'sent') {
    return (
      <svg className={`w-4 h-4 ${color} inline-block`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 8.5l3 3 5-6" />
      </svg>
    )
  }

  // Double tick for delivered / read
  return (
    <svg className={`w-4 h-4 ${color} inline-block`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8.5l3 3 5-6" />
      <path d="M5 8.5l3 3 5-6" />
    </svg>
  )
}
