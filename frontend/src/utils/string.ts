/**
 * Truncates a string to a maximum length and adds ellipsis
 * @param str - The string to truncate
 * @param max - Maximum length before truncation (default: 20)
 * @returns Truncated string with ellipsis if needed
 */
export function truncate(str: string, max: number = 20): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}
