// ═══════════════════════════════════════════════════════════
// DATABASE SCHEMA AND INITIALIZATION
// ═══════════════════════════════════════════════════════════

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

console.log(`[DB] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[DB] DATABASE_URL is ${process.env.DATABASE_URL ? 'defined' : 'UNDEFINED'}`);
if (process.env.DATABASE_URL) {
  console.log(`[DB] DATABASE_URL length: ${process.env.DATABASE_URL.length}`);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000 // Timeout after 5 seconds to debug hangs
});

pool.on('connect', () => {
  console.log('[DB] Pool connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
});

// Database schema
const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS finance_applications (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Application metadata
  language VARCHAR(5) NOT NULL,
  status VARCHAR(50) NOT NULL,
  is_partial BOOLEAN DEFAULT FALSE,
  
  -- Financial data
  campus VARCHAR(20),
  shift VARCHAR(5),
  price_base DECIMAL(10, 2),
  entry_percent DECIMAL(5, 2),
  entry_amount DECIMAL(10, 2),
  installments INTEGER,
  interest_percent DECIMAL(5, 2),
  financed_amount DECIMAL(10, 2),
  total_financed DECIMAL(10, 2),
  monthly_installment DECIMAL(10, 2),
  
  -- Student information
  student_name VARCHAR(255),
  student_email VARCHAR(255) NOT NULL,
  student_phone VARCHAR(50),
  student_birthdate DATE,
  student_id VARCHAR(100),
  student_address TEXT,
  student_postal VARCHAR(50),
  student_occupation VARCHAR(255),
  student_income DECIMAL(15, 2),
  student_income_currency VARCHAR(10),
  student_income_eur_est DECIMAL(10, 2),
  travel_date DATE,
  country VARCHAR(50),
  duration_choice VARCHAR(20),
  
  -- Guarantor information
  guarantor_name VARCHAR(255),
  guarantor_email VARCHAR(255),
  guarantor_phone VARCHAR(50),
  guarantor_birthdate DATE,
  guarantor_id VARCHAR(100),
  guarantor_address TEXT,
  guarantor_postal VARCHAR(50),
  guarantor_occupation VARCHAR(255),
  guarantor_relationship VARCHAR(50),
  guarantor_income DECIMAL(15, 2),
  guarantor_income_currency VARCHAR(10),
  guarantor_income_eur_est DECIMAL(10, 2),
  
  -- FX metadata
  fx_rate DECIMAL(18, 10),
  fx_date VARCHAR(20)
);
`;

// Initialize database
export async function initializeDatabase() {
  try {
    await pool.query(CREATE_TABLE_SQL);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Insert or Update application (Upsert)
export async function insertApplication(data) {
  const isPartial = data.is_partial || false;

  let query, values;

  if (data.id) {
    // Update existing
    query = `
      UPDATE finance_applications SET
        language = $1, status = $2, is_partial = $3, campus = $4, shift = $5, 
        price_base = $6, entry_percent = $7, entry_amount = $8, installments = $9, 
        interest_percent = $10, financed_amount = $11, total_financed = $12, 
        monthly_installment = $13, student_name = $14, student_email = $15, 
        student_phone = $16, student_birthdate = $17, student_id = $18, 
        student_address = $19, student_postal = $20, student_occupation = $21, 
        student_income = $22, student_income_currency = $23, student_income_eur_est = $24, 
        travel_date = $25, country = $26, duration_choice = $27, guarantor_name = $28, 
        guarantor_email = $29, guarantor_phone = $30, guarantor_birthdate = $31, 
        guarantor_id = $32, guarantor_address = $33, guarantor_postal = $34, 
        guarantor_occupation = $35, guarantor_relationship = $36, guarantor_income = $37, 
        guarantor_income_currency = $38, guarantor_income_eur_est = $39, fx_rate = $40, 
        fx_date = $41, updated_at = CURRENT_TIMESTAMP
      WHERE id = $42
      RETURNING id, created_at, updated_at
    `;
    values = [...getValuesArray(data), data.id];
  } else {
    // New insert
    query = `
      INSERT INTO finance_applications (
        language, status, is_partial, campus, shift, price_base, entry_percent, entry_amount,
        installments, interest_percent, financed_amount, total_financed, monthly_installment,
        student_name, student_email, student_phone, student_birthdate, student_id, student_address,
        student_postal, student_occupation, student_income, student_income_currency, student_income_eur_est,
        travel_date, country, duration_choice,
        guarantor_name, guarantor_email, guarantor_phone, guarantor_birthdate, guarantor_id, guarantor_address,
        guarantor_postal, guarantor_occupation, guarantor_relationship, guarantor_income, guarantor_income_currency, guarantor_income_eur_est,
        fx_rate, fx_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
      ) RETURNING id, created_at, updated_at
    `;
    values = getValuesArray(data);
  }

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

function getValuesArray(data) {
  return [
    data.language || 'pt',
    data.status || 'ABANDONED_CART',
    data.is_partial ?? true,
    data.campus || null,
    data.shift || null,
    data.priceBase || null,
    data.entryPercent || null,
    data.entryAmount || null,
    data.installments || null,
    data.interestPercent || null,
    data.financedAmount || null,
    data.totalFinanced || null,
    data.monthlyInstallment || null,
    data.student_name || null,
    data.student_email,
    data.student_phone || null,
    data.student_birthdate || null,
    data.student_id || null,
    data.student_address || null,
    data.student_postal || null,
    data.student_occupation || null,
    data.student_income || null,
    data.student_income_currency || null,
    data.student_income_eur_est || null,
    data.travel_date || null,
    data.country || null,
    data.duration || null,
    data.guarantor_name || null,
    data.guarantor_email || null,
    data.guarantor_phone || null,
    data.guarantor_birthdate || null,
    data.guarantor_id || null,
    data.guarantor_address || null,
    data.guarantor_postal || null,
    data.guarantor_occupation || null,
    data.guarantor_relationship || null,
    data.guarantor_income || null,
    data.guarantor_income_currency || null,
    data.guarantor_income_eur_est || null,
    data.fx_rate || null,
    data.fx_date || null
  ];
}

export default pool;
