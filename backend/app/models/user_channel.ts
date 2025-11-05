import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Channel from './channel.js'

export default class UserChannel extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(userChannel: UserChannel) {
    userChannel.id = randomUUID()
  }

  @column()
  declare userId: number

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @column()
  declare channelId: string

  @belongsTo(() => Channel, { foreignKey: 'channelId' })
  declare channel: BelongsTo<typeof Channel>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
