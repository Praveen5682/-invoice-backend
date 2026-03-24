exports.up = function (knex) {
  return knex.schema.createTable("tickets", (table) => {
    table.increments("ticket_id").primary();

    table.integer("seat_number").notNullable().unique();

    table.enu("status", ["OPEN", "CLOSED"]).notNullable().defaultTo("OPEN");

    table.string("user_name");
    table.string("user_email");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Index for performance
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tickets");
};
