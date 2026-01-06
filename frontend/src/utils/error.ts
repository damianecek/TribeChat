/**
 * Extracts a readable error message from various error types
 * @param err - The error object
 * @returns Formatted error message string
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err) || String(err)
  } catch {
    return String(err)
  }
}
