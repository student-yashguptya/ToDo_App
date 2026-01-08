import { format } from 'date-fns'

export const formatDateTime = (date: string) =>
  format(new Date(date), 'dd MMM yyyy, hh:mm a')
