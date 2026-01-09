import { format } from 'date-fns'

export const formatDateTime = (date: number | string | Date) =>
  format(new Date(date), 'dd MMM yyyy, hh:mm a')
