import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Message from './message.js'
import UserChannel from './user_channel.js'
import { randomUUID } from 'node:crypto'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(channel: Channel) {
    channel.id = randomUUID()
  }

  @column()
  declare channelName: string

  @column()
  declare isPublic: boolean

  @column()
  declare adminId: number

  @belongsTo(() => User, { foreignKey: 'adminId' })
  declare admin: BelongsTo<typeof User>

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  @hasMany(() => UserChannel)
  declare userChannels: HasMany<typeof UserChannel>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare lastMessage: DateTime
}
