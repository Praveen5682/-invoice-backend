const knex = require('knex');
const config = {
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: 'praveen',
    database: 'Invoicing'
  }
};

const db = knex(config);

async function updateDb() {
  try {
    console.log("Updating users table...");
    const [columns] = await db.raw("SHOW COLUMNS FROM users");
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('company_name')) {
        await db.raw("ALTER TABLE users ADD COLUMN company_name VARCHAR(255)");
        console.log("Added company_name");
    }
    if (!columnNames.includes('gst_number')) {
        await db.raw("ALTER TABLE users ADD COLUMN gst_number VARCHAR(100)");
        console.log("Added gst_number");
    }
    if (!columnNames.includes('address')) {
        await db.raw("ALTER TABLE users ADD COLUMN address TEXT");
        console.log("Added address");
    }
    if (!columnNames.includes('phone')) {
        await db.raw("ALTER TABLE users ADD COLUMN phone VARCHAR(20)");
        console.log("Added phone");
    }
    
    console.log("Ensuring reminders table exists...");
    await db.raw(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        type ENUM('email', 'whatsapp') DEFAULT 'email',
        reminder_date DATETIME NOT NULL,
        last_sent DATETIME,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Reminders table ready.");

    console.log("Database update successful!");
  } catch (err) {
    console.error("Database update failed:", err.message);
  } finally {
    await db.destroy();
  }
}

updateDb();
