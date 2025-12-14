import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Channel from './channel.js'
import Message from './message.js'
import UserChannel from './user_channel.js'
import Blacklist from './blacklist.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'nickname'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare nickname: string

  @column()
  declare email: string

  @column()
  declare status: string

  @column({ serializeAs: null })
  declare password: string

  @hasMany(() => Channel, { foreignKey: 'adminId' })
  declare ownedChannels: HasMany<typeof Channel>

  @hasMany(() => Message, { foreignKey: 'authorId' })
  declare messages: HasMany<typeof Message>

  @hasMany(() => UserChannel)
  declare userChannels: HasMany<typeof UserChannel>

  @hasMany(() => Blacklist)
  declare blacklistEntries: HasMany<typeof Blacklist>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
