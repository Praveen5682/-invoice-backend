/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const tables = ['clients', 'invoices', 'products', 'payments', 'subscriptions', 'reminders'];
  
  for (const tableName of tables) {
    const hasTable = await knex.schema.hasTable(tableName);
    if (hasTable) {
      const hasColumn = await knex.schema.hasColumn(tableName, 'user_id');
      if (!hasColumn) {
        await knex.schema.alterTable(tableName, function(table) {
          table.integer('user_id').unsigned().nullable()
            .references('id').inTable('users').onDelete('CASCADE');
        });
      }
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const tables = ['reminders', 'subscriptions', 'payments', 'products', 'invoices', 'clients'];
  
  for (const tableName of tables) {
    const hasTable = await knex.schema.hasTable(tableName);
    if (hasTable) {
      const hasColumn = await knex.schema.hasColumn(tableName, 'user_id');
      if (hasColumn) {
        await knex.schema.alterTable(tableName, function(table) {
          table.dropColumn('user_id');
        });
      }
    }
  }
};
