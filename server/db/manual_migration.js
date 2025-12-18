import pg from 'pg';
const { Client } = pg;

// Use the public connection string provided by the user
const connectionString = 'postgresql://postgres:ffQtMPgmgmcrSsDJCJStgvTaWWHJgjvn@shuttle.proxy.rlwy.net:25271/railway';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS finance_applications (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Application metadata
  language VARCHAR(5) NOT NULL,
  status VARCHAR(50) NOT NULL,
  
  -- Financial data
  campus VARCHAR(20) NOT NULL,
  shift VARCHAR(5) NOT NULL,
  price_base DECIMAL(10, 2) NOT NULL,
  entry_percent DECIMAL(5, 2) NOT NULL,
  entry_amount DECIMAL(10, 2) NOT NULL,
  installments INTEGER NOT NULL,
  interest_percent DECIMAL(5, 2) NOT NULL,
  financed_amount DECIMAL(10, 2) NOT NULL,
  total_financed DECIMAL(10, 2) NOT NULL,
  monthly_installment DECIMAL(10, 2) NOT NULL,
  
  -- Student information
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  student_phone VARCHAR(50) NOT NULL,
  student_birthdate DATE NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  student_address TEXT NOT NULL,
  student_postal VARCHAR(50) NOT NULL,
  student_occupation VARCHAR(255) NOT NULL,
  student_income DECIMAL(10, 2),
  student_income_currency VARCHAR(10),
  student_income_eur_est DECIMAL(10, 2),
  travel_date DATE NOT NULL,
  country VARCHAR(50) NOT NULL,
  duration_choice VARCHAR(20) NOT NULL,
  
  -- Guarantor information
  guarantor_name VARCHAR(255) NOT NULL,
  guarantor_email VARCHAR(255) NOT NULL,
  guarantor_phone VARCHAR(50) NOT NULL,
  guarantor_birthdate DATE NOT NULL,
  guarantor_id VARCHAR(100) NOT NULL,
  guarantor_address TEXT NOT NULL,
  guarantor_postal VARCHAR(50) NOT NULL,
  guarantor_occupation VARCHAR(255) NOT NULL,
  guarantor_relationship VARCHAR(50) NOT NULL,
  guarantor_income DECIMAL(10, 2),
  guarantor_income_currency VARCHAR(10),
  guarantor_income_eur_est DECIMAL(10, 2),
  
  -- FX metadata
  fx_rate DECIMAL(18, 10),
  fx_date VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_applications_email ON finance_applications(student_email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON finance_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON finance_applications(created_at);
`;

async function run() {
    try {
        console.log('🔄 Connecting to Railway DB...');
        await client.connect();
        console.log('✅ Connected to Railway DB');

        console.log('🔄 Creating tables if not exist...');
        await client.query(CREATE_TABLE_SQL);
        console.log('✅ Tables created successfully');

        await client.end();
        console.log('👋 Disconnected');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

run();
