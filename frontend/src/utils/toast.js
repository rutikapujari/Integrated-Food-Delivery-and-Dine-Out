import toast from 'react-hot-toast'

export const notify = {
  success: (msg) =>
    toast.success(msg, {
      style: { background: '#FFF7ED', color: '#0F172A', border: '1px solid #FCEAE1' },
      iconTheme: { primary: '#16A34A', secondary: '#FFF' },
      duration: 3000,
    }),
  error: (msg) =>
    toast.error(msg, {
      style: { background: '#FFF7ED', color: '#0F172A', border: '1px solid #FCEAE1' },
      iconTheme: { primary: '#DC2626', secondary: '#FFF' },
      duration: 4000,
    }),
  loading: (msg) =>
    toast.loading(msg, {
      style: { background: '#FFF7ED', color: '#0F172A' },
    }),
  dismiss: (id) => toast.dismiss(id),
}
