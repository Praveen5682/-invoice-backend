exports.up = function (knex) {
  return knex.schema.alterTable("tickets", (table) => {
    table.integer("status").notNullable().defaultTo(0).alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tickets", (table) => {
    table
      .enu("status", ["OPEN", "CLOSED"])
      .notNullable()
      .defaultTo("OPEN")
      .alter();
  });
};
