export interface Channel {
  id: string
  channelName: string
  isPublic: boolean
  adminId: number
  createdAt?: Date
  updatedAt?: Date
  lastMessage?: Date
}
