export type NotificationSetting = 'silent' | 'mentions' | 'all'

export interface UserChannel{
  id: string
  userId: number
  channelId: string
  createdAt: Date
  updatedAt: Date
}
