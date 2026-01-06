import type { UserStatus } from 'src/types/user'

/**
 * Returns the color associated with a user status
 * @param status - The user status
 * @returns Color string for the status
 */
export function getStatusColor(status: UserStatus): string {
  switch (status) {
    case 'Online':
      return 'limegreen'
    case 'Away':
      return 'gold'
    case 'DND':
      return 'orangered'
    case 'Offline':
      return 'gray'
    default:
      return 'lightgray'
  }
}
