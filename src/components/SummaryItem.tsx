type SummaryItemProps = {
  value: string
  label: string
}

export function SummaryItem({ value, label }: SummaryItemProps) {
  return (
    <div className="summary-item">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}
