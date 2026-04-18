const db = require("./config/db");

async function resetMigrations() {
  try {
    console.log("Dropping migration tables...");
    await db.schema.dropTableIfExists("knex_migrations");
    await db.schema.dropTableIfExists("knex_migrations_lock");
    console.log("Migration tables dropped successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting migrations:", error);
    process.exit(1);
  }
}

resetMigrations();
