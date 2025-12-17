// ═══════════════════════════════════════════════════════════
// APPLICATIONS API ROUTE
// ═══════════════════════════════════════════════════════════

import express from 'express';
import { insertApplication, initializeDatabase } from '../db/database.js';
import { classifyApplication } from '../lib/classification.js';
import { calculateFinancePlan } from '../lib/calculator.js';
import { sendApplicantEmail, sendInternalEmail } from '../lib/email.js';

const router = express.Router();

// Initialize database on module load
initializeDatabase().catch(console.error);

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
            'student_birthdate', 'student_address', 'student_postal',
            'student_occupation', 'travel_date', 'country', 'duration',
            'guarantor_name', 'guarantor_email', 'guarantor_phone',
            'guarantor_birthdate', 'guarantor_address', 'guarantor_postal',
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
            // Use data from calculator if provided, otherwise use defaults
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
            student_address: data.student_address,
            student_postal: data.student_postal,
            student_occupation: data.student_occupation,
            student_income: data.student_income || null,
            travel_date: data.travel_date,
            country: data.country,
            duration: data.duration,
            guarantor_name: data.guarantor_name,
            guarantor_email: data.guarantor_email,
            guarantor_phone: data.guarantor_phone,
            guarantor_birthdate: data.guarantor_birthdate,
            guarantor_address: data.guarantor_address,
            guarantor_postal: data.guarantor_postal,
            guarantor_occupation: data.guarantor_occupation,
            guarantor_relationship: data.guarantor_relationship,
            guarantor_income: data.guarantor_income || null
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
            // Don't fail the request if emails fail
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
