import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blacklists'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(['user_id', 'channel_id'])
      table.integer('user_id').unsigned().references('users.id')
      table.string('channel_id').references('channels.id')
      table.boolean('is_permanent')

      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
