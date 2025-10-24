export type MemberStatus = 'Online' | 'Away' | 'Offline' | 'DND'

export interface Member {
  id: string | number
  name: string
  status: MemberStatus
  icon?: string
}
