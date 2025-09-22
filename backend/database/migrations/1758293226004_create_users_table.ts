import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // primárny kľúč
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('nickname').notNullable().unique()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.timestamps(true) // created_at, updated_at
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
