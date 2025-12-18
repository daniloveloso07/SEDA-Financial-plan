// ═══════════════════════════════════════════════════════════
// APPLICATIONS API ROUTE
// ═══════════════════════════════════════════════════════════

import express from 'express';
import { insertApplication, initializeDatabase } from '../db/database.js';
import { classifyApplication } from '../lib/classification.js';
import { calculateFinancePlan } from '../lib/calculator.js';
import { sendApplicantEmail, sendInternalEmail } from '../lib/email.js';
import { convertToEUR } from '../lib/fx-service.js';

const router = express.Router();

// Currency mapping for backend (same as frontend)
const CURRENCY_BY_COUNTRY = {
    'brazil': 'BRL',
    'paraguay': 'PYG',
    'argentina': 'ARS',
    'chile': 'CLP',
    'uruguay': 'UYU',
    'mexico': 'MXN',
    'costa_rica': 'CRC',
    'el_salvador': 'USD',
    'guatemala': 'GTQ'
};

/**
 * POST /api/applications
 * Submit a new finance plan application
 */
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Validate required fields
        const requiredFields = [
            'language', 'student_name', 'student_email', 'student_phone',
            'student_birthdate', 'student_id', 'student_address', 'student_postal',
            'student_occupation', 'travel_date', 'country', 'duration',
            'guarantor_name', 'guarantor_email', 'guarantor_phone',
            'guarantor_birthdate', 'guarantor_id', 'guarantor_address', 'guarantor_postal',
            'guarantor_occupation', 'guarantor_relationship'
        ];

        for (const field of requiredFields) {
            if (!data[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`
                });
            }
        }

        // Recalculate finance plan on server side (don't trust client data)
        let financePlan;
        try {
            const campus = data.campus || 'dublin';
            const shift = data.shift || 'am';
            const entryPercent = data.entryPercent || data.entry_percent || 0.30;
            const installments = data.installments || 12;

            financePlan = calculateFinancePlan(campus, shift, entryPercent, installments);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid calculator parameters'
            });
        }

        // Helper to sanitize currency string to number
        const sanitizeCurrency = (val) => {
            if (!val) return null;
            if (typeof val === 'number') return val;
            // Remove 'R$', '€', whitespace
            let str = val.toString().replace(/[^\d.,-]/g, '');
            // Check formatted style: 100.000,00 (EU/BR) vs 100,000.00 (US)
            if (str.includes(',') && str.includes('.')) {
                if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
                    // 100.000,00 -> Remove dots, replace comma with dot
                    str = str.replace(/\./g, '').replace(',', '.');
                } else {
                    // 100,000.00 -> Remove commas (standard JS parsable if we remove commas)
                    str = str.replace(/,/g, '');
                }
            } else if (str.includes(',')) {
                // 100,00 -> Replace comma with dot
                str = str.replace(',', '.');
            }
            return parseFloat(str) || null;
        };

        const studentIncomeClean = sanitizeCurrency(data.student_income);
        const guarantorIncomeClean = sanitizeCurrency(data.guarantor_income);

        // Handle FX conversion for incomes
        const currencyCode = CURRENCY_BY_COUNTRY[data.country] || 'USD';

        let studentFX = { amountEUR: null };
        let guarantorFX = { amountEUR: null };
        let fxMetadata = { rate: null, date: null };

        // FX Conversion with fallback
        try {
            if (studentIncomeClean) {
                studentFX = await convertToEUR(studentIncomeClean, currencyCode);
                fxMetadata.rate = studentFX.rate;
                fxMetadata.date = studentFX.date;
            }

            if (guarantorIncomeClean) {
                guarantorFX = await convertToEUR(guarantorIncomeClean, currencyCode);
                // Use guarantor FX if student FX failed or wasn't provided
                if (!fxMetadata.rate) {
                    fxMetadata.rate = guarantorFX.rate;
                    fxMetadata.date = guarantorFX.date;
                }
            }
        } catch (fxError) {
            console.warn('⚠️ FX Service failed (continuing without FX data):', fxError.message);
            // Application proceeds without FX data
        }

        // Classify application
        const status = classifyApplication({
            ...data,
            ...financePlan
        });

        // Prepare application data for database
        const applicationData = {
            language: data.language,
            status,
            ...financePlan,
            student_name: data.student_name,
            student_email: data.student_email,
            student_phone: data.student_phone,
            student_birthdate: data.student_birthdate,
            student_id: data.student_id,
            student_address: data.student_address,
            student_postal: data.student_postal,
            student_occupation: data.student_occupation,
            student_income: studentIncomeClean,
            student_income_currency: currencyCode,
            student_income_eur_est: studentFX.amountEUR,
            travel_date: data.travel_date,
            country: data.country,
            duration: data.duration,
            guarantor_name: data.guarantor_name,
            guarantor_email: data.guarantor_email,
            guarantor_phone: data.guarantor_phone,
            guarantor_birthdate: data.guarantor_birthdate,
            guarantor_id: data.guarantor_id,
            guarantor_address: data.guarantor_address,
            guarantor_postal: data.guarantor_postal,
            guarantor_occupation: data.guarantor_occupation,
            guarantor_relationship: data.guarantor_relationship,
            guarantor_income: guarantorIncomeClean,
            guarantor_income_currency: currencyCode,
            guarantor_income_eur_est: guarantorFX.amountEUR,
            fx_rate: fxMetadata.rate,
            fx_date: fxMetadata.date
        };

        // Insert into database
        const result = await insertApplication(applicationData);

        // Prepare response data
        const responseData = {
            id: result.id,
            created_at: result.created_at,
            status,
            ...financePlan,
            student_name: data.student_name,
            student_email: data.student_email,
            country: data.country,
            duration_choice: data.duration
        };

        // Send emails (don't wait for completion)
        Promise.all([
            sendApplicantEmail(responseData, data.language),
            sendInternalEmail({
                ...responseData,
                ...applicationData
            })
        ]).catch(error => {
            console.error('Email sending error:', error);
        });

        // Return success response
        res.status(201).json({
            success: true,
            ...responseData
        });

    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your application. Please try again.'
        });
    }
});

export default router;
