import { CheckCircle2, XCircle } from 'lucide-react'
import './Toast.css'

export default function Toast({ message, type }) {
  if (!message) return null
  return (
    <div className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'}`}>
      {type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
      <span>{message}</span>
    </div>
  )
}