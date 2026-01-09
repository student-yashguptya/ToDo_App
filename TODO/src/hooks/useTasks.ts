/**
 * ⚠️ IMPORTANT
 * This file is intentionally a SAFE ALIAS.
 *
 * The real task logic lives in:
 * → src/context/TaskContext.tsx
 *
 * This prevents:
 * - duplicate sources of truth
 * - broken timers
 * - AsyncStorage corruption
 *
 * DO NOT add logic here.
 */

export { useTasks } from '../context/TaskContext'
