/**
 * UI-level validation for license forms.
 * Backend is the final authority; this provides quick UX feedback.
 */

const MAX_USER_ACCESS = 100_000
const MIN_USER_ACCESS = 1
const MAX_TEXT_LENGTH = 500
const MAX_PRODUCT_NAME = 100

export function validateUserAccess(value: number): string | null {
  if (typeof value !== 'number' || isNaN(value)) return 'Must be a number'
  if (value < MIN_USER_ACCESS) return `Minimum ${MIN_USER_ACCESS}`
  if (value > MAX_USER_ACCESS) return `Maximum ${MAX_USER_ACCESS}`
  return null
}

export function sanitizeText(value: string, maxLen = MAX_TEXT_LENGTH): string {
  return String(value ?? '')
    .slice(0, maxLen)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim()
}

export function validateProductName(value: string): string | null {
  const s = sanitizeText(value, MAX_PRODUCT_NAME)
  if (!s) return 'Product name is required'
  return null
}

export function validateCompanyId(value: string): string | null {
  if (!value || !String(value).trim()) return 'Company is required'
  return null
}
