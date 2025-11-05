import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'typing_statuses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(['channel_id', 'user_id'])
      table.string('channel_id').references('channels.id')
      table.integer('user_id').references('users.id')
      table.string('text')

      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
