export function calculateHalfwayTime(created: Date, deadline: Date): Date {
  return new Date((created.getTime() + deadline.getTime()) / 2)
}
