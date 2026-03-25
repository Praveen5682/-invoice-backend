exports.up = function (knex) {
  return knex.schema.table("tickets", function (table) {
    table.string("user_phone", 20);
  });
};

exports.down = function (knex) {
  return knex.schema.table("tickets", function (table) {
    table.dropColumn("user_phone");
  });
};
