import emailjs from 'emailjs-com'

const SERVICE_ID = 'your_service_id'
const TEMPLATE_ID = 'your_template_id'
const PUBLIC_KEY = 'your_public_key'

export async function sendEmailReminder(
  toEmail: string,
  taskTitle: string,
  deadline: string
) {
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      task: taskTitle,
      deadline,
      to_email: toEmail,
    },
    PUBLIC_KEY
  )
}
