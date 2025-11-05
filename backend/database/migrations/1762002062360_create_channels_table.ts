import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('channel_name')
      table.boolean('is_public')
      table.integer('admin_id').unsigned().references('users.id')

      table.timestamps(true)
      table.timestamp('last_message')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
