import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../common/Button'
import Input from '../common/Input'
import { Question } from '../../utils/icons'

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
})

const categories = ['Order Issue', 'Account', 'Payment', 'Restaurant', 'Other']

function TicketForm({ onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: '', category: '', description: '' },
  })

  const handleFormSubmit = async (data) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white border border-border rounded-[var(--radius-lg)] p-6 space-y-4">
      <h3 className="font-semibold text-lg">Create New Ticket</h3>

      <Input
        label="Subject"
        placeholder="Brief summary of your issue"
        icon={Question}
        error={errors.subject?.message}
        disabled={loading}
        register={register('subject')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">Category</label>
        <select
          className="w-full h-11 px-4 rounded-[var(--radius-sm)] border border-border bg-white text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-60"
          disabled={loading}
          {...register('category')}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">Description</label>
        <textarea
          rows={5}
          placeholder="Describe your issue in detail..."
          className="w-full px-4 py-3 rounded-[var(--radius-sm)] border border-border bg-white text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none disabled:opacity-60"
          disabled={loading}
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <Button type="submit" loading={loading}>Submit Ticket</Button>
    </form>
  )
}

export default TicketForm
