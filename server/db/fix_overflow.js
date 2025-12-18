import pg from 'pg';
const { Client } = pg;

// Use the public connection string provided by the user
const connectionString = 'postgresql://postgres:ffQtMPgmgmcrSsDJCJStgvTaWWHJgjvn@shuttle.proxy.rlwy.net:25271/railway';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const ALTER_TABLE_SQL = `
  ALTER TABLE finance_applications 
  ALTER COLUMN student_income TYPE DECIMAL(15, 2),
  ALTER COLUMN guarantor_income TYPE DECIMAL(15, 2);
`;

async function run() {
    try {
        console.log('🔄 Connecting to Railway DB to fix overflow...');
        await client.connect();
        console.log('✅ Connected to Railway DB');

        console.log('🔄 Altering table columns to DECIMAL(15, 2)...');
        await client.query(ALTER_TABLE_SQL);
        console.log('✅ Columns updated successfully. Overflow fixed.');

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

run();
