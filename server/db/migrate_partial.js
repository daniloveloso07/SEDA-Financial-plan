// ═══════════════════════════════════════════════════════════
// DATABASE MIGRATION: Partial Applications & NULL constraints
// ═══════════════════════════════════════════════════════════

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🚀 Starting migration...');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Adding missing columns...');
        await client.query(`
      ALTER TABLE finance_applications 
      ADD COLUMN IF NOT EXISTS is_partial BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

        console.log('Relaxing NOT NULL constraints...');
        const columnsToRelax = [
            'campus', 'shift', 'price_base', 'entry_percent', 'entry_amount',
            'installments', 'interest_percent', 'financed_amount', 'total_financed',
            'monthly_installment', 'student_name', 'student_phone', 'student_birthdate',
            'student_id', 'student_address', 'student_postal', 'student_occupation',
            'travel_date', 'country', 'duration_choice', 'guarantor_name',
            'guarantor_email', 'guarantor_phone', 'guarantor_birthdate',
            'guarantor_id', 'guarantor_address', 'guarantor_postal',
            'guarantor_occupation', 'guarantor_relationship'
        ];

        for (const col of columnsToRelax) {
            await client.query(`ALTER TABLE finance_applications ALTER COLUMN ${col} DROP NOT NULL;`);
        }

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
