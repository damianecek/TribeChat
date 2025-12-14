export interface Channel {
  id: string
  channelName: string
  isPublic: boolean
  adminId: number | undefined
  createdAt?: Date
  updatedAt?: Date
  lastMessage?: Date
}
