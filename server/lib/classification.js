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
 * - Entry < 30%
 * - Missing mandatory guarantor data
 * - Installment > 30% of combined income (Income Ratio Rule)
 * 
 * PRE_APPROVED_UNDER_REVIEW if:
 * - Basic profile met
 * - Income Ratio Rule satisfied (Installment <= 30% of income)
 * 
 * UNDER_ANALYSIS for all other valid edge cases or if 30% rule is slightly breached.
 */
export function classifyApplication(data) {
    const studentAge = calculateAge(data.student_birthdate);
    const entryPercent = parseFloat(data.entryPercent || data.entry_percent || 0.30);
    const country = (data.country || '').toLowerCase();
    const duration = data.duration || data.duration_choice || 'long';
    const guarantorComplete = isGuarantorComplete(data);

    // Incomes in EUR
    const studentIncomeEUR = parseFloat(data.student_income_eur_est || 0);
    const guarantorIncomeEUR = parseFloat(data.guarantor_income_eur_est || 0);
    const combinedIncomeEUR = studentIncomeEUR + guarantorIncomeEUR;

    const monthlyInstallment = parseFloat(data.monthlyInstallment || 0);

    // Relationship status
    const isFirstDegree = ['father', 'mother'].includes(data.guarantor_relationship);

    // 1. Hard Stoppers (OUT_OF_PROFILE)
    if (studentAge < 18) return 'OUT_OF_PROFILE';
    if (!ELIGIBLE_COUNTRIES.includes(country)) return 'OUT_OF_PROFILE';
    if (entryPercent < 0.29) return 'OUT_OF_PROFILE'; // Allow for slight rounding
    if (!guarantorComplete) return 'OUT_OF_PROFILE';

    // 2. Income Ratio Rule (The 30% Rule)
    // If monthly installment is more than 30% of combined income
    const incomeRatio = combinedIncomeEUR > 0 ? (monthlyInstallment / combinedIncomeEUR) : 999;

    if (incomeRatio > 0.30) {
        // If it's a first degree relative, we move to UNDER_ANALYSIS instead of rejection
        if (isFirstDegree && incomeRatio <= 0.45) {
            return 'UNDER_ANALYSIS';
        }
        return 'OUT_OF_PROFILE';
    }

    // 3. Success Case
    if (combinedIncomeEUR > 0) {
        return 'PRE_APPROVED_UNDER_REVIEW';
    }

    return 'UNDER_ANALYSIS';
}
