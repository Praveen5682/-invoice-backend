/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasPayments = await knex.schema.hasTable('payments');
  if (!hasPayments) {
    await knex.schema.createTable('payments', function(table) {
      table.increments('id').primary();
      table.integer('invoice_id').unsigned().notNullable()
        .references('id').inTable('invoices').onDelete('CASCADE');
      table.decimal('amount', 14, 2).notNullable();
      table.enum('method', ['UPI', 'CARD', 'CASH', 'TRANSFER']).notNullable();
      table.string('transaction_id').unique();
      table.enum('status', ['captured', 'refunded', 'failed']).defaultTo('captured');
      table.datetime('payment_date').notNullable();
      table.timestamps(true, true);
    });
  }

  const hasSubscriptions = await knex.schema.hasTable('subscriptions');
  if (!hasSubscriptions) {
    await knex.schema.createTable('subscriptions', function(table) {
      table.increments('id').primary();
      table.integer('client_id').unsigned().notNullable()
        .references('id').inTable('clients').onDelete('CASCADE');
      table.string('plan_name').notNullable();
      table.decimal('amount', 14, 2).notNullable();
      table.enum('status', ['active', 'paused', 'expired']).defaultTo('active');
      table.enum('cycle', ['monthly', 'yearly']).defaultTo('monthly');
      table.date('start_date').notNullable();
      table.date('next_billing_date').notNullable();
      table.timestamps(true, true);
    });
  }

  const hasReminders = await knex.schema.hasTable('reminders');
  if (!hasReminders) {
    await knex.schema.createTable('reminders', function(table) {
      table.increments('id').primary();
      table.integer('invoice_id').unsigned().notNullable()
        .references('id').inTable('invoices').onDelete('CASCADE');
      table.enum('type', ['email', 'whatsapp']).defaultTo('email');
      table.datetime('reminder_date').notNullable();
      table.datetime('last_sent');
      table.enum('status', ['pending', 'sent', 'failed']).defaultTo('pending');
      table.timestamps(true, true);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('reminders');
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('payments');
};
