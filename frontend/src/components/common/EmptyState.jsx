import Button from './Button'

/**
 * EmptyState — Placeholder shown when a list or section has no data.
 *
 * Props:
 *   icon: PhosphorIcon      — duotone icon
 *   title: string           — main heading
 *   description: string     — supporting text
 *   action?: { label: string, onClick: () => void }  — optional CTA button
 */
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon className="w-16 h-16 text-border mb-4" weight="duotone" />
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}

export default EmptyState