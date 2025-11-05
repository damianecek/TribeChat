import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('channel_id').references('channels.id')
      table.integer('author_id').unsigned().references('users.id')
      table.integer('recipient_id').unsigned().references('users.id')
      table.string('content')
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
