// ═══════════════════════════════════════════════════════════
// AUTOMATIC CLASSIFICATION LOGIC
// ═══════════════════════════════════════════════════════════

const ELIGIBLE_COUNTRIES = [
    'brazil', 'paraguay', 'argentina', 'chile', 'uruguay',
    'mexico', 'costa_rica', 'el_salvador', 'guatemala'
];

/**
 * Calculate age from birthdate
 */
function calculateAge(birthdate) {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Check if all guarantor fields are completed
 */
function isGuarantorComplete(data) {
    const requiredFields = [
        'guarantor_name',
        'guarantor_email',
        'guarantor_phone',
        'guarantor_birthdate',
        'guarantor_address',
        'guarantor_postal',
        'guarantor_occupation',
        'guarantor_relationship'
    ];

    return requiredFields.every(field => data[field] && data[field].toString().trim() !== '');
}

/**
 * Classify application based on business rules
 * 
 * OUT_OF_PROFILE if:
 * - Student age < 18
 * - Country not eligible
 * - Short duration selected
 * - Entry < 30%
 * - Missing mandatory guarantor data
 * 
 * PRE_APPROVED_UNDER_REVIEW if:
 * - Age ≥ 18
 * - Eligible country
 * - Long duration
 * - Entry ≥ 30%
 * - Guarantor fully completed
 * - Student or guarantor income provided
 * 
 * UNDER_ANALYSIS for all other valid edge cases
 */
export function classifyApplication(data) {
    const studentAge = calculateAge(data.student_birthdate);
    const entryPercent = parseFloat(data.entryPercent || data.entry_percent || 0);
    const country = data.country.toLowerCase();
    const duration = data.duration || data.duration_choice;
    const guarantorComplete = isGuarantorComplete(data);
    const hasIncome = (data.student_income && parseFloat(data.student_income) > 0) ||
        (data.guarantor_income && parseFloat(data.guarantor_income) > 0);

    // OUT_OF_PROFILE conditions
    if (studentAge < 18) {
        return 'OUT_OF_PROFILE';
    }

    if (!ELIGIBLE_COUNTRIES.includes(country)) {
        return 'OUT_OF_PROFILE';
    }

    if (duration === 'short') {
        return 'OUT_OF_PROFILE';
    }

    if (entryPercent < 0.30) {
        return 'OUT_OF_PROFILE';
    }

    if (!guarantorComplete) {
        return 'OUT_OF_PROFILE';
    }

    // PRE_APPROVED_UNDER_REVIEW conditions
    if (
        studentAge >= 18 &&
        ELIGIBLE_COUNTRIES.includes(country) &&
        duration === 'long' &&
        entryPercent >= 0.30 &&
        guarantorComplete &&
        hasIncome
    ) {
        return 'PRE_APPROVED_UNDER_REVIEW';
    }

    // All other valid cases
    return 'UNDER_ANALYSIS';
}
