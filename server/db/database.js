// ═══════════════════════════════════════════════════════════
// DATABASE SCHEMA AND INITIALIZATION
// ═══════════════════════════════════════════════════════════

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Database schema
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

// Insert application
export async function insertApplication(data) {
  const query = `
    INSERT INTO finance_applications (
      language, status, campus, shift, price_base, entry_percent, entry_amount,
      installments, interest_percent, financed_amount, total_financed, monthly_installment,
      student_name, student_email, student_phone, student_birthdate, student_id, student_address,
      student_postal, student_occupation, student_income, student_income_currency, student_income_eur_est,
      travel_date, country, duration_choice,
      guarantor_name, guarantor_email, guarantor_phone, guarantor_birthdate, guarantor_id, guarantor_address,
      guarantor_postal, guarantor_occupation, guarantor_relationship, guarantor_income, guarantor_income_currency, guarantor_income_eur_est,
      fx_rate, fx_date
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
      $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40
    ) RETURNING id, created_at
  `;

  const values = [
    data.language,
    data.status,
    data.campus,
    data.shift,
    data.priceBase,
    data.entryPercent,
    data.entryAmount,
    data.installments,
    data.interestPercent,
    data.financedAmount,
    data.totalFinanced,
    data.monthlyInstallment,
    data.student_name,
    data.student_email,
    data.student_phone,
    data.student_birthdate,
    data.student_id,
    data.student_address,
    data.student_postal,
    data.student_occupation,
    data.student_income || null,
    data.student_income_currency || null,
    data.student_income_eur_est || null,
    data.travel_date,
    data.country,
    data.duration,
    data.guarantor_name,
    data.guarantor_email,
    data.guarantor_phone,
    data.guarantor_birthdate,
    data.guarantor_id,
    data.guarantor_address,
    data.guarantor_postal,
    data.guarantor_occupation,
    data.guarantor_relationship,
    data.guarantor_income || null,
    data.guarantor_income_currency || null,
    data.guarantor_income_eur_est || null,
    data.fx_rate || null,
    data.fx_date || null
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database insert error:', error);
    throw error;
  }
}

export default pool;
