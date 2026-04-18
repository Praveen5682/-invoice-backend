/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('clients', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('phone');
      table.text('address');
      table.timestamps(true, true);
    })
    .createTable('invoices', function(table) {
      table.increments('id').primary();
      table.string('invoice_no').unique().notNullable();
      table.integer('client_id').unsigned().notNullable()
        .references('id').inTable('clients').onDelete('CASCADE');
      table.enum('status', ['paid', 'pending', 'overdue', 'draft']).defaultTo('pending');
      table.decimal('total_amount', 14, 2).defaultTo(0);
      table.date('issue_date').notNullable();
      table.date('due_date');
      table.text('notes');
      table.timestamps(true, true);
    })
    .createTable('invoice_items', function(table) {
      table.increments('id').primary();
      table.integer('invoice_id').unsigned().notNullable()
        .references('id').inTable('invoices').onDelete('CASCADE');
      table.string('description').notNullable();
      table.integer('quantity').defaultTo(1);
      table.decimal('unit_price', 14, 2).notNullable();
      table.decimal('amount', 14, 2).notNullable();
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('invoice_items')
    .dropTableIfExists('invoices')
    .dropTableIfExists('clients');
};
