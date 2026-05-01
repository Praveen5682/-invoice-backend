exports.up = async function (knex) {
  // Check if we are using PostgreSQL
  if (knex.client.config.client === "pg" || knex.client.config.client === "postgresql") {
    // 1. Drop index if exists (Knex typically names it tickets_status_index)
    await knex.raw('DROP INDEX IF EXISTS tickets_status_index');
    
    // 2. Drop default
    await knex.raw('ALTER TABLE "tickets" ALTER COLUMN "status" DROP DEFAULT');
    
    // 3. Drop check constraint if exists (Knex typically names it tickets_status_check)
    await knex.raw('ALTER TABLE "tickets" DROP CONSTRAINT IF EXISTS tickets_status_check');

    // 4. Alter type with USING clause to convert 'OPEN' -> 0, 'CLOSED' -> 1
    await knex.raw(`
      ALTER TABLE "tickets" 
      ALTER COLUMN "status" TYPE integer 
      USING (CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END)
    `);

    // 5. Set new default and not null
    await knex.raw('ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 0');
    await knex.raw('ALTER TABLE "tickets" ALTER COLUMN "status" SET NOT NULL');

    // 6. Re-create index
    await knex.schema.alterTable("tickets", (table) => {
      table.index(["status"]);
    });
  } else {
    // Fallback for other databases (MySQL, etc.)
    return knex.schema.alterTable("tickets", (table) => {
      table.integer("status").notNullable().defaultTo(0).alter();
    });
  }
};

exports.down = async function (knex) {
  if (knex.client.config.client === "pg" || knex.client.config.client === "postgresql") {
    // 1. Drop index
    await knex.raw('DROP INDEX IF EXISTS tickets_status_index');
    
    // 2. Drop default
    await knex.raw('ALTER TABLE "tickets" ALTER COLUMN "status" DROP DEFAULT');
    
    // 3. Alter type back to text
    await knex.raw(`
      ALTER TABLE "tickets" 
      ALTER COLUMN "status" TYPE text 
      USING (CASE WHEN status = 1 THEN 'CLOSED' ELSE 'OPEN' END)
    `);
    
    // 4. Set old default and not null
    await knex.raw("ALTER TABLE \"tickets\" ALTER COLUMN \"status\" SET DEFAULT 'OPEN'");
    await knex.raw('ALTER TABLE "tickets" ALTER COLUMN "status" SET NOT NULL');
    
    // 5. Re-add check constraint
    await knex.raw("ALTER TABLE \"tickets\" ADD CONSTRAINT tickets_status_check CHECK (status IN ('OPEN', 'CLOSED'))");

    // 6. Re-create index
    await knex.schema.alterTable("tickets", (table) => {
      table.index(["status"]);
    });
  } else {
    return knex.schema.alterTable("tickets", (table) => {
      table
        .enu("status", ["OPEN", "CLOSED"])
        .notNullable()
        .defaultTo("OPEN")
        .alter();
    });
  }
};
