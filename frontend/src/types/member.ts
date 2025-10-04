export type MemberStatus = 'Online' | 'Away' | 'Offline'

export interface Member {
  id: string | number
  name: string
  status: MemberStatus
  icon?: string
}
