import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Channel from './channel.js'

export default class TypingStatus extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare channelId: string

  @belongsTo(() => Channel)
  declare channel: BelongsTo<typeof Channel>

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare text?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
