import { useQuasar } from 'quasar'
import { useChannelActions } from './useChannelActions'
import { getErrorMessage } from 'src/utils'

/**
 * Composable for handling IRC-style commands
 */
export function useCommands() {
  const $q = useQuasar()
  
  const {
    addOrGetChannel,
    cancelActiveChannel,
    quitActiveChannel,
    inviteUserToChannel,
    kickUserFromChannel,
    listChannelMembers,
    revokeUserFromChannel,
  } = useChannelActions()

  /**
   * Executes a command from user input
   * @param input - The full command string (e.g., "/join general")
   * @returns true if command was handled, false otherwise
   */
  const executeCommand = (input: string): boolean => {
    const trimmed = input.trim()
    if (!trimmed.startsWith('/')) return false

    const parts = trimmed.slice(1).split(/\s+/)
    const cmd = parts[0]?.toLowerCase() ?? ''
    const args = parts.slice(1)

    switch (cmd) {
      case 'join':
        return handleJoin(args)

      case 'cancel':
        return handleCancel()

      case 'quit':
        return handleQuit()

      case 'invite':
        return handleInvite(args)

      case 'kick':
        return handleKick(args)

      case 'revoke':
        return handleRevoke(args)

      case 'list':
        return handleList()

      default:
        $q.notify({ type: 'warning', message: `Unknown command: /${cmd}` })
        return true
    }
  }

  const handleJoin = (args: string[]): boolean => {
    const isPrivate = args.includes('--private')
    const filteredArgs = args.filter((a) => a !== '--private')
    const channelName = filteredArgs.join(' ') || 'general'
    
    try {
      addOrGetChannel(channelName, !isPrivate)
    } catch (err) {
      const msg = getErrorMessage(err)
      $q.notify({ type: 'negative', message: `Join failed: ${msg}` })
    }
    return true
  }

  const handleCancel = (): boolean => {
    try {
      const result = cancelActiveChannel()
      if (!result) {
        $q.notify({ type: 'warning', message: 'No active channel to leave' })
      } else {
        $q.notify({ type: 'positive', message: `Left #${result.channelName}` })
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: getErrorMessage(err) })
    }
    return true
  }

  const handleQuit = (): boolean => {
    try {
      const result = quitActiveChannel()
      if (!result) {
        $q.notify({ type: 'warning', message: 'No active channel to quit' })
      } else {
        $q.notify({ type: 'positive', message: `Quit #${result.channelName}` })
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: getErrorMessage(err) })
    }
    return true
  }

  const handleInvite = (args: string[]): boolean => {
    const userId = args[0]
    if (!userId) {
      $q.notify({ type: 'warning', message: 'Usage: /invite <userId>' })
      return true
    }
    try {
      inviteUserToChannel(userId)
      $q.notify({ type: 'positive', message: `Invited ${userId}` })
    } catch (err) {
      $q.notify({ type: 'negative', message: getErrorMessage(err) })
    }
    return true
  }

  const handleKick = (args: string[]): boolean => {
    const userId = args[0]
    if (!userId) {
      $q.notify({ type: 'warning', message: 'Usage: /kick <userId>' })
      return true
    }
    try {
      const action = kickUserFromChannel(userId)
      if (action === 'kicked') {
        $q.notify({ type: 'positive', message: `Kicked ${userId}` })
      } else {
        $q.notify({ type: 'warning', message: `Voted to ban ${userId}` })
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: getErrorMessage(err) })
    }
    return true
  }

  const handleRevoke = (args: string[]): boolean => {
    const userId = args[0]
    if (!userId) {
      $q.notify({ type: 'warning', message: 'Usage: /revoke <userId>' })
      return true
    }
    try {
      revokeUserFromChannel(userId)
      $q.notify({ type: 'positive', message: `Revoked ${userId}` })
    } catch (err) {
      $q.notify({ type: 'negative', message: getErrorMessage(err) })
    }
    return true
  }

  const handleList = (): boolean => {
    try {
      const members = listChannelMembers()
      if (!members.length) {
        $q.notify({ type: 'info', message: 'No members found' })
      } else {
        $q.notify({ type: 'info', message: `Members: ${members.join(', ')}` })
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: getErrorMessage(err) })
    }
    return true
  }

  return {
    executeCommand,
  }
}
