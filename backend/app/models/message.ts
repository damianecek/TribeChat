import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Channel from './channel.js'
import User from './user.js'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare channelId: number

  @belongsTo(() => Channel)
  declare channel: BelongsTo<typeof Channel>

  @column()
  declare authorId: number

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  @column()
  declare recipientId?: number | null

  @belongsTo(() => User, { foreignKey: 'recipientId' })
  declare recipient: BelongsTo<typeof User>

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
